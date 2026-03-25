import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LogsClient {
  private readonly logger = new Logger(LogsClient.name);
  private readonly baseUrl = process.env.LOGS_BASE_URL || 'http://localhost:3007';

  async log(level: string, source: string, action: string, message: string, metadata?: any) {
    try {
      await axios.post(
        `${this.baseUrl}/api/logs`,
        { level, source, action, message, metadata },
        { timeout: 3000 }
      );
    } catch {
      this.logger.warn(`Could not reach logs-service`);
    }
  }

  info(source: string, action: string, message: string, metadata?: any) { return this.log('INFO', source, action, message, metadata); }
  error(source: string, action: string, message: string, metadata?: any) { return this.log('ERROR', source, action, message, metadata); }
  warn(source: string, action: string, message: string, metadata?: any) { return this.log('WARN', source, action, message, metadata); }
}