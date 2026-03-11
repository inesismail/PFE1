import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

export type LogSource =
  | 'CpoConnection'
  | 'SignalProcessor'
  | 'EdfSignal'
  | 'SiteLimit'
  | 'System'
  | 'Plugin';

export interface LogEntry {
  level: LogLevel;
  source: LogSource;
  action: string;
  message: string;
  actorId?: string;
  actorName?: string;
  siteId?: string;
  siteName?: string;
  connectionId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogQueryParams {
  level?: LogLevel;
  source?: LogSource;
  actorId?: string;
  search?: string;
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: LogEntry): Promise<void> {
    try {
      await this.prisma.systemLog.create({
        data: {
          level:        entry.level,
          source:       entry.source,
          action:       entry.action,
          message:      entry.message,
          actorId:      entry.actorId      ?? null,
          actorName:    entry.actorName    ?? null,
          siteId:       entry.siteId       ?? null,
          siteName:     entry.siteName     ?? null,
          connectionId: entry.connectionId ?? null,
          metadata:     (entry.metadata    ?? {}) as any,
        },
      });

      const m =
        entry.level === 'ERROR' ? 'error'
        : entry.level === 'WARN'  ? 'warn'
        : entry.level === 'DEBUG' ? 'debug'
        : 'log';

      this.logger[m](
        `[${entry.source}] ${entry.action}: ${entry.message}`,
        entry.metadata ?? '',
      );
    } catch (error) {
      this.logger.error('Failed to write log entry', error);
    }
  }

  async info(source: LogSource, action: string, message: string, extra?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'INFO', source, action, message, ...extra });
  }

  async warn(source: LogSource, action: string, message: string, extra?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'WARN', source, action, message, ...extra });
  }

  async error(source: LogSource, action: string, message: string, extra?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'ERROR', source, action, message, ...extra });
  }

  async debug(source: LogSource, action: string, message: string, extra?: Partial<LogEntry>): Promise<void> {
    await this.log({ level: 'DEBUG', source, action, message, ...extra });
  }

  async findAll(params: LogQueryParams) {
    const { level, source, actorId, search, from, to, limit = 100, offset = 0 } = params;

    const where: any = {};
    if (level)    where.level    = level;
    if (source)   where.source   = source;
    if (actorId)  where.actorId  = actorId;
    if (search) {
      where.OR = [
        { message:   { contains: search, mode: 'insensitive' } },
        { action:    { contains: search, mode: 'insensitive' } },
        { actorName: { contains: search, mode: 'insensitive' } },
        { siteName:  { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      where.timestamp = {};
      if (from) where.timestamp.gte = from;
      if (to)   where.timestamp.lte = to;
    }

    const [logs, total] = await Promise.all([
      this.prisma.systemLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take:    limit,
        skip:    offset,
      }),
      this.prisma.systemLog.count({ where }),
    ]);

    return { logs, total, limit, offset, hasMore: offset + logs.length < total };
  }

  async getStats(hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const [byLevel, bySource, total] = await Promise.all([
      this.prisma.systemLog.groupBy({
        by: ['level'],
        where: { timestamp: { gte: since } },
        _count: true,
      }),
      this.prisma.systemLog.groupBy({
        by: ['source'],
        where: { timestamp: { gte: since } },
        _count: true,
      }),
      this.prisma.systemLog.count({ where: { timestamp: { gte: since } } }),
    ]);

    return {
      total,
      byLevel:  byLevel.reduce( (acc, i) => ({ ...acc, [i.level]:  i._count }), {} as Record<string, number>),
      bySource: bySource.reduce((acc, i) => ({ ...acc, [i.source]: i._count }), {} as Record<string, number>),
      since,
    };
  }

  async cleanup(daysToKeep = 30): Promise<number> {
    const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const result = await this.prisma.systemLog.deleteMany({
      where: { timestamp: { lt: cutoff } },
    });
    this.logger.log(`Cleaned up ${result.count} logs older than ${daysToKeep} days`);
    return result.count;
  }
}