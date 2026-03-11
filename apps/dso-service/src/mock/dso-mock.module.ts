import { Global, Module } from '@nestjs/common';
import { DsoMockService } from './dso-mock.service';

@Global()
@Module({
  providers: [DsoMockService],
  exports: [DsoMockService],
})
export class DsoMockModule {}