import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../encryption/encryption.service';
import { WattzHubApiClient } from '../wattzhub/wattzhub-api.client';
import { LogsClient } from '../logs/logs.client';
import { ActorsClient } from '../actors/actors.client';
import { ConnectCpoDto, UpdateCpoConnectionDto, AuthType } from './dto/cpo-connection.dto';

@Injectable()
export class CpoConnectionsService {
  private readonly logger = new Logger(CpoConnectionsService.name);
  private readonly apiClients = new Map<string, WattzHubApiClient>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly logs: LogsClient,
    private readonly actorsClient: ActorsClient,
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
        tenant: dto.tenant ?? null,
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

    const actor = await this.actorsClient.getById(connection.actorId);
    return { ...this.sanitize(connection), actor: actor || null };
  }

  async findAll() {
    const connections = await this.prisma.client.cpoConnection.findMany({
      include: { _count: { select: { sites: true } } },
    });
    const actorIds = connections.map((c) => c.actorId).filter(Boolean);
    const actorsMap = await this.actorsClient.getByIds(actorIds);
    return connections.map((c) => ({
      ...this.sanitize(c),
      actor: actorsMap.get(c.actorId) || null,
    }));
  }

  async findById(id: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({
      where: { id },
      include: { sites: { include: { region: true } } },
    });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${id}`);
    const actor = await this.actorsClient.getById(connection.actorId);
    return { ...this.sanitize(connection), actor: actor || null };
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
    if (dto.tenant) data.tenant = dto.tenant;
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

  // City / postal-code → region mapping for auto-detection fallback
  private static readonly CITY_TO_REGION: Record<string, string> = {
    'paris': 'Île-de-France', 'gif sur yvette': 'Île-de-France', 'gif-sur-yvette': 'Île-de-France',
    'versailles': 'Île-de-France', 'boulogne-billancourt': 'Île-de-France', 'saint-denis': 'Île-de-France',
    'creteil': 'Île-de-France', 'evry': 'Île-de-France', 'nanterre': 'Île-de-France',
    'lyon': 'Auvergne-Rhône-Alpes', 'grenoble': 'Auvergne-Rhône-Alpes', 'saint-etienne': 'Auvergne-Rhône-Alpes',
    'clermont-ferrand': 'Auvergne-Rhône-Alpes', 'annecy': 'Auvergne-Rhône-Alpes', 'valence': 'Auvergne-Rhône-Alpes',
    'marseille': "Provence-Alpes-Côte d'Azur", 'nice': "Provence-Alpes-Côte d'Azur",
    'toulon': "Provence-Alpes-Côte d'Azur", 'aix-en-provence': "Provence-Alpes-Côte d'Azur",
    'avignon': "Provence-Alpes-Côte d'Azur", 'cannes': "Provence-Alpes-Côte d'Azur",
    'toulouse': 'Occitanie', 'montpellier': 'Occitanie', 'nimes': 'Occitanie', 'perpignan': 'Occitanie',
    'bordeaux': 'Nouvelle-Aquitaine', 'limoges': 'Nouvelle-Aquitaine', 'poitiers': 'Nouvelle-Aquitaine',
    'la rochelle': 'Nouvelle-Aquitaine', 'pau': 'Nouvelle-Aquitaine', 'bayonne': 'Nouvelle-Aquitaine',
    'nantes': 'Pays de la Loire', 'angers': 'Pays de la Loire', 'le mans': 'Pays de la Loire',
    'rennes': 'Bretagne', 'brest': 'Bretagne', 'lorient': 'Bretagne', 'saint-brieuc': 'Bretagne',
    'strasbourg': 'Grand Est', 'metz': 'Grand Est', 'nancy': 'Grand Est', 'reims': 'Grand Est', 'mulhouse': 'Grand Est',
    'lille': 'Hauts-de-France', 'amiens': 'Hauts-de-France', 'roubaix': 'Hauts-de-France', 'dunkerque': 'Hauts-de-France',
    'rouen': 'Normandie', 'le havre': 'Normandie', 'caen': 'Normandie',
    'dijon': 'Bourgogne-Franche-Comté', 'besancon': 'Bourgogne-Franche-Comté',
    'orleans': 'Centre-Val de Loire', 'tours': 'Centre-Val de Loire', 'bourges': 'Centre-Val de Loire',
    'ajaccio': 'Corse', 'bastia': 'Corse',
  };

  // Postal code prefix → region (first 2 digits of French postal code)
  private static readonly POSTAL_TO_REGION: Record<string, string> = {
    '75': 'Île-de-France', '77': 'Île-de-France', '78': 'Île-de-France',
    '91': 'Île-de-France', '92': 'Île-de-France', '93': 'Île-de-France',
    '94': 'Île-de-France', '95': 'Île-de-France',
    '01': 'Auvergne-Rhône-Alpes', '03': 'Auvergne-Rhône-Alpes', '07': 'Auvergne-Rhône-Alpes',
    '15': 'Auvergne-Rhône-Alpes', '26': 'Auvergne-Rhône-Alpes', '38': 'Auvergne-Rhône-Alpes',
    '42': 'Auvergne-Rhône-Alpes', '43': 'Auvergne-Rhône-Alpes', '63': 'Auvergne-Rhône-Alpes',
    '69': 'Auvergne-Rhône-Alpes', '73': 'Auvergne-Rhône-Alpes', '74': 'Auvergne-Rhône-Alpes',
    '04': "Provence-Alpes-Côte d'Azur", '05': "Provence-Alpes-Côte d'Azur",
    '06': "Provence-Alpes-Côte d'Azur", '13': "Provence-Alpes-Côte d'Azur",
    '83': "Provence-Alpes-Côte d'Azur", '84': "Provence-Alpes-Côte d'Azur",
    '09': 'Occitanie', '11': 'Occitanie', '12': 'Occitanie', '30': 'Occitanie',
    '31': 'Occitanie', '32': 'Occitanie', '34': 'Occitanie', '46': 'Occitanie',
    '48': 'Occitanie', '65': 'Occitanie', '66': 'Occitanie', '81': 'Occitanie', '82': 'Occitanie',
    '16': 'Nouvelle-Aquitaine', '17': 'Nouvelle-Aquitaine', '19': 'Nouvelle-Aquitaine',
    '23': 'Nouvelle-Aquitaine', '24': 'Nouvelle-Aquitaine', '33': 'Nouvelle-Aquitaine',
    '40': 'Nouvelle-Aquitaine', '47': 'Nouvelle-Aquitaine', '64': 'Nouvelle-Aquitaine',
    '79': 'Nouvelle-Aquitaine', '86': 'Nouvelle-Aquitaine', '87': 'Nouvelle-Aquitaine',
    '44': 'Pays de la Loire', '49': 'Pays de la Loire', '53': 'Pays de la Loire',
    '72': 'Pays de la Loire', '85': 'Pays de la Loire',
    '22': 'Bretagne', '29': 'Bretagne', '35': 'Bretagne', '56': 'Bretagne',
    '08': 'Grand Est', '10': 'Grand Est', '51': 'Grand Est', '52': 'Grand Est',
    '54': 'Grand Est', '55': 'Grand Est', '57': 'Grand Est', '67': 'Grand Est', '68': 'Grand Est', '88': 'Grand Est',
    '02': 'Hauts-de-France', '59': 'Hauts-de-France', '60': 'Hauts-de-France', '62': 'Hauts-de-France', '80': 'Hauts-de-France',
    '14': 'Normandie', '27': 'Normandie', '50': 'Normandie', '61': 'Normandie', '76': 'Normandie',
    '21': 'Bourgogne-Franche-Comté', '25': 'Bourgogne-Franche-Comté', '39': 'Bourgogne-Franche-Comté',
    '58': 'Bourgogne-Franche-Comté', '70': 'Bourgogne-Franche-Comté', '71': 'Bourgogne-Franche-Comté', '89': 'Bourgogne-Franche-Comté', '90': 'Bourgogne-Franche-Comté',
    '18': 'Centre-Val de Loire', '28': 'Centre-Val de Loire', '36': 'Centre-Val de Loire',
    '37': 'Centre-Val de Loire', '41': 'Centre-Val de Loire', '45': 'Centre-Val de Loire',
    '20': 'Corse',
  };

  private detectRegionFromAddress(address?: string, city?: string): string | null {
    // 1. Try city name match
    if (city) {
      const cityLower = city.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const match = CpoConnectionsService.CITY_TO_REGION[cityLower];
      if (match) return match;
    }

    if (!address) return null;
    const addrLower = address.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Try to find a known city name in address
    for (const [knownCity, region] of Object.entries(CpoConnectionsService.CITY_TO_REGION)) {
      if (addrLower.includes(knownCity)) return region;
    }

    // 3. Try postal code (5-digit French code)
    const postalMatch = address.match(/\b(\d{5})\b/);
    if (postalMatch) {
      const prefix = postalMatch[1].substring(0, 2);
      const region = CpoConnectionsService.POSTAL_TO_REGION[prefix];
      if (region) return region;
    }

    return null;
  }

  async syncSites(connectionId: string) {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${connectionId}`);
    const apiClient = await this.getApiClient(connectionId);
    const remoteSites = await apiClient.getSiteAreas();

    // Load all regions for auto-matching
    const allRegions = await this.prisma.client.region.findMany({ where: { isActive: true } });
    let assignedCount = 0;

    for (const site of remoteSites) {
      // Try to match WattzHub region with a local region
      let regionId: string | null = null;
      let regionName: string | null = site.region || null;

      // Fallback: detect region from city or address if WattzHub didn't provide it
      if (!regionName) {
        regionName = this.detectRegionFromAddress(site.address, site.city);
      }

      if (regionName) {
        const regionLower = regionName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const match = allRegions.find((r) => {
          const codeLower = r.code.toLowerCase();
          const nameLower = r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return codeLower === regionLower || nameLower === regionLower
            || nameLower.includes(regionLower) || regionLower.includes(nameLower);
        });
        if (match) {
          regionId = match.id;
          assignedCount++;
        }
      }

      // Check if site already exists (to avoid overwriting manual region assignments)
      const existing = await this.prisma.client.site.findUnique({
        where: { cpoConnectionId_externalId: { cpoConnectionId: connectionId, externalId: site.id } },
      });

      await this.prisma.client.site.upsert({
        where: { cpoConnectionId_externalId: { cpoConnectionId: connectionId, externalId: site.id } },
        create: {
          cpoConnectionId: connectionId,
          externalId: site.id,
          name: site.name,
          address: site.address ?? null,
          city: site.city ?? null,
          department: site.department ?? null,
          cpoRegion: site.region || regionName || null,
          maxCapacityKw: site.maxCapacityKw ?? null,
          currentLimitKw: site.maxCapacityKw ?? null,
          regionId,
        },
        update: {
          name: site.name,
          address: site.address ?? null,
          city: site.city ?? null,
          department: site.department ?? null,
          cpoRegion: site.region || regionName || existing?.cpoRegion || null,
          // Only update maxCapacityKw if not already set or if the remote value
          // is higher (to avoid overwriting with a reduced limit set by setSiteAreaLimit)
          ...(existing?.maxCapacityKw
            ? (site.maxCapacityKw && site.maxCapacityKw > existing.maxCapacityKw
              ? { maxCapacityKw: site.maxCapacityKw }
              : {})
            : { maxCapacityKw: site.maxCapacityKw ?? null }),
          // Only auto-assign region if not already manually set
          ...(existing?.regionId ? {} : { regionId }),
        },
      });
    }
    await this.prisma.client.cpoConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    this.logger.log(`Synced ${remoteSites.length} sites, auto-assigned ${assignedCount} regions`);
    await this.logs.info('CpoConnection', 'SYNC_SITES', `Synced ${remoteSites.length} sites (${assignedCount} regions auto-assigned)`, {
      connectionId, metadata: { siteCount: remoteSites.length, regionsAssigned: assignedCount },
    });

    // Also sync charging stations into local DB
    try {
      const csResult = await this.syncChargingStations(connectionId);
      this.logger.log(`Synced ${csResult.synced} charging stations for connection ${connectionId}`);
    } catch (err: any) {
      this.logger.warn(`Failed to sync charging stations: ${err.message}`);
    }

    return { synced: remoteSites.length, regionsAssigned: assignedCount };
  }

  async syncChargingStations(connectionId: string) {
    const apiClient = await this.getApiClient(connectionId);
    const remote = await apiClient.getChargingStations({ limit: 500 });
    const stations = remote?.result || remote?.data || (Array.isArray(remote) ? remote : []);

    if (!Array.isArray(stations)) return { synced: 0 };

    for (const station of stations) {
      const externalId = station.id || station._id;
      if (!externalId) continue;

      // Match to local site via siteAreaID
      let siteId: string | null = null;
      if (station.siteAreaID) {
        const site = await this.prisma.client.site.findFirst({
          where: { cpoConnectionId: connectionId, externalId: station.siteAreaID },
        });
        siteId = site?.id ?? null;
      }

      await this.prisma.client.chargingStation.upsert({
        where: { cpoConnectionId_externalId: { cpoConnectionId: connectionId, externalId } },
        create: {
          cpoConnectionId: connectionId,
          externalId,
          siteId,
          chargePointId: station.chargePointID ?? null,
          vendor: station.chargePointVendor ?? null,
          model: station.chargePointModel ?? null,
          firmwareVersion: station.firmwareVersion ?? null,
          ocppVersion: station.ocppVersion ?? null,
          status: station.inactive ? 'Inactive' : (station.connectors?.[0]?.status ?? 'Unknown'),
          connectorsCount: station.connectors?.length ?? 0,
          connectorsJson: station.connectors ?? null,
          maxPowerKw: station.maximumPower ? station.maximumPower / 1000 : null,
          latitude: station.coordinates?.[1] ?? null,
          longitude: station.coordinates?.[0] ?? null,
          lastSyncAt: new Date(),
        },
        update: {
          siteId,
          vendor: station.chargePointVendor ?? undefined,
          model: station.chargePointModel ?? undefined,
          firmwareVersion: station.firmwareVersion ?? undefined,
          status: station.inactive ? 'Inactive' : (station.connectors?.[0]?.status ?? undefined),
          connectorsCount: station.connectors?.length ?? 0,
          connectorsJson: station.connectors ?? undefined,
          maxPowerKw: station.maximumPower ? station.maximumPower / 1000 : undefined,
          latitude: station.coordinates?.[1] ?? undefined,
          longitude: station.coordinates?.[0] ?? undefined,
          lastSyncAt: new Date(),
        },
      });
    }

    return { synced: stations.length };
  }

  async getLocalChargingStations(connectionId?: string) {
    const where: any = {};
    if (connectionId) where.cpoConnectionId = connectionId;
    return this.prisma.client.chargingStation.findMany({
      where,
      include: { site: { include: { region: true } } },
      orderBy: { name: 'asc' },
    });
  }

  // WattzHub requires MongoDB ObjectIds (24-char hex) as site area IDs
  private static readonly OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

  async setSiteLimit(connectionId: string, externalId: string, limitKw: number) {
    if (!CpoConnectionsService.OBJECT_ID_RE.test(externalId)) {
      this.logger.debug(`Skipping remote limit for non-WattzHub externalId: ${externalId}`);
      await this.prisma.client.site.updateMany({
        where: { cpoConnectionId: connectionId, externalId },
        data: { currentLimitKw: limitKw, lastLimitSetAt: new Date() },
      });
      return;
    }
    const apiClient = await this.getApiClient(connectionId);
    const { originalMaxKw } = await apiClient.setSiteAreaLimit(externalId, limitKw);

    // Update currentLimitKw and ensure maxCapacityKw reflects the original
    // WattzHub capacity (before our modification), not the reduced limit
    const updateData: any = { currentLimitKw: limitKw, lastLimitSetAt: new Date() };
    if (originalMaxKw > 0) {
      const site = await this.prisma.client.site.findFirst({
        where: { cpoConnectionId: connectionId, externalId },
      });
      if (!site?.maxCapacityKw || originalMaxKw > site.maxCapacityKw) {
        updateData.maxCapacityKw = originalMaxKw;
      }
    }
    await this.prisma.client.site.updateMany({
      where: { cpoConnectionId: connectionId, externalId },
      data: updateData,
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
    if (existing) {
      // Validate the cached client still works
      const isHealthy = await existing.healthCheck().catch(() => false);
      if (isHealthy) return existing;
      // Token expired — force reconnect
      this.apiClients.delete(connectionId);
    }
    return this.reconnect(connectionId);
  }

  private async reconnect(connectionId: string): Promise<WattzHubApiClient> {
    const connection = await this.prisma.client.cpoConnection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new NotFoundException(`CPO connection not found: ${connectionId}`);
    const apiClient = new WattzHubApiClient();
    let accessToken = connection.accessToken ?? undefined;

    // Always try to re-authenticate with credentials if available
    if (connection.email && connection.encryptedPassword) {
      try {
        const password = this.encryption.decrypt(connection.encryptedPassword);
        apiClient.configure(connection.baseUrl, undefined);
        const result = await apiClient.authenticate(connection.email, password, connection.tenant ?? undefined);
        accessToken = result.accessToken;
        await this.prisma.client.cpoConnection.update({
          where: { id: connectionId },
          data: { accessToken, refreshToken: result.refreshToken ?? null },
        });
        this.logger.log(`Re-authenticated CPO connection ${connectionId}`);
      } catch (err: any) {
        this.logger.warn(`Re-authentication failed for ${connectionId}: ${err.message}`);
      }
    } else if (connection.refreshToken) {
      try {
        apiClient.configure(connection.baseUrl, undefined);
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
        this.logger.warn(`Token refresh failed for ${connectionId}`);
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
