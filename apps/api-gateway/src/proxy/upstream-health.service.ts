import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

export interface UpstreamStatus {
  name: string;
  url: string;
  healthy: boolean;
  lastChecked: Date | null;
  latencyMs: number | null;
}

@Injectable()
export class UpstreamHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UpstreamHealthService.name);
  private readonly INTERVAL_MS = 30_000;
  private readonly TIMEOUT_MS  = 3_000;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private readonly upstreams: Map<string, UpstreamStatus> = new Map([
    ['auth',    { name: 'auth',    url: process.env.AUTH_BASE_URL    || 'http://localhost:3001', healthy: true, lastChecked: null, latencyMs: null }],
    ['sites',   { name: 'sites',   url: process.env.SITES_BASE_URL   || 'http://localhost:3003', healthy: true, lastChecked: null, latencyMs: null }],
    ['signals', { name: 'signals', url: process.env.SIGNALS_BASE_URL || 'http://localhost:3004', healthy: true, lastChecked: null, latencyMs: null }],
    ['actors',  { name: 'actors',  url: process.env.ACTORS_BASE_URL  || 'http://localhost:3005', healthy: true, lastChecked: null, latencyMs: null }],
    ['dso',     { name: 'dso',     url: process.env.DSO_BASE_URL     || 'http://localhost:3006', healthy: true, lastChecked: null, latencyMs: null }],
    ['logs',    { name: 'logs',    url: process.env.LOGS_BASE_URL    || 'http://localhost:3007', healthy: true, lastChecked: null, latencyMs: null }],
  ]);

  onModuleInit() {
    void this.checkAll();
    this.intervalId = setInterval(() => void this.checkAll(), this.INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  isHealthy(name: string): boolean {
    return this.upstreams.get(name)?.healthy ?? false;
  }

  getAll(): UpstreamStatus[] {
    return Array.from(this.upstreams.values());
  }

  private async checkAll(): Promise<void> {
    await Promise.allSettled(
      Array.from(this.upstreams.keys()).map((name) => this.checkOne(name)),
    );
  }

  private async checkOne(name: string): Promise<void> {
    const upstream = this.upstreams.get(name)!;
    const start = Date.now();
    try {
      const res = await fetch(`${upstream.url}/health`, {
        signal: AbortSignal.timeout(this.TIMEOUT_MS),
      });
      const latencyMs   = Date.now() - start;
      const wasHealthy  = upstream.healthy;
      upstream.healthy  = res.ok;
      upstream.latencyMs    = latencyMs;
      upstream.lastChecked  = new Date();

      if (!wasHealthy && res.ok)  this.logger.log(`[${name}] recovered (${latencyMs}ms)`);
      if (wasHealthy  && !res.ok) this.logger.warn(`[${name}] unhealthy — HTTP ${res.status}`);
    } catch (err) {
      upstream.healthy      = false;
      upstream.lastChecked  = new Date();
      upstream.latencyMs    = null;
      this.logger.warn(`[${name}] unreachable — ${String(err)}`);
    }
  }
}