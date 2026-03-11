import 'dotenv/config';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SitesClient {
  private readonly logger = new Logger(SitesClient.name);
  private readonly baseUrl = process.env.SITES_BASE_URL || 'http://localhost:3003';

  async getSites(): Promise<any[]> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/sites`);
      return res.data || [];
    } catch (e: any) {
      this.logger.error(`getSites failed: ${e.message}`);
      return [];
    }
  }

  async getSiteById(siteId: string): Promise<any> {
    try {
      const res = await axios.get(`${this.baseUrl}/api/sites/${siteId}`);
      return res.data;
    } catch (e: any) {
      this.logger.error(`getSiteById failed: ${e.message}`);
      return null;
    }
  }

  async applySiteLimit(siteId: string, newLimitKw: number): Promise<any> {
    try {
      const res = await axios.patch(`${this.baseUrl}/api/sites/${siteId}/apply-signal`, {
        signalValue: newLimitKw,
      });
      return res.data;
    } catch (e: any) {
      this.logger.error(`applySiteLimit failed: ${e.message}`);
      return null;
    }
  }
}