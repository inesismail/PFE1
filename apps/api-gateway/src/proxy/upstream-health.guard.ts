import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UpstreamHealthService } from './upstream-health.service';

export const UPSTREAM_KEY = 'upstream';

export const Upstream = (name: string) =>
  (_target: object, _key: string | symbol, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(UPSTREAM_KEY, name, descriptor.value);
    return descriptor;
  };

@Injectable()
export class UpstreamHealthGuard implements CanActivate {
  constructor(
    private readonly health: UpstreamHealthService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const upstream = this.reflector.get<string>(UPSTREAM_KEY, ctx.getHandler());
    if (!upstream) return true;

    if (!this.health.isHealthy(upstream)) {
      throw new HttpException(
        { statusCode: 503, message: `Upstream "${upstream}" is currently unavailable`, upstream },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return true;
  }
}