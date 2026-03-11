import { Module } from '@nestjs/common';
import { DsoController } from './dso.controller';
import { DsoService } from './dso.service';
import { SitesModule } from '../sites/sites.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [SitesModule, LogsModule],
  controllers: [DsoController],
  providers: [DsoService],
})
export class DsoModule {}