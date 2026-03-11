import { Module } from '@nestjs/common';
import { SignalsService } from './signals.service';
import { SignalsController } from './signals.controller';
import { SiteLimitLogsController } from './site-limit-logs.controller';
import { EdfModule } from '../edf/edf.module';
import { SitesModule } from '../sites/sites.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [EdfModule, SitesModule, LogsModule],
  providers: [SignalsService],
  controllers: [SignalsController, SiteLimitLogsController],
})
export class SignalsModule {}