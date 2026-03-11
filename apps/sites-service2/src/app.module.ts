import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { EncryptionModule } from './encryption/encryption.module';
import { WattzHubModule } from './wattzhub/wattzhub.module';
import { LogsClientModule } from './logs/logs.module';
import { CpoConnectionsModule } from './cpo-connections/cpo-connections.module';
import { EdfRegionsModule } from './edf-regions/edf-regions.module';
import { SitesModule } from './sites/sites.module';
import { SignalProcessorModule } from './signal-processor/signal-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EncryptionModule,
    WattzHubModule,
    LogsClientModule,
    CpoConnectionsModule,
    EdfRegionsModule,
    SitesModule,
    SignalProcessorModule,
  ],
})
export class AppModule {}
