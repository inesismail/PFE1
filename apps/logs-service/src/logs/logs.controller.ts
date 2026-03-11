import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { LogEntry, LogLevel, LogSource } from './logs.service';
import { LogsService } from './logs.service';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Écrire un log (appelé par les autres microservices)' })
  async writeLog(@Body() entry: LogEntry): Promise<void> {
    await this.logsService.log(entry);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les logs avec filtres' })
  @ApiQuery({ name: 'level', required: false, enum: ['ERROR', 'WARN', 'INFO', 'DEBUG'] })
  @ApiQuery({ name: 'source', required: false, enum: ['CpoConnection', 'SignalProcessor', 'EdfSignal', 'SiteLimit', 'System', 'Plugin'] })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getLogs(
    @Query('level') level?: string,
    @Query('source') source?: string,
    @Query('actorId') actorId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.logsService.findAll({
      level: level as LogLevel,
      source: source as LogSource,
      actorId,
      search,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques des logs' })
  @ApiQuery({ name: 'hours', required: false, type: Number })
  async getStats(@Query('hours') hours?: string) {
    return this.logsService.getStats(hours ? parseInt(hours, 10) : 24);
  }

  @Delete('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nettoyer les vieux logs' })
  @ApiQuery({ name: 'daysToKeep', required: false, type: Number })
  async cleanup(@Query('daysToKeep') daysToKeep?: string) {
    const count = await this.logsService.cleanup(
      daysToKeep ? parseInt(daysToKeep, 10) : 30,
    );
    return { deleted: count };
  }
}