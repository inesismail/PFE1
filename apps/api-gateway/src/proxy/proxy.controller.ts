import { All, Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { UpstreamHealthService } from './upstream-health.service';
import { UpstreamHealthGuard, Upstream } from './upstream-health.guard';
import type { UpstreamStatus } from './upstream-health.service';

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

function makeProxy(target: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    on: {
      proxyRes(proxyRes, req) {
        const origin = (req as any).headers?.origin;
        if (origin === CORS_ORIGIN) {
          proxyRes.headers['access-control-allow-origin']      = CORS_ORIGIN;
          proxyRes.headers['access-control-allow-credentials'] = 'true';
        }
      },
    },
  });
}

const proxyAuth    = makeProxy(process.env.AUTH_BASE_URL    || 'http://localhost:3001');
const proxySites   = makeProxy(process.env.SITES_BASE_URL   || 'http://localhost:3003');
const proxySignals = makeProxy(process.env.SIGNALS_BASE_URL || 'http://localhost:3004');
const proxyActors  = makeProxy(process.env.ACTORS_BASE_URL  || 'http://localhost:3005');
const proxyDso     = makeProxy(process.env.DSO_BASE_URL     || 'http://localhost:3006');
const proxyLogs    = makeProxy(process.env.LOGS_BASE_URL    || 'http://localhost:3007');

@Controller()
export class ProxyController {
  constructor(private readonly upstreamHealth: UpstreamHealthService) {}

  // ---------- HEALTH CHECK ----------
  @Get()
  healthCheck() {
    const upstreams = this.upstreamHealth.getAll().reduce(
      (acc, s: UpstreamStatus) => ({
        ...acc,
        [s.name]: { url: s.url, healthy: s.healthy, latencyMs: s.latencyMs, lastChecked: s.lastChecked },
      }),
      {} as Record<string, unknown>,
    );
    const allHealthy = Object.values(upstreams).every((s: any) => s.healthy);
    return {
      status: allHealthy ? 'ok' : 'degraded',
      service: 'API Gateway',
      timestamp: new Date().toISOString(),
      upstreams,
    };
  }

  // ---------- AUTH ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('auth') @All('api/auth')
  authRoot(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('auth') @All('api/auth/*path')
  auth(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }

  // ---------- USERS (auth-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('auth') @All('api/users')
  usersRoot(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('auth') @All('api/users/*path')
  users(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }

  // ---------- SITES ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/sites')
  sitesRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/sites/*path')
  sites(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- CPO-CONNECTIONS (sites-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/cpo-connections')
  cpoRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/cpo-connections/*path')
  cpo(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- CPO PROXY (sites-service → WattzHub) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/cpo')
  cpoProxyRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'CPO proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/cpo/*path')
  cpoProxy(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'CPO proxy error'));
  }

  // ---------- SIGNAL-PROCESSOR (sites-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/signal-processor')
  processorRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/signal-processor/*path')
  processor(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- EDF-REGIONS (sites-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/edf-regions')
  edfRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('sites') @All('api/edf-regions/*path')
  edf(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- SIGNALS ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('signals') @All('api/signals')
  signalsRoot(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('signals') @All('api/signals/*path')
  signals(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }

  // ---------- SITE-LIMIT-LOGS (signals-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('signals') @All('api/site-limit-logs')
  siteLimitLogsRoot(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('signals') @All('api/site-limit-logs/*path')
  siteLimitLogs(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }

  // ---------- ACTORS ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/actors')
  actorsRoot(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/actors/*path')
  actors(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }

  // ---------- ACTOR-TYPES (actors-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/actor-types')
  actorTypesRoot(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/actor-types/*path')
  actorTypes(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }

  // ---------- IMPLEMENTATIONS (actors-service) ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/implementations')
  implRoot(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('actors') @All('api/implementations/*path')
  impl(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }

  // ---------- DSO ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('dso') @All('api/dso')
  dsoRoot(@Req() req: Request, @Res() res: Response) {
    return proxyDso(req, res, this.onErr(res, 'DSO proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('dso') @All('api/dso/*path')
  dso(@Req() req: Request, @Res() res: Response) {
    return proxyDso(req, res, this.onErr(res, 'DSO proxy error'));
  }

  // ---------- LOGS ----------
  @UseGuards(UpstreamHealthGuard) @Upstream('logs') @All('api/logs')
  logsRoot(@Req() req: Request, @Res() res: Response) {
    return proxyLogs(req, res, this.onErr(res, 'Logs proxy error'));
  }
  @UseGuards(UpstreamHealthGuard) @Upstream('logs') @All('api/logs/*path')
  logs(@Req() req: Request, @Res() res: Response) {
    return proxyLogs(req, res, this.onErr(res, 'Logs proxy error'));
  }

  // ---------- FALLBACK ----------
  @All('api/*path')
  notHandled(@Res() res: Response) {
    return res.status(404).json({ statusCode: 404, message: 'Route not handled by gateway yet.' });
  }

  private onErr(res: Response, msg: string) {
    return (err: unknown) => {
      res.status(502).json({ statusCode: 502, message: msg, error: String(err) });
    };
  }
}