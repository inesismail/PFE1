import { Module } from '@nestjs/common';
import { EdfRegionsController } from './edf-regions.controller';
import { EdfRegionsService } from './edf-regions.service';

@Module({
  controllers: [EdfRegionsController],
  providers: [EdfRegionsService],
  exports: [EdfRegionsService],
})
export class EdfRegionsModule {}

