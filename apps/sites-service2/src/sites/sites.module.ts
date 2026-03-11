import { Module } from '@nestjs/common';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { CpoConnectionsModule } from '../cpo-connections/cpo-connections.module';

@Module({
  imports: [CpoConnectionsModule],
  controllers: [SitesController],
  providers: [SitesService],
  exports: [SitesService],
})
export class SitesModule {}
