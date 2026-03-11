// proxy.controller.ts
import { All, Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

function makeProxy(target: string, rewriteFrom: string) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
    pathRewrite: (path) => path.replace(rewriteFrom, ''),
  });
}

const authTarget    = process.env.AUTH_BASE_URL    || 'http://localhost:3001';
const sitesTarget   = process.env.SITES_BASE_URL   || 'http://localhost:3003';
const signalsTarget = process.env.SIGNALS_BASE_URL || 'http://localhost:3004';
const actorsTarget  = process.env.ACTORS_BASE_URL  || 'http://localhost:3005';
const dsoTarget     = process.env.DSO_BASE_URL     || 'http://localhost:3006';
const logsTarget    = process.env.LOGS_BASE_URL    || 'http://localhost:3007';

// /api/auth/login  →  /auth/login  (auth-service a @Controller('auth'))
const proxyAuth    = makeProxy(authTarget,    '/api');
const proxySites   = makeProxy(sitesTarget,   '/api');
const proxySignals = makeProxy(signalsTarget, '/api');
const proxyActors  = makeProxy(actorsTarget,  '/api');
const proxyDso     = makeProxy(dsoTarget,     '/api');
const proxyLogs    = makeProxy(logsTarget,    '/api');

@Controller()
export class ProxyController {

  // ---------- HEALTH CHECK ----------
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      service: 'API Gateway',
      timestamp: new Date().toISOString(),
      upstreams: {
        auth:    process.env.AUTH_BASE_URL    || 'http://localhost:3001',
        sites:   process.env.SITES_BASE_URL   || 'http://localhost:3003',
        signals: process.env.SIGNALS_BASE_URL || 'http://localhost:3004',
        actors:  process.env.ACTORS_BASE_URL  || 'http://localhost:3005',
        dso:     process.env.DSO_BASE_URL     || 'http://localhost:3006',
        logs:    process.env.LOGS_BASE_URL    || 'http://localhost:3007',
      },
    };
  }

  // ---------- AUTH ----------
  @All('api/auth')
  authRoot(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }
  @All('api/auth/*path')
  auth(@Req() req: Request, @Res() res: Response) {
    return proxyAuth(req, res, this.onErr(res, 'Auth proxy error'));
  }

  // ---------- SITES ----------
  @All('api/sites')
  sitesRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @All('api/sites/*path')
  sites(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- EDF-REGIONS (sites-service) ----------
  @All('api/edf-regions')
  edfRoot(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }
  @All('api/edf-regions/*path')
  edf(@Req() req: Request, @Res() res: Response) {
    return proxySites(req, res, this.onErr(res, 'Sites proxy error'));
  }

  // ---------- SIGNALS ----------
  @All('api/signals')
  signalsRoot(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }
  @All('api/signals/*path')
  signals(@Req() req: Request, @Res() res: Response) {
    return proxySignals(req, res, this.onErr(res, 'Signals proxy error'));
  }

  // ---------- ACTORS ----------
  @All('api/actors')
  actorsRoot(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }
  @All('api/actors/*path')
  actors(@Req() req: Request, @Res() res: Response) {
    return proxyActors(req, res, this.onErr(res, 'Actors proxy error'));
  }

  // ---------- DSO ----------
  @All('api/dso')
  dsoRoot(@Req() req: Request, @Res() res: Response) {
    return proxyDso(req, res, this.onErr(res, 'DSO proxy error'));
  }
  @All('api/dso/*path')
  dso(@Req() req: Request, @Res() res: Response) {
    return proxyDso(req, res, this.onErr(res, 'DSO proxy error'));
  }

  // ---------- LOGS ----------
  @All('api/logs')
  logsRoot(@Req() req: Request, @Res() res: Response) {
    return proxyLogs(req, res, this.onErr(res, 'Logs proxy error'));
  }
  @All('api/logs/*path')
  logs(@Req() req: Request, @Res() res: Response) {
    return proxyLogs(req, res, this.onErr(res, 'Logs proxy error'));
  }

  // ---------- FALLBACK ----------
  @All('api/*path')
  notHandled(@Res() res: Response) {
    return res.status(404).json({
      statusCode: 404,
      message: 'Route not handled by gateway yet.',
    });
  }

  private onErr(res: Response, msg: string) {
    return (err: unknown) => {
      res.status(502).json({
        statusCode: 502,
        message: msg,
        error: String(err),
      });
    };
  }
}