import { Module } from '@nestjs/common';
import { LogsClient } from './logs.client';

@Module({
  providers: [LogsClient],
  exports: [LogsClient],
})
export class LogsModule {}