import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EdfClient, EDF_REGIONS } from '../edf/edf.client';
import { SitesClient } from '../sites/sites.client';
import { LogsClient } from '../logs/logs.client';

@Injectable()
export class SignalsService {
  private readonly logger = new Logger(SignalsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly edfClient: EdfClient,
    private readonly sitesClient: SitesClient,
    private readonly logsClient: LogsClient,
  ) {}

  @Cron('0 */30 * * * *')
  async processAllRegions() {
    this.logger.log('Processing all EDF regions...');
    for (const regionCode of Object.keys(EDF_REGIONS)) {
      await this.processRegion(regionCode);
    }
    this.logger.log('All regions processed ✅');
  }

  async processRegion(regionCode: string) {
    this.logger.log(`Processing region: ${regionCode}`);

    const edfSignal = await this.edfClient.fetchSignal(regionCode);
    if (!edfSignal) {
      this.logger.warn(`No EDF signal for ${regionCode}`);
      return { regionCode, signal: null, sitesProcessed: 0, sitesSuccess: 0, sitesFailed: 0 };
    }

    await this.prisma.signal.create({
      data: {
        regionCode,
        value: edfSignal.signal,
        signalType: 'NETWORK_SIGNAL',
        pluginId: 'edf-sei',
        metadata: { date: edfSignal.date, source: 'opendata-edf' },
      },
    });

    const sites = await this.sitesClient.getSitesByRegion(regionCode);
    this.logger.log(`Found ${sites.length} sites for ${regionCode}`);

    let sitesSuccess = 0;
    let sitesFailed = 0;

    for (const site of sites) {
      if (site.manualOverride) {
        await this.prisma.siteLimitLog.create({
          data: {
            siteId: site.id,
            siteName: site.name,
            regionCode,
            signalValue: edfSignal.signal,
            previousLimit: site.currentLimitKw,
            newLimit: site.currentLimitKw,
            status: 'skipped',
            errorMessage: 'Manual override active',
          },
        });
        continue;
      }

      const result = await this.sitesClient.applySignalToSite(site.id, edfSignal.signal);

      await this.prisma.siteLimitLog.create({
        data: {
          siteId: site.id,
          siteName: result.siteName || site.name,
          regionCode,
          signalValue: edfSignal.signal,
          previousLimit: result.previousLimit,
          newLimit: result.newLimit,
          status: result.success ? 'success' : 'failed',
          errorMessage: result.error || null,
        },
      });

      result.success ? sitesSuccess++ : sitesFailed++;
    }

  await this.logsClient.info(
  'SignalProcessor',
  `Region ${regionCode} processed`,
  {
    signal: edfSignal.signal,
    sitesProcessed: sites.length,
    sitesSuccess,
    sitesFailed,
  },
);

    return {
      regionCode,
      signal: edfSignal.signal,
      sitesProcessed: sites.length,
      sitesSuccess,
      sitesFailed,
    };
  }

  async getLatestSignal(regionCode: string) {
    return this.prisma.signal.findFirst({
      where: { regionCode },
      orderBy: { time: 'desc' },
    });
  }

  async getSignals(regionCode?: string, limit: number = 100) {
    return this.prisma.signal.findMany({
      where: regionCode ? { regionCode } : {},
      orderBy: { time: 'desc' },
      take: limit,
    });
  }

  async getSiteLimitLogs(siteId?: string, limit: number = 100) {
    return this.prisma.siteLimitLog.findMany({
      where: siteId ? { siteId } : {},
      orderBy: { time: 'desc' },
      take: limit,
    });
  }

  async getStatus() {
    const regions: any[] = [];
    for (const regionCode of Object.keys(EDF_REGIONS)) {
      const latest = await this.getLatestSignal(regionCode);
      const sites = await this.sitesClient.getSitesByRegion(regionCode);
      regions.push({
        regionCode,
        latestSignal: latest?.value ?? null,
        lastFetchedAt: latest?.time ?? null,
        sitesCount: sites.length,
        status: latest
          ? latest.value === 1 ? 'FAVORABLE' : 'UNFAVORABLE'
          : 'UNKNOWN',
      });
    }
    return { regions, processedAt: new Date() };
  }
}