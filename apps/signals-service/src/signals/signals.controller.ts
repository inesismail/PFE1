import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SignalsService } from './signals.service';
import { QuerySignalsDto } from './dto/query-signals.dto';

@ApiTags('Signals')
@Controller('api/signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all signals' })
  getSignals(@Query() query: QuerySignalsDto) {
    return this.signalsService.getSignals(query.regionCode, query.limit);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get status for all regions' })
  getStatus() {
    return this.signalsService.getStatus();
  }

  @Get('latest/:regionCode')
  @ApiOperation({ summary: 'Get latest signal for a region' })
  getLatest(@Param('regionCode') regionCode: string) {
    return this.signalsService.getLatestSignal(regionCode.toUpperCase());
  }

  @Post('fetch-now/:regionCode')
  @ApiOperation({ summary: 'Manually trigger EDF fetch for a region' })
  fetchNow(@Param('regionCode') regionCode: string) {
    return this.signalsService.processRegion(regionCode.toUpperCase());
  }

  @Post('fetch-all')
  @ApiOperation({ summary: 'Manually trigger EDF fetch for all regions' })
  fetchAll() {
    return this.signalsService.processAllRegions();
  }
}