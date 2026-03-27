import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { UpdateSiteDto, AssignRegionDto, SetSiteLimitDto, ManualOverrideDto } from './dto/site.dto';

@ApiTags('Sites')
@Controller('sites')
export class SitesController {
  constructor(private readonly service: SitesService) {}

  @Get()
  @ApiQuery({ name: 'cpoConnectionId', required: false })
  @ApiQuery({ name: 'regionId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Query('cpoConnectionId') cpoConnectionId?: string,
    @Query('regionId') regionId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.service.findAll(cpoConnectionId, regionId, isActive !== undefined ? isActive === 'true' : undefined);
  }

  @Get('by-region/:regionCode')
  findByRegion(@Param('regionCode') regionCode: string) { return this.service.findByRegion(regionCode); }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSiteDto) { return this.service.update(id, dto); }

  @Post(':id/assign-region')
  assignRegion(@Param('id') id: string, @Body() dto: AssignRegionDto) { return this.service.assignRegion(id, dto); }

  @Post(':id/unassign-region')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unassignRegion(@Param('id') id: string) { await this.service.unassignRegion(id); }

  @Post(':id/set-limit')
  setSiteLimit(@Param('id') id: string, @Body() dto: SetSiteLimitDto) { return this.service.setSiteLimit(id, dto.limitKw); }

  @Get(':id/limit-status')
  getLimitStatus(@Param('id') id: string) { return this.service.getLimitStatus(id); }

  @Patch(':id/apply-signal')
  applySignal(@Param('id') id: string, @Body('signalValue') signalValue: number) { return this.service.applySignal(id, signalValue); }

  @Post(':id/override')
  setOverride(@Param('id') id: string, @Body() dto: ManualOverrideDto) { return this.service.setManualOverride(id, dto); }

  @Delete(':id/override')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearOverride(@Param('id') id: string) { await this.service.clearManualOverride(id); }


  @Post('from-dso')
@ApiOperation({ summary: 'Create site from DSO sync' })
async createFromDso(@Body() body: {
  externalId: string;
  name: string;
  address?: string;
  maxCapacity?: number;
  cpoConnectionId: string;
}) {
  return this.service.createFromDso(body);
}
}
