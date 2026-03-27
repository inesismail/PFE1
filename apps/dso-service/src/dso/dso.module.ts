import { Module } from '@nestjs/common';
import { DsoController } from './dso.controller';
import { DsoService } from './dso.service';
import { SitesModule } from '../sites/sites.module';
import { LogsModule } from '../logs/logs.module';
import { DsoFactory } from '../providers/dso.factory';
import { SiteAdapter } from '../adapters/site.adapter';

@Module({
  imports: [SitesModule, LogsModule],
  controllers: [DsoController],
  providers: [DsoService, DsoFactory, SiteAdapter],
})
export class DsoModule {}