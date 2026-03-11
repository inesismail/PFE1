import { Global, Module } from '@nestjs/common';
import { WattzHubApiClient } from './wattzhub-api.client';

@Global()
@Module({
  providers: [WattzHubApiClient],
  exports: [WattzHubApiClient],
})
export class WattzHubModule {}
