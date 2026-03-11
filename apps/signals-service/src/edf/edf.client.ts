import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface EdfSignalRecord {
  date: string;
  signal: number;
}

// Un seul portail — tous les territoires sont sur opendata-corse.edf.fr
// Les vrais dataset IDs confirmés depuis la page opendata
export const EDF_REGIONS: Record<string, { baseUrl: string; dataset: string }> = {
  CORSE: {
    baseUrl: 'https://opendata-corse.edf.fr',
    dataset: 'signal-reseau-corse-recharge-vehicule-electrique',
  },
  GUADELOUPE: {
    baseUrl: 'https://opendata-corse.edf.fr',
    dataset: 'signal-reseau-guadeloupe-recharge-vehicule-electrique',
  },
  GUYANE: {
    baseUrl: 'https://opendata-corse.edf.fr',
    dataset: 'signal-reseau-guyane-recharge-vehicule-electrique',
  },
  MARTINIQUE: {
    baseUrl: 'https://opendata-corse.edf.fr',
    dataset: 'signal-reseau-martinique-recharge-vehicule-electrique',
  },
  REUNION: {
    baseUrl: 'https://opendata-corse.edf.fr',
    dataset: 'signal-reseau-la-reunion-recharge-vehicule-electrique',
  },
};

@Injectable()
export class EdfClient {
  private readonly logger = new Logger(EdfClient.name);

  async fetchSignal(regionCode: string): Promise<EdfSignalRecord | null> {
    const region = EDF_REGIONS[regionCode];

    if (!region) {
      this.logger.warn(`Unknown region: ${regionCode}`);
      return null;
    }

    const { baseUrl, dataset } = region;
    const apiKey = process.env.EDF_API_KEY || '';

    // Essaie API v2.1 d'abord (nouvelle)
    try {
      const params: any = { limit: 48, order_by: 'date DESC' };
      if (apiKey) params.apikey = apiKey;

      const response = await axios.get(
        `${baseUrl}/api/explore/v2.1/catalog/datasets/${dataset}/records`,
        { params, timeout: 10000 }
      );

      const records = response.data?.results;
      if (records && records.length > 0) {
        const result = this.findClosestSignal(records);
        if (result) {
          this.logger.log(`[v2.1] EDF ${regionCode}: signal=${result.signal} at ${result.date}`);
          return result;
        }
      }
    } catch (error: any) {
      this.logger.warn(`[v2.1] ${regionCode} failed: ${error.message}`);
    }

    // Fallback API v1 (ancienne)
    try {
      const params: any = { dataset, rows: 48, sort: '-date' };
      if (apiKey) params.apikey = apiKey;

      const response = await axios.get(
        `${baseUrl}/api/records/1.0/search`,
        { params, timeout: 10000 }
      );

      const records = response.data?.records;
      if (records && records.length > 0) {
        const fields = records.map((r: any) => r.fields);
        const result = this.findClosestSignal(fields);
        if (result) {
          this.logger.log(`[v1] EDF ${regionCode}: signal=${result.signal} at ${result.date}`);
          return result;
        }
      }
    } catch (error: any) {
      this.logger.error(`[v1] ${regionCode} failed: ${error.message}`);
    }

    this.logger.error(`All EDF APIs failed for ${regionCode}`);
    return null;
  }

  private findClosestSignal(records: any[]): EdfSignalRecord | null {
    const now = new Date();
    let closest: EdfSignalRecord | null = null;
    let minDiff = Infinity;

    for (const record of records) {
      if (!record || record.signal === undefined || record.date === undefined) continue;
      const diff = Math.abs(now.getTime() - new Date(record.date).getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = { date: record.date, signal: Number(record.signal) };
      }
    }

    return closest;
  }
}