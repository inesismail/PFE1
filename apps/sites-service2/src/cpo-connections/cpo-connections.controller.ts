import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CpoConnectionsService } from './cpo-connections.service';
import { ConnectCpoDto, UpdateCpoConnectionDto } from './dto/cpo-connection.dto';

@ApiTags('CPO Connections')
@Controller('cpo-connections')
export class CpoConnectionsController {
  constructor(private readonly service: CpoConnectionsService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Connect to a CPO (WattzHub)' })
  async connect(@Body() dto: ConnectCpoDto) { return this.service.connect(dto); }

  @Get()
  @ApiOperation({ summary: 'List all CPO connections' })
  async findAll() { return this.service.findAll(); }


@Get('active')
@ApiOperation({ summary: 'Get active CPO connection' })
async getActive() {
  return this.service.getActiveConnection();
}

  @Get(':id')
  @ApiOperation({ summary: 'Get CPO connection by ID' })
  async findById(@Param('id') id: string) { return this.service.findById(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Update CPO connection' })
  async update(@Param('id') id: string, @Body() dto: UpdateCpoConnectionDto) { return this.service.update(id, dto); }

  @Post(':id/disconnect')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect CPO' })
  async disconnect(@Param('id') id: string) { await this.service.disconnect(id); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete CPO connection' })
  async delete(@Param('id') id: string) { await this.service.delete(id); }

  @Post(':id/sync-sites')
  @ApiOperation({ summary: 'Sync sites from WattzHub' })
  async syncSites(@Param('id') id: string) { return this.service.syncSites(id); }

  @Put(':id/fetch-interval')
  @ApiOperation({ summary: 'Update fetch interval' })
  async updateInterval(@Param('id') id: string, @Body('intervalMinutes') intervalMinutes: number) {
    return this.service.update(id, { fetchIntervalMinutes: intervalMinutes });
  }

  @Put(':id/fetch-enabled')
  @ApiOperation({ summary: 'Enable/disable fetching' })
  async setFetchEnabled(@Param('id') id: string, @Body('enabled') enabled: boolean) {
    return this.service.update(id, { fetchEnabled: enabled });
  }
}
