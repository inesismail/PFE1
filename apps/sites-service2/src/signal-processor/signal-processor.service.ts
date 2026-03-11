import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CpoConnectionsService } from '../cpo-connections/cpo-connections.service';
import { LogsClient } from '../logs/logs.client';
import axios from 'axios';

@Injectable()
export class SignalProcessorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SignalProcessorService.name);
  private readonly activeJobs = new Map<string, NodeJS.Timeout>();
  // Cache des signaux EDF : regionCode -> { signal, fetchedAt }
  private readonly signalCache = new Map<string, { signal: number; fetchedAt: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cpoService: CpoConnectionsService,
    private readonly logs: LogsClient,
  ) {}

  async onModuleInit() {
    this.logger.log('Signal Processor initializing...');
    await this.prisma.onModuleInit(); // ← ajoute cette ligne

    await this.scheduleAllFetchJobs();
    this.logger.log('Signal Processor initialized');
  }

  onModuleDestroy() {
    this.logger.log('Signal Processor shutting down...');
    for (const [, timer] of this.activeJobs) clearInterval(timer);
    this.activeJobs.clear();
  }

  async scheduleAllFetchJobs(): Promise<void> {
  console.log('PRISMA CLIENT:', this.prisma.client);
  console.log('CPO CONNECTION:', this.prisma.cpoConnection);

  const connections = await this.prisma.cpoConnection.findMany({
      where: { fetchEnabled: true, isConnected: true },
    });
    this.logger.log(`Scheduling jobs for ${connections.length} connections`);
    for (const conn of connections) {
      this.scheduleFetchJob(conn.id, conn.fetchIntervalMinutes);
    }
  }

  scheduleFetchJob(connectionId: string, intervalMinutes: number): void {
    if (this.activeJobs.has(connectionId)) {
      clearInterval(this.activeJobs.get(connectionId)!);
      this.activeJobs.delete(connectionId);
    }
    const timer = setInterval(
      () => this.processConnectionSignals(connectionId),
      intervalMinutes * 60 * 1000,
    );
    this.activeJobs.set(connectionId, timer);
    this.logger.log(`Scheduled job for connection ${connectionId} every ${intervalMinutes} min`);

    // Run immediately on first schedule — comme le monolithe
    this.processConnectionSignals(connectionId).catch((err) => {
      this.logger.error(`Initial signal processing failed for ${connectionId}: ${err.message}`);
    });
  }

  cancelFetchJob(connectionId: string): void {
    if (this.activeJobs.has(connectionId)) {
      clearInterval(this.activeJobs.get(connectionId)!);
      this.activeJobs.delete(connectionId);
      this.logger.log(`Cancelled job for connection ${connectionId}`);
    }
  }

  async updateFetchInterval(connectionId: string, intervalMinutes: number): Promise<void> {
    await this.prisma.cpoConnection.update({
      where: { id: connectionId },
      data: { fetchIntervalMinutes: intervalMinutes },
    });
    this.scheduleFetchJob(connectionId, intervalMinutes);
  }

  async setFetchEnabled(connectionId: string, enabled: boolean): Promise<void> {
    await this.prisma.cpoConnection.update({
      where: { id: connectionId },
      data: { fetchEnabled: enabled },
    });
    if (enabled) {
      const conn = await this.prisma.cpoConnection.findUnique({ where: { id: connectionId } });
      if (conn) this.scheduleFetchJob(connectionId, conn.fetchIntervalMinutes);
    } else {
      this.cancelFetchJob(connectionId);
    }
  }

  async processConnectionSignals(connectionId: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Processing signals for connection ${connectionId}`);

    try {
      const connection = await this.prisma.cpoConnection.findUnique({
        where: { id: connectionId },
      });

      if (!connection) {
        this.logger.warn(`Connection ${connectionId} not found`);
        return;
      }

      // Update fetch times
      await this.prisma.cpoConnection.update({
        where: { id: connectionId },
        data: {
          lastFetchAt: new Date(),
          nextFetchAt: new Date(Date.now() + connection.fetchIntervalMinutes * 60 * 1000),
        },
      });

      await this.logs.info('SignalProcessor', 'JOB_START', `Starting signal processing job`, {
        actorId: connection.actorId,
        connectionId,
      });

      // Fetch EDF signals for all active regions
      const regions = await this.prisma.edfRegion.findMany({ where: { isActive: true } });
      let fetchedCount = 0;

      for (const region of regions) {
        try {
          const signal = await this.fetchEdfSignal(region.apiEndpoint, region.datasetId);
          if (signal !== null) {
            this.signalCache.set(region.code, { signal, fetchedAt: new Date() });
            fetchedCount++;
          }
        } catch (err: any) {
          this.logger.warn(`Failed to fetch signal for region ${region.code}: ${err.message}`);
        }
      }

      await this.logs.info('EdfSignal', 'FETCH_SUCCESS', `Fetched signals for ${fetchedCount} regions`, {
        actorId: connection.actorId,
        connectionId,
        metadata: { regionCount: fetchedCount },
      });

      // Get sites with region assignments
      const sites = await this.prisma.site.findMany({
        where: { cpoConnectionId: connectionId, edfRegionId: { not: null }, isActive: true },
        include: { edfRegion: true },
      });

      this.logger.debug(`Found ${sites.length} sites with region assignments`);

      let processedCount = 0;
      let changedCount = 0;

      for (const site of sites) {
        if (!site.edfRegion) continue;
        const result = await this.processSiteSignal(site, connectionId);
        processedCount++;
        if (result.changed) changedCount++;
      }

      const duration = Date.now() - startTime;
      await this.logs.info('SignalProcessor', 'JOB_COMPLETE',
        `Processed ${processedCount} sites, ${changedCount} limits changed (${duration}ms)`,
        { actorId: connection.actorId, connectionId, metadata: { processedCount, changedCount, durationMs: duration } },
      );
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logs.error('SignalProcessor', 'JOB_FAILED', `Signal processing failed: ${errorMessage}`, {
        connectionId, metadata: { error: errorMessage },
      });
      this.logger.error(`Signal processing failed for connection ${connectionId}: ${error}`);
    }
  }

  private async processSiteSignal(site: any, connectionId: string): Promise<{ changed: boolean }> {
    const regionCode = site.edfRegion.code;
    const previousLimit = site.currentLimitKw;

    try {
      // Check manual override
      if (site.manualOverrideUntil && site.manualOverrideUntil > new Date()) {
        const manualLimit = site.manualOverrideLimitKw ?? site.currentLimitKw ?? 0;

        if (previousLimit === manualLimit) {
          await this.prisma.site.update({
            where: { id: site.id },
            data: { lastLimitSetAt: new Date(), lastSignalAt: new Date() },
          });
          await this.logs.info('SiteLimit', 'MANUAL_OVERRIDE_SKIPPED',
            `${site.name}: manual override active, skipping EDF signal`,
            { siteId: site.id, siteName: site.name, metadata: { regionCode, manualLimit } },
          );
          return { changed: false };
        }

        await this.cpoService.setSiteLimit(connectionId, site.externalId, manualLimit);
        await this.prisma.site.update({
          where: { id: site.id },
          data: { currentLimitKw: manualLimit, lastLimitSetAt: new Date(), lastSignalAt: new Date() },
        });
        await this.logs.info('SiteLimit', 'MANUAL_OVERRIDE_APPLIED',
          `${site.name}: manual limit applied ${manualLimit} kW`,
          { siteId: site.id, siteName: site.name, metadata: { regionCode, manualLimit } },
        );
        return { changed: true };
      }

      // Get current EDF signal from cache
      const cached = this.signalCache.get(regionCode);
      if (!cached) {
        this.logger.warn(`No signal available for region ${regionCode}`);
        return { changed: false };
      }

      const signal = cached.signal;

      // Determine new limit based on signal — exactement comme le monolithe
      let newLimit: number;
      if (signal === 0) {
        // Défavorable — use reduced limit
        newLimit = site.reducedLimitKw ?? (site.maxCapacityKw ? site.maxCapacityKw * 0.5 : 0);
      } else {
        // Favorable — use max capacity
        newLimit = site.maxCapacityKw ?? site.currentLimitKw ?? 0;
      }

      // No change needed
      if (previousLimit === newLimit) {
        await this.prisma.site.update({
          where: { id: site.id },
          data: { lastSignalValue: signal, lastSignalAt: new Date() },
        });
        return { changed: false };
      }

      // Update limit in WattzHub
      await this.cpoService.setSiteLimit(connectionId, site.externalId, newLimit);

      // Update local site
      await this.prisma.site.update({
        where: { id: site.id },
        data: { currentLimitKw: newLimit, lastSignalValue: signal, lastSignalAt: new Date(), lastLimitSetAt: new Date() },
      });

      const signalStatus = signal === 1 ? 'favorable' : 'défavorable';
      await this.logs.info('SiteLimit', 'LIMIT_UPDATE',
        `${site.name}: ${previousLimit ?? 0} → ${newLimit} kW (signal ${signalStatus})`,
        { siteId: site.id, siteName: site.name, connectionId, metadata: { regionCode, signalValue: signal, previousLimit, newLimit } },
      );

      return { changed: true };
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logs.error('SiteLimit', 'UPDATE_FAILED',
        `Failed to update limit for ${site.name}: ${errorMessage}`,
        { siteId: site.id, siteName: site.name, connectionId, metadata: { regionCode, error: errorMessage } },
      );
      return { changed: false };
    }
  }

  // Fetch EDF signal depuis l'API open data EDF
  private async fetchEdfSignal(apiEndpoint: string, datasetId: string): Promise<number | null> {
    try {
      const url = `${apiEndpoint}/api/explore/v2.1/catalog/datasets/${datasetId}/records`;
      const response = await axios.get(url, {
        params: { limit: 1, order_by: 'date_heure desc' },
        timeout: 10000,
      });
      const records = response.data?.results || response.data?.records || [];
      if (!records.length) return null;
      const record = records[0];
      const signal = record?.fields?.signal ?? record?.signal ?? record?.fields?.valeur ?? null;
      return signal !== null ? Number(signal) : null;
    } catch {
      return null;
    }
  }

  async getProcessingStatus() {
    const connections = await this.prisma.cpoConnection.findMany({
      include: { _count: { select: { sites: true } } },
    });
    return connections.map((conn) => ({
      connectionId: conn.id,
      actorId: conn.actorId,
      isConnected: conn.isConnected,
      fetchEnabled: conn.fetchEnabled,
      fetchIntervalMinutes: conn.fetchIntervalMinutes,
      lastFetchAt: conn.lastFetchAt,
      nextFetchAt: conn.nextFetchAt,
      siteCount: conn._count.sites,
      jobActive: this.activeJobs.has(conn.id),
      cachedSignals: Object.fromEntries(this.signalCache),
    }));
  }

  async triggerProcessing(connectionId: string): Promise<void> {
    await this.processConnectionSignals(connectionId);
  }
}

