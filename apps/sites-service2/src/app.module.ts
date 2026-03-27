import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { EncryptionModule } from './encryption/encryption.module';
import { WattzHubModule } from './wattzhub/wattzhub.module';
import { LogsClientModule } from './logs/logs.module';
import { ActorsClientModule } from './actors/actors.module';
import { CpoConnectionsModule } from './cpo-connections/cpo-connections.module';
import { RegionsModule } from './regions/regions.module';
import { SitesModule } from './sites/sites.module';
import { SignalProcessorModule } from './signal-processor/signal-processor.module';
import { CpoProxyModule } from './cpo-proxy/cpo-proxy.module';
import { ChargingStationsModule } from './charging-stations/charging-stations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    PrismaModule,
    EncryptionModule,
    WattzHubModule,
    LogsClientModule,
    ActorsClientModule,
    CpoConnectionsModule,
    RegionsModule,
    SitesModule,
    SignalProcessorModule,
    CpoProxyModule,
    ChargingStationsModule,
  ],
})
export class AppModule {}
