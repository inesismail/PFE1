import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { WattzHubApiClient } from '../wattzhub/wattzhub-api.client';
import { LogsClient } from '../logs/logs.client';
import { ConnectCpoDto, UpdateCpoConnectionDto, AuthType } from './dto/cpo-connection.dto';

@Injectable()
export class CpoConnectionsService {
  private readonly logger = new Logger(CpoConnectionsService.name);
  private readonly apiClients = new Map<string, WattzHubApiClient>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly logs: LogsClient,
  ) {}

  async connect(dto: ConnectCpoDto) {
    const apiClient = new WattzHubApiClient();
    apiClient.configure(dto.baseUrl, dto.accessToken);

    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let tokenExpiresAt: Date | undefined;

    if (dto.authType === AuthType.CREDENTIALS) {
      if (!dto.email || !dto.password) throw new BadRequestException('Email and password required');
      const authResult = await apiClient.authenticate(dto.email, dto.password, dto.tenant);
      accessToken = authResult.accessToken;
      refreshToken = authResult.refreshToken;
      if (authResult.expiresIn) tokenExpiresAt = new Date(Date.now() + authResult.expiresIn * 1000);
    } else if (dto.authType === AuthType.TOKEN) {
      if (!dto.accessToken) throw new BadRequestException('Access token required');
      const isValid = await apiClient.validateToken();
      if (!isValid) throw new BadRequestException('Invalid access token');
      accessToken = dto.accessToken;
    } else {
      throw new BadRequestException(`Unsupported authType: ${dto.authType}`);
    }

    const encryptedPassword = dto.password ? this.encryption.encrypt(dto.password) : undefined;

    const connection = await this.prisma.client.cpoConnection.upsert({
      where: { actorId: dto.actorId },
      create: {
        actorId: dto.actorId,
        baseUrl: dto.baseUrl,
        authUrl: dto.authUrl ?? null,
        authType: dto.authType,
        email: dto.email ?? null,
        encryptedPassword: encryptedPassword ?? null,
        accessToken: accessToken ?? null,
        refreshToken: refreshToken ?? null,
        tokenExpiresAt: tokenExpiresAt ?? null,
        isConnected: true,
        fetchIntervalMinutes: dto.fetchIntervalMinutes ?? 30,
        fetchEnabled: true,
      },
      update: {
        baseUrl: dto.baseUrl,
        authUrl: dto.authUrl ?? null,
        authType: dto.authType,
        email: dto.email ?? null,
        encryptedPassword: encryptedPassword ?? undefined,
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
        tokenExpiresAt: tokenExpiresAt ?? undefined,
        isConnected: true,
        fetchIntervalMinutes: dto.fetchIntervalMinutes ?? 30,
      },
    });

    this.apiClients.set(connection.id, apiClient);
    await this.syncSites(connection.id);

    await this.logs.info('CpoConnection', 'CONNECT', `CPO connected successfully`, {
      actorId: dto.actorId,
      connectionId: connection.id,
      metadata: { authType: dto.authType, baseUrl: dto.baseUrl },
    });

    return this.sanitize(connection);
  }

  async findAll() {
    const connections = await this.prisma.client.cpoConnection.findMany({
      include: { _count: { select: { sites: true } } },
    });
    return connections.map((c) => this.sanitize(c));
  }

  async findById(id: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({
      where: { id },
      include: { sites: { include: { edfRegion: true } } },
    });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${id}`);
    return this.sanitize(connection);
  }

  async update(id: string, dto: UpdateCpoConnectionDto) {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${id}`);
    const data: any = {};
    if (dto.baseUrl) data.baseUrl = dto.baseUrl;
    if (dto.email) data.email = dto.email;
    if (dto.password) data.encryptedPassword = this.encryption.encrypt(dto.password);
    if (dto.accessToken) data.accessToken = dto.accessToken;
    if (dto.fetchIntervalMinutes !== undefined) data.fetchIntervalMinutes = dto.fetchIntervalMinutes;
    if (dto.fetchEnabled !== undefined) data.fetchEnabled = dto.fetchEnabled;
    const updated = await this.prisma.client.cpoConnection.update({ where: { id }, data });
    return this.sanitize(updated);
  }

  async disconnect(id: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${id}`);
    await this.prisma.client.cpoConnection.update({
      where: { id },
      data: { isConnected: false, fetchEnabled: false, accessToken: null, refreshToken: null, tokenExpiresAt: null },
    });
    this.apiClients.delete(id);
    await this.logs.info('CpoConnection', 'DISCONNECT', `CPO disconnected`, {
      actorId: connection.actorId, connectionId: id,
    });
  }

  async delete(id: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${id}`);
    await this.prisma.client.cpoConnection.delete({ where: { id } });
    this.apiClients.delete(id);
  }

  async syncSites(connectionId: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${connectionId}`);
    const apiClient = await this.getApiClient(connectionId);
    const remoteSites = await apiClient.getSiteAreas();
    for (const site of remoteSites) {
      await this.prisma.client.site.upsert({
        where: { cpoConnectionId_externalId: { cpoConnectionId: connectionId, externalId: site.id } },
        create: {
          cpoConnectionId: connectionId,
          externalId: site.id,
          name: site.name,
          address: site.address ?? null,
          maxCapacityKw: site.maxCapacityKw ?? null,
        },
        update: {
          name: site.name,
          address: site.address ?? null,
          maxCapacityKw: site.maxCapacityKw ?? null,
        },
      });
    }
    await this.prisma.client.cpoConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });
    await this.logs.info('CpoConnection', 'SYNC_SITES', `Synced ${remoteSites.length} sites`, {
      connectionId, metadata: { siteCount: remoteSites.length },
    });
    return { synced: remoteSites.length };
  }

  async setSiteLimit(connectionId: string, externalId: string, limitKw: number) {
    const apiClient = await this.getApiClient(connectionId);
    await apiClient.setSiteAreaLimit(externalId, limitKw);
    await this.prisma.client.site.updateMany({
      where: { cpoConnectionId: connectionId, externalId },
      data: { currentLimitKw: limitKw, lastLimitSetAt: new Date() },
    });
  }
  async getActiveConnection() {
  const conn = await this.prisma.client.cpoConnection.findFirst({
    where: { isConnected: true },
  });
  if (!conn) throw new NotFoundException('No active CPO connection found');
  return conn;
}

  async getApiClient(connectionId: string): Promise<WattzHubApiClient> {
    const existing = this.apiClients.get(connectionId);
    if (existing) return existing;
    return this.reconnect(connectionId);
  }

  private async reconnect(connectionId: string): Promise<WattzHubApiClient> {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${connectionId}`);
    const apiClient = new WattzHubApiClient();
    let accessToken = connection.accessToken ?? undefined;
    const isExpired = !!connection.tokenExpiresAt && connection.tokenExpiresAt <= new Date() && !!connection.refreshToken;
    if (isExpired && connection.refreshToken) {
      try {
        const result = await apiClient.refreshAccessToken(connection.refreshToken);
        accessToken = result.accessToken;
        await this.prisma.client.cpoConnection.update({
          where: { id: connectionId },
          data: {
            accessToken,
            refreshToken: result.refreshToken ?? connection.refreshToken,
            tokenExpiresAt: result.expiresIn ? new Date(Date.now() + result.expiresIn * 1000) : null,
          },
        });
      } catch {
        if (connection.email && connection.encryptedPassword) {
          const password = this.encryption.decrypt(connection.encryptedPassword);
          apiClient.configure(connection.baseUrl, undefined);
          const result = await apiClient.authenticate(connection.email, password);
          accessToken = result.accessToken;
          await this.prisma.client.cpoConnection.update({
            where: { id: connectionId },
            data: { accessToken, refreshToken: result.refreshToken ?? null },
          });
        }
      }
    }
    apiClient.configure(connection.baseUrl, accessToken);
    this.apiClients.set(connectionId, apiClient);
    return apiClient;
  }

  private sanitize(connection: any) {
    const { encryptedPassword, accessToken, refreshToken, ...safe } = connection;
    return safe;
  }
}
