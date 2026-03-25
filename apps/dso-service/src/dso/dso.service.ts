import 'dotenv/config';
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SitesClient } from '../sites/sites.client';
import { LogsClient } from '../logs/logs.client';
import { DsoMockService } from '../mock/dso-mock.service';
import { CreateDsoConnectionDto } from './dto/create-dso-connection.dto';
import { CreateSiteLinkDto } from './dto/create-site-link.dto';
import { CreateEnergySnapshotDto } from './dto/create-energy-snapshot.dto';
import axios from 'axios';

@Injectable()
export class DsoService {
  private readonly logger = new Logger(DsoService.name);
  private readonly sitesBaseUrl = process.env.SITES_BASE_URL || 'http://localhost:3003';

  constructor(
    private readonly prisma: PrismaService,
    private readonly sitesClient: SitesClient,
    private readonly logsClient: LogsClient,
    private readonly mockService: DsoMockService,
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // DSO CONNECTIONS
  // ══════════════════════════════════════════════════════════════════

  async testConnection(baseUrl: string, token: string, tariffUrl?: string, energyUrl?: string) {
    const isMock = this.mockService.isValidToken(token);
    if (isMock) {
      const label = this.mockService.validateToken(token);
      const sites = this.mockService.generateSites(token, 3);
      return {
        isValid: true,
        message: `Connexion mock valide — DSO: ${label}`,
        dsoLabel: label,
        sites,
      };
    }

    // Real DSO
    try {
      const resp = await axios.get(`${baseUrl.replace(/\/+$/, '')}/sites`, {
        headers: { 'X-API-TOKEN': token },
        timeout: 5000,
      });
      return {
        isValid: true,
        message: 'Connexion DSO valide',
        sites: resp.data?.sites || [],
      };
    } catch (e: any) {
      const reason = e?.code === 'ECONNREFUSED'
        ? 'Serveur DSO injoignable'
        : e?.response?.status === 401
          ? 'Token invalide'
          : e?.message || 'Erreur inconnue';
      return { isValid: false, message: reason };
    }
  }

  async createConnection(dto: CreateDsoConnectionDto) {
    // Valide le token contre le mock (ou une vraie API DSO)
    const isMock = this.mockService.isValidToken(dto.authPassword);
    if (!isMock) {
      // Si ce n'est pas un token mock → tente une vraie connexion HTTP
      try {
        await axios.get(`${dto.baseUrl.replace(/\/+$/, '')}/sites`, {
          headers: { 'X-API-TOKEN': dto.authPassword },
          timeout: 5000,
        });
      } catch (e: any) {
        throw new BadRequestException(
          `Impossible de valider la connexion DSO: ${e?.response?.data?.message || e.message}`
        );
      }
    }

    const conn = await this.prisma.client.dsoConnection.create({
      data: {
        label: dto.label || '',
        baseUrl: dto.baseUrl.replace(/\/+$/, ''),
        authEmail: dto.authEmail,
        authPassword: dto.authPassword,
        tariffUrl: dto.tariffUrl || null,
        energyUrl: dto.energyUrl || null,
        isActive: true,
      },
    });

    await this.logsClient.log({
      level: 'INFO', source: 'DsoService', action: 'CREATE_CONNECTION',
      message: `DSO connection created: ${conn.label} (${isMock ? 'mock' : 'real'})`,
      metadata: { connectionId: conn.id, isMock },
    });

    return conn;
  }

  async getConnections() {
    return this.prisma.client.dsoConnection.findMany({
      include: {
        siteLinks: {
          include: {
            energySnapshots: { take: 1, orderBy: { timestamp: 'desc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConnectionById(id: string) {
    const conn = await this.prisma.client.dsoConnection.findUnique({
      where: { id },
      include: {
        siteLinks: {
          include: {
            energySnapshots: { take: 5, orderBy: { timestamp: 'desc' } },
          },
        },
      },
    });
    if (!conn) throw new NotFoundException(`DSO connection not found: ${id}`);
    return conn;
  }
async updateConnection(id: string, dto: Partial<CreateDsoConnectionDto> = {}) {
  await this.getConnectionById(id);
  const data: any = {};
  if (dto.label !== undefined) data.label = dto.label;
  if (dto.baseUrl !== undefined) data.baseUrl = dto.baseUrl.replace(/\/+$/, '');
  if (dto.authEmail !== undefined) data.authEmail = dto.authEmail;
  if (dto.authPassword !== undefined) data.authPassword = dto.authPassword;
  if (dto.tariffUrl !== undefined) data.tariffUrl = dto.tariffUrl;
  if (dto.energyUrl !== undefined) data.energyUrl = dto.energyUrl;
  if (Object.keys(data).length === 0) return this.getConnectionById(id);
  return this.prisma.client.dsoConnection.update({ where: { id }, data });
}
async toggleConnection(id: string, isActive?: boolean) {
  const conn = await this.getConnectionById(id);
  const newValue = isActive !== undefined ? isActive : !conn.isActive;
  return this.prisma.client.dsoConnection.update({
    where: { id },
    data: { isActive: newValue },
  });
}
  async deleteConnection(id: string) {
    await this.getConnectionById(id);
    return this.prisma.client.dsoConnection.delete({ where: { id } });
  }

  // ══════════════════════════════════════════════════════════════════
  // DSO SITES (depuis le mock ou API réelle)
  // ══════════════════════════════════════════════════════════════════

  async getDsoSites(connectionId: string, count = 3) {
    const conn = await this.getConnectionById(connectionId);
    const token = conn.authPassword;

    // Mock DSO — génère sites en mémoire
    if (this.mockService.isValidToken(token)) {
      const sites = this.mockService.generateSites(token, count);
      return { sites, total: sites.length, source: 'mock' };
    }

    // API DSO réelle
    try {
      const resp = await axios.get(`${conn.baseUrl}/sites`, {
        headers: { 'X-API-TOKEN': token },
        timeout: 10000,
      });
      const data = resp.data;
      const sites = Array.isArray(data) ? data : data?.sites ?? [];
      return { sites, total: sites.length, source: 'real' };
    } catch (e: any) {
      throw new BadRequestException(
        e?.response?.data?.message || 'Erreur lors de la récupération des sites DSO'
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // SYNC SITES → crée dans sites-service
  // ══════════════════════════════════════════════════════════════════

  async syncSites(connectionId: string) {
    const conn = await this.getConnectionById(connectionId);
    const { sites: dsoSites } = await this.getDsoSites(connectionId, 5);

    // Récupère la connexion CPO active depuis sites-service
    let cpoConnection: any = null;
    try {
      const resp = await axios.get(`${this.sitesBaseUrl}/api/cpo-connections/active`);
      cpoConnection = resp.data;
    } catch {
      throw new BadRequestException('Aucune connexion CPO active trouvée dans sites-service');
    }

    // Crée chaque site dans sites-service
    const created: any[] = [];
    for (const s of dsoSites) {
      const externalId = s.id ?? s.name;
      if (!externalId) continue;
      try {
        const resp = await axios.post(`${this.sitesBaseUrl}/api/sites/from-dso`, {
          externalId,
          name: s.name || `DSO ${externalId}`,
          address: s.address || null,
          maxCapacity: s.maxCapacity ?? null,
          cpoConnectionId: cpoConnection.id,
        });
        if (resp.data) created.push(resp.data);
      } catch {
        // Site déjà existant → on skip
      }
    }

    await this.prisma.client.dsoConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    await this.logsClient.log({
      level: 'INFO', source: 'DsoService', action: 'SYNC_SITES',
      message: `Synced ${created.length}/${dsoSites.length} sites from DSO ${conn.label}`,
      metadata: { connectionId, created: created.length, total: dsoSites.length },
    });

    return {
      success: true,
      sitesCount: dsoSites.length,
      createdCount: created.length,
      sites: created,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // FETCH ENERGY & TARIFF (mock ou réel)
  // ══════════════════════════════════════════════════════════════════

  async fetchEnergy(connectionId: string, siteId: string) {
    const conn = await this.getConnectionById(connectionId);
    const token = conn.authPassword;

    if (this.mockService.isValidToken(token)) {
      return { ...this.mockService.generateEnergy(siteId), source: 'mock' };
    }

    const url = (conn.energyUrl || `${conn.baseUrl}/energy`).replace(/\/+$/, '');
    try {
      const resp = await axios.get(url, {
        headers: { 'X-API-TOKEN': token },
        params: { site_id: siteId },
        timeout: 5000,
      });
      return { ...resp.data, source: 'real' };
    } catch (e: any) {
      throw new BadRequestException(
        e?.response?.data?.message || 'Erreur énergie DSO'
      );
    }
  }

  async fetchTariff(connectionId: string, siteId: string) {
    const conn = await this.getConnectionById(connectionId);
    const token = conn.authPassword;

    if (this.mockService.isValidToken(token)) {
      return { ...this.mockService.generateTariff(siteId), source: 'mock' };
    }

    const url = (conn.tariffUrl || `${conn.baseUrl}/tariff`).replace(/\/+$/, '');
    try {
      const resp = await axios.get(url, {
        headers: { 'X-API-TOKEN': token },
        params: { site_id: siteId },
        timeout: 5000,
      });
      return { ...resp.data, source: 'real' };
    } catch (e: any) {
      throw new BadRequestException(
        e?.response?.data?.message || 'Erreur tarif DSO'
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // SITE LINKS
  // ══════════════════════════════════════════════════════════════════

  async createSiteLink(connectionId: string, dto: CreateSiteLinkDto) {
    const conn = await this.getConnectionById(connectionId);

    // Vérifie que le site existe dans sites-service
    const site = await this.sitesClient.getSiteById(dto.siteId);
    if (!site) throw new NotFoundException(`Site not found in sites-service: ${dto.siteId}`);

    const existing = await this.prisma.client.siteLink.findFirst({
      where: { siteId: dto.siteId, dsoConnectionId: connectionId, dsoSiteRef: dto.dsoSiteRef },
    });
    if (existing) throw new BadRequestException('Ce site link existe déjà');

    const link = await this.prisma.client.siteLink.create({
      data: {
        siteId: dto.siteId,
        dsoConnectionId: connectionId,
        dsoSiteRef: dto.dsoSiteRef,
        enabled: dto.enabled ?? true,
      },
      include: { dsoConnection: true },
    });

    await this.logsClient.log({
      level: 'INFO', source: 'DsoService', action: 'CREATE_SITE_LINK',
      message: `Site linked: ${site.name} ↔ DSO ${conn.label} (ref: ${dto.dsoSiteRef})`,
      metadata: { siteLinkId: link.id, siteId: dto.siteId, dsoSiteRef: dto.dsoSiteRef },
    });

    return link;
  }

  async getSiteLinks(connectionId: string) {
    return this.prisma.client.siteLink.findMany({
      where: { dsoConnectionId: connectionId },
      include: {
        energySnapshots: { take: 1, orderBy: { timestamp: 'desc' } },
      },
    });
  }

  async getAllSiteLinks() {
    return this.prisma.client.siteLink.findMany({
      include: {
        dsoConnection: true,
        energySnapshots: { take: 1, orderBy: { timestamp: 'desc' } },
      },
    });
  }

  async getSiteLinkById(id: string) {
    const link = await this.prisma.client.siteLink.findUnique({
      where: { id },
      include: {
        dsoConnection: true,
        energySnapshots: { take: 10, orderBy: { timestamp: 'desc' } },
      },
    });
    if (!link) throw new NotFoundException(`Site link not found: ${id}`);
    return link;
  }

  async toggleSiteLink(linkId: string, enabled: boolean) {
    return this.prisma.client.siteLink.update({ where: { id: linkId }, data: { enabled } });
  }

  async toggleOptimization(linkId: string, optimizationEnabled: boolean) {
    return this.prisma.client.siteLink.update({ where: { id: linkId }, data: { optimizationEnabled } });
  }

  async deleteSiteLink(linkId: string) {
    await this.getSiteLinkById(linkId);
    return this.prisma.client.siteLink.delete({ where: { id: linkId } });
  }

  // ══════════════════════════════════════════════════════════════════
  // SYNC ENERGY — par site DSO (distribue l'énergie entre tous les CPO liés)
  // ══════════════════════════════════════════════════════════════════

  async syncEnergyForSiteLink(siteLinkId: string) {
    const link = await this.getSiteLinkById(siteLinkId);
    if (!link.enabled) throw new BadRequestException('Site link is disabled');

    // Déclenche la sync pour tout le site DSO (tous les links du même dsoSiteRef)
    return this.syncEnergyForDsoSite(link.dsoConnectionId, link.dsoSiteRef);
  }

  async syncEnergyForDsoSite(connectionId: string, dsoSiteRef: string) {
    // 1. Fetch énergie DSO disponible
    const energyData = await this.fetchEnergy(connectionId, dsoSiteRef).catch(() => null);
    const hour = new Date().getHours();
    const energyEntries: { hour: number; value: number }[] = energyData?.energy || [];
    const energyMatch = energyEntries.find(e => e.hour === hour) || energyEntries[energyEntries.length - 1];
    const energieDispoKw = energyMatch?.value ?? 0;

    // 2. Fetch tarif (pour info/snapshot uniquement, pas pour l'optimisation)
    const tariffData = await this.fetchTariff(connectionId, dsoSiteRef).catch(() => null);
    const tariffEntries: { hour: number; price: number }[] = tariffData?.tariffs || [];
    const tariffMatch = tariffEntries.find(e => e.hour === hour) || tariffEntries[tariffEntries.length - 1];
    const tarif = tariffMatch?.price ?? 0;

    // 3. Récupérer tous les site links actifs pour ce site DSO
    const allLinks = await this.prisma.client.siteLink.findMany({
      where: { dsoConnectionId: connectionId, dsoSiteRef, enabled: true },
    });

    if (!allLinks.length) return { dsoSiteRef, energieDispoKw, tarif, results: [] };

    // 4. Récupérer les infos CPO de chaque site lié
    const linksWithSites = await Promise.all(
      allLinks.map(async (link) => {
        const site = await this.sitesClient.getSiteById(link.siteId);
        return { link, site };
      }),
    );

    // 5. Séparer les sites avec optimisation ON et OFF
    const optimizedLinks = linksWithSites.filter(
      (ls) => ls.link.optimizationEnabled && ls.site,
    );
    const totalDemandKw = optimizedLinks.reduce(
      (sum, ls) => sum + (ls.site.maxCapacityKw || 0), 0,
    );

    // 6. Calculer le ratio de distribution
    const ratio = totalDemandKw > 0
      ? Math.min(energieDispoKw / totalDemandKw, 1)
      : 0;

    // 7. Distribuer et appliquer
    const results = [];
    for (const { link, site } of linksWithSites) {
      if (!site) continue;

      const maxCapacityKw = site.maxCapacityKw || 0;
      let computedLimitKw: number;
      let level: string;
      let remark: string;

      if (!link.optimizationEnabled) {
        // Optimisation OFF → pas de limitation, on log juste
        computedLimitKw = maxCapacityKw;
        level = 'full';
        remark = `Optimisation désactivée — recharge à pleine capacité (${maxCapacityKw} kW)`;
      } else if (energieDispoKw <= 0) {
        // Aucune énergie DSO disponible
        computedLimitKw = 0;
        level = 'blocked';
        remark = 'Aucune énergie DSO disponible — recharge impossible';
      } else if (ratio >= 1) {
        // Assez d'énergie pour tout le monde
        computedLimitKw = maxCapacityKw;
        level = 'full';
        remark = `Énergie suffisante — recharge complète autorisée à ${maxCapacityKw} kW`;
      } else {
        // Pas assez → répartition proportionnelle
        computedLimitKw = Math.round(maxCapacityKw * ratio * 10) / 10;
        level = 'reduced';
        remark = `Énergie DSO limitée (${energieDispoKw} kW pour ${totalDemandKw} kW demandés). `
          + `Recharge réduite à ${computedLimitKw} kW sur ${maxCapacityKw} kW`;
      }

      // Sauvegarder le snapshot
      const signal = level === 'blocked' ? 2 : level === 'reduced' ? 1 : 0;
      await this.prisma.client.energySnapshot.create({
        data: {
          siteLinkId: link.id,
          energieKw: energieDispoKw,
          tarif,
          signal,
          congestionLevel: ratio < 1 ? Math.round((1 - ratio) * 100) : 0,
          timestamp: new Date(),
        },
      });

      // Appliquer la limite au site CPO (seulement si optimisation ON)
      let appliedToCpo = false;
      if (link.optimizationEnabled) {
        const result = await this.sitesClient.setSiteLimit(link.siteId, computedLimitKw);
        appliedToCpo = !!result;
      }

      // Logger dans DsoOptimizationLog
      await this.prisma.client.dsoOptimizationLog.create({
        data: {
          dsoSiteRef,
          dsoSiteName: site.name,
          siteLinkId: link.id,
          energyKw: energieDispoKw,
          maxCapacityKw,
          computedLimitKw,
          level,
          remark,
          totalDsoEnergyKw: energieDispoKw,
          totalDemandKw,
          appliedToCpo,
          triggeredBy: 'auto',
        },
      });

      results.push({
        siteLinkId: link.id,
        siteName: site.name,
        maxCapacityKw,
        computedLimitKw,
        level,
        remark,
        appliedToCpo,
      });

      this.logger.log(
        `Optimization — ${site.name}: ${computedLimitKw}/${maxCapacityKw} kW [${level}]`,
      );
    }

    // Mettre à jour lastSyncAt
    await this.prisma.client.dsoConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date() },
    });

    this.logger.log(
      `Energy sync — DSO ${dsoSiteRef} | dispo: ${energieDispoKw} kW | demande: ${totalDemandKw} kW | ratio: ${Math.round(ratio * 100)}% | sites: ${results.length}`,
    );

    return { dsoSiteRef, energieDispoKw, totalDemandKw, ratio, tarif, results };
  }

  // ══════════════════════════════════════════════════════════════════
  // ENERGY SNAPSHOTS manuels
  // ══════════════════════════════════════════════════════════════════

  async addSnapshot(siteLinkId: string, dto: CreateEnergySnapshotDto) {
    await this.getSiteLinkById(siteLinkId);
    return this.prisma.client.energySnapshot.create({
      data: { siteLinkId, ...dto, timestamp: new Date() },
    });
  }

  async getSnapshots(siteLinkId: string, limit = 100) {
    return this.prisma.client.energySnapshot.findMany({
      where: { siteLinkId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // OPTIMIZATION LOGS (identique au monolithe)
  // ══════════════════════════════════════════════════════════════════

  async createOptimizationLog(dto: any) {
    return this.prisma.client.dsoOptimizationLog.create({ data: dto });
  }

  async getOptimizationLogs(params: {
    dsoSiteRef?: string; level?: string; triggeredBy?: string;
    from?: Date; to?: Date; limit?: number; offset?: number;
  }) {
    const { dsoSiteRef, level, triggeredBy, from, to, limit = 50, offset = 0 } = params;
    const where: any = {};
    if (dsoSiteRef) where.dsoSiteRef = dsoSiteRef;
    if (level) where.level = level;
    if (triggeredBy) where.triggeredBy = triggeredBy;
    if (from || to) { where.time = {}; if (from) where.time.gte = from; if (to) where.time.lte = to; }
    const [logs, total] = await Promise.all([
      this.prisma.client.dsoOptimizationLog.findMany({ where, orderBy: { time: 'desc' }, take: limit, skip: offset }),
      this.prisma.client.dsoOptimizationLog.count({ where }),
    ]);
    return { logs, total, limit, offset };
  }

  async getOptimizationStats(sinceHours = 24) {
    const since = new Date(Date.now() - sinceHours * 3_600_000);
    const [total, byLevel, byApplied] = await Promise.all([
      this.prisma.client.dsoOptimizationLog.count({ where: { time: { gte: since } } }),
      this.prisma.client.dsoOptimizationLog.groupBy({ by: ['level'], where: { time: { gte: since } }, _count: { level: true } }),
      this.prisma.client.dsoOptimizationLog.groupBy({ by: ['appliedToCpo'], where: { time: { gte: since } }, _count: { appliedToCpo: true } }),
    ]);
    return {
      sinceHours, total,
      byLevel: byLevel.reduce((acc: any, r: any) => ({ ...acc, [r.level]: r._count.level }), {}),
      appliedToCpo: byApplied.find((r: any) => r.appliedToCpo)?._count.appliedToCpo ?? 0,
      notAppliedToCpo: byApplied.find((r: any) => !r.appliedToCpo)?._count.appliedToCpo ?? 0,
    };
  }

  async getOptimizationLogsBySite(dsoSiteRef: string, limit = 100) {
    return this.prisma.client.dsoOptimizationLog.findMany({
      where: { dsoSiteRef }, orderBy: { time: 'desc' }, take: limit,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════════

  async getDashboard() {
    const [connections, optimizationLogs, sites] = await Promise.all([
      this.prisma.client.dsoConnection.findMany({
        where: { isActive: true },
        include: { siteLinks: { where: { enabled: true } } },
      }),
      this.prisma.client.dsoOptimizationLog.findMany({ orderBy: { time: 'desc' }, take: 10 }),
      this.sitesClient.getSites(),
    ]);
    return {
      summary: {
        totalConnections: connections.length,
        totalSiteLinks: connections.reduce((acc: number, c: any) => acc + c.siteLinks.length, 0),
        totalSites: sites.length,
        recentOptimizations: optimizationLogs.length,
      },
      connections: connections.map((c: any) => ({
        id: c.id, label: c.label, isActive: c.isActive,
        siteLinksCount: c.siteLinks.length, lastSyncAt: c.lastSyncAt,
      })),
      recentOptimizations: optimizationLogs,
    };
  }
}