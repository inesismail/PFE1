import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SignalsService } from './signals.service';

@ApiTags('Site Limit Logs')
@Controller('api/site-limit-logs')
export class SiteLimitLogsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all site limit logs' })
  getLogs(@Query('siteId') siteId?: string, @Query('limit') limit?: number) {
    return this.signalsService.getSiteLimitLogs(siteId, limit || 100);
  }
}