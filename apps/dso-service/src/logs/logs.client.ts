import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LogsClient {
  private readonly logger = new Logger(LogsClient.name);
  private readonly baseUrl = process.env.LOGS_BASE_URL || 'http://localhost:3007';

  async log(entry: {
    level: string;
    source: string;
    action: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/logs`, entry);
    } catch (e: any) {
      this.logger.warn(`LogsClient failed: ${e.message}`);
    }
  }
}