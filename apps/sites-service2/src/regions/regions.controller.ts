import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/region.dto';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly service: RegionsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('by-code/:code') findByCode(@Param('code') code: string) { return this.service.findByCode(code); }
  @Get('by-country/:countryCode') findByCountry(@Param('countryCode') countryCode: string) { return this.service.findByCountry(countryCode); }
  @Get(':id') findById(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() dto: CreateRegionDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateRegionDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async delete(@Param('id') id: string) { await this.service.delete(id); }
  @Post('seed') seed() { return this.service.seed(); }
}
