import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EdfRegionsService } from './edf-regions.service';
import { CreateEdfRegionDto, UpdateEdfRegionDto } from './dto/edf-region.dto';

@ApiTags('EDF Regions')
@Controller('edf-regions')
export class EdfRegionsController {
  constructor(private readonly service: EdfRegionsService) {}

  @Get() findAll() { return this.service.findAll(); }
  @Get('by-code/:code') findByCode(@Param('code') code: string) { return this.service.findByCode(code); }
  @Get(':id') findById(@Param('id') id: string) { return this.service.findById(id); }
  @Post() create(@Body() dto: CreateEdfRegionDto) { return this.service.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateEdfRegionDto) { return this.service.update(id, dto); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async delete(@Param('id') id: string) { await this.service.delete(id); }
  @Post('seed') seed() { return this.service.seed(); }
}
