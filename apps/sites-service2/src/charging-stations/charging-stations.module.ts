import { Module } from '@nestjs/common';
import { ChargingStationsController } from './charging-stations.controller';
import { CpoConnectionsModule } from '../cpo-connections/cpo-connections.module';

@Module({
  imports: [CpoConnectionsModule],
  controllers: [ChargingStationsController],
})
export class ChargingStationsModule {}
