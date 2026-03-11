import { Global, Module } from '@nestjs/common';
import { LogsClient } from './logs.client';

@Global()
@Module({
  providers: [LogsClient],
  exports: [LogsClient],
})
export class LogsClientModule {}
