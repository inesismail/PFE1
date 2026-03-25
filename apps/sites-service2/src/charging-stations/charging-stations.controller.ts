import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CpoConnectionsService } from '../cpo-connections/cpo-connections.service';

@ApiTags('Charging Stations (Local Cache)')
@Controller('charging-stations')
export class ChargingStationsController {
  constructor(private readonly cpoService: CpoConnectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get cached charging stations from local DB' })
  @ApiQuery({ name: 'connectionId', required: false })
  async getAll(@Query('connectionId') connectionId?: string) {
    return this.cpoService.getLocalChargingStations(connectionId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync charging stations from WattzHub into local DB' })
  async sync() {
    const conn = await this.cpoService.getActiveConnection();
    return this.cpoService.syncChargingStations(conn.id);
  }

  @Post('sync/:connectionId')
  @ApiOperation({ summary: 'Sync charging stations for a specific connection' })
  async syncByConnection(@Param('connectionId') connectionId: string) {
    return this.cpoService.syncChargingStations(connectionId);
  }
}
