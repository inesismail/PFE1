import { Module } from '@nestjs/common';
import { SitesClient } from './sites.client';

@Module({
  providers: [SitesClient],
  exports: [SitesClient],
})
export class SitesModule {}