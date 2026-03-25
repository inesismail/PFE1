import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CpoConnectionsService } from '../cpo-connections/cpo-connections.service';
import { LogsClient } from '../logs/logs.client';
import { ActorsClient } from '../actors/actors.client';
import { SignalProcessorService } from '../signal-processor/signal-processor.service';
import { UpdateSiteDto, AssignRegionDto, ManualOverrideDto } from './dto/site.dto';

@Injectable()
export class SitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cpoService: CpoConnectionsService,
    private readonly logs: LogsClient,
    private readonly actorsClient: ActorsClient,
    private readonly signalProcessor: SignalProcessorService,
  ) {}

  async findAll(cpoConnectionId?: string, edfRegionId?: string, isActive?: boolean) {
    const where: any = {};
    if (cpoConnectionId) where.cpoConnectionId = cpoConnectionId;
    if (edfRegionId) where.edfRegionId = edfRegionId;
    if (isActive !== undefined) where.isActive = isActive;
    const sites = await this.prisma.client.site.findMany({ where, include: { edfRegion: true, cpoConnection: true }, orderBy: { name: 'asc' } });

    // Enrich with actor info and sanitize sensitive fields
    const actorIds = Array.from(new Set<string>(sites.map((s: any) => s.cpoConnection?.actorId).filter(Boolean)));
    const actorsMap = await this.actorsClient.getByIds(actorIds);

    return sites.map((site) => {
      const { encryptedPassword, accessToken, refreshToken, ...safeConn } = site.cpoConnection as any;
      return {
        ...site,
        cpoConnection: {
          ...safeConn,
          actor: actorsMap.get(safeConn.actorId) || null,
        },
      };
    });
  }

  async findById(id: string) {
    const site = await this.prisma.client.site.findUnique({ where: { id }, include: { edfRegion: true } });
    if (!site) throw new NotFoundException(`Site not found: ${id}`);
    return site;
  }

  async update(id: string, dto: UpdateSiteDto) {
    await this.findById(id);
    return this.prisma.client.site.update({ where: { id }, data: dto, include: { edfRegion: true } });
  }

  async assignRegion(siteId: string, dto: AssignRegionDto) {
    await this.findById(siteId);
    await this.prisma.client.site.update({
      where: { id: siteId },
      data: { edfRegionId: dto.edfRegionId, reducedLimitKw: dto.reducedLimitKw },
    });

    // Fetch + apply signal — never fails the whole request
    if (dto.edfRegionId) {
      try {
        await this.signalProcessor.processSingleSite(siteId);
      } catch {
        // Signal processing failed but region is saved
      }
    }

    return this.prisma.client.site.findUnique({ where: { id: siteId }, include: { edfRegion: true } });
  }

  async unassignRegion(siteId: string) {
    await this.findById(siteId);
    return this.prisma.client.site.update({
      where: { id: siteId },
      data: { edfRegionId: null, lastSignalValue: null, lastSignalAt: null },
      include: { edfRegion: true },
    });
  }

  async setSiteLimit(siteId: string, limitKw: number) {
    const site = await this.findById(siteId);
    if (site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date()) {
      return { site, remoteApplied: false, remoteError: 'Manual override active' };
    }
    const safeLimit = site.maxCapacityKw ? Math.min(limitKw, site.maxCapacityKw) : limitKw;
    let remoteApplied = true;
    let remoteError: string | null = null;
    try {
      await this.cpoService.setSiteLimit(site.cpoConnectionId, site.externalId, safeLimit);
    } catch (error: any) {
      remoteApplied = false;
      remoteError = error?.message ?? String(error);
      await this.logs.error('SiteLimit', 'REMOTE_SET_LIMIT_FAILED', `Failed: ${remoteError}`, { siteId: site.id, siteName: site.name });
    }
    const updated = await this.prisma.client.site.update({
      where: { id: siteId },
      data: { currentLimitKw: safeLimit, lastLimitSetAt: new Date() },
      include: { edfRegion: true },
    });
    return { site: updated, remoteApplied, remoteError };
  }

  async setManualOverride(siteId: string, dto: ManualOverrideDto) {
    const site = await this.findById(siteId);
    if (site.maxCapacityKw && dto.limitKw > site.maxCapacityKw) throw new BadRequestException('Limit exceeds max capacity');
    let endsAt: Date;
    if (dto.endsAt) endsAt = new Date(dto.endsAt);
    else if (dto.durationMinutes) endsAt = new Date(Date.now() + dto.durationMinutes * 60 * 1000);
    else throw new BadRequestException('Provide durationMinutes or endsAt');
    let remoteApplied = true;
    try {
      await this.cpoService.setSiteLimit(site.cpoConnectionId, site.externalId, dto.limitKw);
    } catch { remoteApplied = false; }
    const updated = await this.prisma.client.site.update({
      where: { id: siteId },
      data: { manualOverrideLimitKw: dto.limitKw, manualOverrideUntil: endsAt, manualOverrideReason: dto.reason ?? null, currentLimitKw: dto.limitKw, lastLimitSetAt: new Date() },
      include: { edfRegion: true },
    });
    await this.logs.info('SiteLimit', 'MANUAL_OVERRIDE_SET', `Manual override set to ${dto.limitKw} kW`, { siteId: site.id, siteName: site.name });
    return { site: updated, remoteApplied };
  }

  async clearManualOverride(siteId: string) {
    await this.findById(siteId);
    return this.prisma.client.site.update({
      where: { id: siteId },
      data: { manualOverrideLimitKw: null, manualOverrideUntil: null, manualOverrideReason: null },
      include: { edfRegion: true },
    });
  }

  async getLimitStatus(siteId: string) {
    const site = await this.findById(siteId);
    const overrideActive = !!(site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date());
    return {
      siteId: site.id, siteName: site.name,
      currentLimitKw: site.currentLimitKw, maxCapacityKw: site.maxCapacityKw,
      reducedLimitKw: site.reducedLimitKw, overrideActive,
      manualOverrideLimitKw: site.manualOverrideLimitKw,
      manualOverrideUntil: site.manualOverrideUntil,
      manualOverrideReason: site.manualOverrideReason,
      lastSignalValue: site.lastSignalValue, lastSignalAt: site.lastSignalAt,
    };
  }

  async applySignal(siteId: string, signalValue: number) {
    const site = await this.findById(siteId);
    if (site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date()) {
      return { skipped: true, reason: 'Manual override active' };
    }
    const newLimit = signalValue === 1
      ? (site.maxCapacityKw ?? site.currentLimitKw ?? 0)
      : (site.reducedLimitKw ?? (site.maxCapacityKw ? site.maxCapacityKw * 0.5 : 0));
    return this.prisma.client.site.update({
      where: { id: siteId },
      data: { currentLimitKw: newLimit, lastSignalValue: signalValue, lastSignalAt: new Date(), lastLimitSetAt: new Date() },
    });
  }

  async findByRegion(regionCode: string) {
    return this.prisma.client.site.findMany({
      where: { edfRegion: { code: regionCode }, isActive: true },
      include: { edfRegion: true },
    });
  }

  async createFromDso(data: {
  externalId: string;
  name: string;
  address?: string;
  maxCapacity?: number;
  cpoConnectionId: string;
}) {
  const exists = await this.prisma.client.site.findFirst({
    where: { externalId: data.externalId, cpoConnectionId: data.cpoConnectionId },
  });
  if (exists) return exists;

  return this.prisma.client.site.create({
    data: {
      externalId: data.externalId,
      name: data.name,
      address: data.address || null,
      maxCapacityKw: data.maxCapacity || null,
      currentLimitKw: data.maxCapacity || null,
      isActive: true,
      cpoConnectionId: data.cpoConnectionId,
    },
  });
}
}
