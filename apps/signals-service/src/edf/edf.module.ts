import { Module } from '@nestjs/common';
import { EdfClient } from './edf.client';

@Module({
  providers: [EdfClient],
  exports: [EdfClient],
})
export class EdfModule {}