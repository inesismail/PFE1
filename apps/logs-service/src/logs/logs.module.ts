import { Module } from '@nestjs/common';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { PrismaService } from '../prisma/prisma.service'; // ← add this

@Module({
  controllers: [LogsController],
  providers: [LogsService, PrismaService], // ← add PrismaService here
  exports: [LogsService],
})
export class LogsModule {}