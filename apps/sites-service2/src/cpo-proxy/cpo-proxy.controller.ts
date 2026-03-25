import {
  All,
  Controller,
  Req,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CpoConnectionsService } from '../cpo-connections/cpo-connections.service';

@ApiTags('CPO Proxy')
@Controller('cpo')
export class CpoProxyController {
  private readonly logger = new Logger(CpoProxyController.name);

  constructor(private readonly cpoService: CpoConnectionsService) {}

  @All()
  async proxyRoot(@Req() req: Request, @Res() res: Response) {
    return this.forward(req, res, '');
  }

  @All('*path')
  async proxyAll(@Req() req: Request, @Res() res: Response) {
    // NestJS *path returns comma-separated segments — fix by joining with /
    const rawParam = (req.params as any).path ?? req.params[0] ?? '';
    const subPath = Array.isArray(rawParam) ? rawParam.join('/') : rawParam.replace(/,/g, '/');
    this.logger.debug(`[proxyAll] rawParam=${JSON.stringify(rawParam)} → subPath=${subPath}`);
    return this.forward(req, res, subPath);
  }

  private async forward(req: Request, res: Response, subPath: string) {
    try {
      const conn = await this.cpoService.getActiveConnection();
      const client = await this.cpoService.getApiClient(conn.id);

      // Build the WattzHub target path: /api/<subPath>
      const targetPath = `/api/${subPath}`.replace(/\/+/g, '/');

      this.logger.debug(
        `CPO proxy ${req.method} ${targetPath} (query: ${JSON.stringify(req.query)})`,
      );

      // Access the internal axios instance via the public helper
      const axiosClient = (client as any).client as import('axios').AxiosInstance;

      const axiosResponse = await axiosClient.request({
        method: req.method as any,
        url: targetPath,
        params: req.query,
        data: ['GET', 'HEAD', 'DELETE'].includes(req.method.toUpperCase())
          ? undefined
          : req.body,
        validateStatus: () => true, // forward all statuses
      });

      res.status(axiosResponse.status);
      // Forward relevant headers
      const ct = axiosResponse.headers['content-type'];
      if (ct) res.setHeader('Content-Type', ct);

      return res.json(axiosResponse.data);
    } catch (error: any) {
      this.logger.error(`CPO proxy error: ${error.message}`);
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.BAD_GATEWAY;
      return res.status(status).json({
        statusCode: status,
        message: error.message ?? 'CPO proxy error',
      });
    }
  }
}
