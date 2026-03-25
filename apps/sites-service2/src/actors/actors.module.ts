import { Global, Module } from '@nestjs/common';
import { ActorsClient } from './actors.client';

@Global()
@Module({
  providers: [ActorsClient],
  exports: [ActorsClient],
})
export class ActorsClientModule {}
