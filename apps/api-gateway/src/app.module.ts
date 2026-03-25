// app.module.ts
import { Module } from '@nestjs/common';
import { ProxyController } from './proxy/proxy.controller';
import { UpstreamHealthService } from './proxy/upstream-health.service';
import { UpstreamHealthGuard } from './proxy/upstream-health.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [ProxyController],
  providers: [UpstreamHealthService, UpstreamHealthGuard, Reflector],
})
export class AppModule {}