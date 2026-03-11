import { Module } from '@nestjs/common';
import { CpoConnectionsController } from './cpo-connections.controller';
import { CpoConnectionsService } from './cpo-connections.service';

@Module({
  controllers: [CpoConnectionsController],
  providers: [CpoConnectionsService],
  exports: [CpoConnectionsService],
})
export class CpoConnectionsModule {}
