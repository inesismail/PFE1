import { Module } from '@nestjs/common';
import { CpoProxyController } from './cpo-proxy.controller';
import { CpoConnectionsModule } from '../cpo-connections/cpo-connections.module';

@Module({
  imports: [CpoConnectionsModule],
  controllers: [CpoProxyController],
})
export class CpoProxyModule {}
