import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LogsClient {
  private readonly logger = new Logger(LogsClient.name);
  private readonly baseUrl = process.env.LOGS_BASE_URL || 'http://localhost:3007';

  async log(level: string, service: string, message: string, metadata?: any) {
    try {
      await axios.post(
        `${this.baseUrl}/api/logs`,
        { level, service, message, metadata },
        { timeout: 3000 }
      );
    } catch {
      this.logger.warn(`Could not reach logs-service`);
    }
  }

  info(service: string, message: string, metadata?: any) { return this.log('info', service, message, metadata); }
  error(service: string, message: string, metadata?: any) { return this.log('error', service, message, metadata); }
  warn(service: string, message: string, metadata?: any) { return this.log('warn', service, message, metadata); }
}