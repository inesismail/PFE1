import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { CpoConnectionsModule } from '../cpo-connections/cpo-connections.module';
import { ActorsClientModule } from '../actors/actors.module';
import { SignalProcessorModule } from '../signal-processor/signal-processor.module';

@Module({
  imports: [CpoConnectionsModule, ActorsClientModule, SignalProcessorModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
