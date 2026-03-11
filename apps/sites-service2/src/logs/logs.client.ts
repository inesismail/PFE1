import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export type LogSource = 'CpoConnection' | 'SignalProcessor' | 'EdfSignal' | 'SiteLimit' | 'System' | 'Plugin';

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

@Injectable()
export class LogsClient {
  private readonly logger = new Logger(LogsClient.name);
  private readonly logsUrl = process.env.LOGS_BASE_URL || 'http://localhost:3007';

  async log(entry: LogEntry): Promise<void> {
    try {
      await axios.post(`${this.logsUrl}/api/logs`, entry, { timeout: 3000 });
    } catch {
      this.logger.warn(`[LogsClient] Failed to send log: ${entry.action}`);
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
}
