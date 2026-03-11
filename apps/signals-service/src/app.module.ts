import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { SignalsModule } from './signals/signals.module';
import { EdfModule } from './edf/edf.module';
import { SitesModule } from './sites/sites.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    EdfModule,
    SitesModule,
    LogsModule,
    SignalsModule,
  ],
})
export class AppModule {}