import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SitesClient {
  private readonly logger = new Logger(SitesClient.name);
  private readonly baseUrl = process.env.SITES_BASE_URL || 'http://localhost:3003';

  async getSitesByRegion(regionCode: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/sites/by-region/${regionCode}`,
        { timeout: 5000 }
      );
      return response.data || [];
    } catch (error: any) {
      this.logger.error(`getSitesByRegion failed: ${error.message}`);
      return [];
    }
  }

  async applySignalToSite(siteId: string, signalValue: number): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/api/sites/${siteId}/apply-signal`,
        { signalValue },
        { timeout: 10000 }
      );
      return { success: true, ...response.data };
    } catch (error: any) {
      this.logger.error(`applySignal failed for ${siteId}: ${error.message}`);
      return {
        success: false,
        newLimit: 0,
        previousLimit: 0,
        siteName: siteId,
        error: error.message,
      };
    }
  }
}