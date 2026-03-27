import { Logger } from '@nestjs/common';
import axios from 'axios';
import { DsoProvider, DsoSite, DsoTariffEntry, DsoEnergyEntry } from './dso-provider.interface';
import { CITIES } from '../mock/dso-mock.data';

// ══════════════════════════════════════════════════════════════════
// EdfProvider — DSO réel (API HTTP externe : EDF, Enedis, etc.)
// ══════════════════════════════════════════════════════════════════

export class EdfProvider implements DsoProvider {
  private readonly logger = new Logger(EdfProvider.name);

  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly tariffUrl?: string,
    private readonly energyUrl?: string,
    private readonly label: string = 'EDF',
  ) {}

  async getSites(count = 10): Promise<DsoSite[]> {
    const resp = await axios.get(`${this.baseUrl}/sites`, {
      headers: { 'X-API-TOKEN': this.token },
      timeout: 10000,
    });
    const data = resp.data;
    const raw: any[] = Array.isArray(data) ? data : data?.sites ?? [];

    return raw.slice(0, count).map((s: any) => ({
      id: s.id || s.siteId || '',
      name: s.name || '',
      address: s.address || '',
      city: s.city || this.extractCityFromAddress(s.address),
      maxCapacity: s.maxCapacity || s.maxCapacityKw || 0,
      dsoLabel: this.label,
    }));
  }

  async getTariffs(siteId: string) {
    const url = (this.tariffUrl || `${this.baseUrl}/tariff`).replace(/\/+$/, '');
    const resp = await axios.get(url, {
      headers: { 'X-API-TOKEN': this.token },
      params: { site_id: siteId },
      timeout: 5000,
    });
    return {
      tariffs: resp.data?.tariffs || [] as DsoTariffEntry[],
      currency: resp.data?.currency || 'EUR',
      unit: resp.data?.unit || 'EUR/kWh',
      date: resp.data?.date || new Date().toISOString().slice(0, 10),
    };
  }

  async getAvailableEnergy(siteId: string) {
    const url = (this.energyUrl || `${this.baseUrl}/energy`).replace(/\/+$/, '');
    const resp = await axios.get(url, {
      headers: { 'X-API-TOKEN': this.token },
      params: { site_id: siteId },
      timeout: 5000,
    });
    return {
      energy: resp.data?.energy || [] as DsoEnergyEntry[],
      unit: resp.data?.unit || 'kW',
      date: resp.data?.date || new Date().toISOString().slice(0, 10),
    };
  }

  calculateLimits(energyAvailable: number, demands: number[]): number[] {
    const total = demands.reduce((s, d) => s + d, 0);
    const ratio = total > 0 ? Math.min(energyAvailable / total, 1) : 0;
    return demands.map(d => Math.round(d * ratio * 10) / 10);
  }

  /** Tente d'extraire la ville depuis une adresse (ex: "42 rue X, 69000 Lyon") */
  private extractCityFromAddress(address?: string): string {
    if (!address) return '';
    // Cherche parmi les villes connues
    const knownCities = CITIES.map(([city]) => city);
    for (const city of knownCities) {
      if (address.includes(city)) return city;
    }
    // Fallback : dernier mot après le code postal
    const match = address.match(/\d{5}\s+(.+)/);
    return match?.[1]?.trim() || '';
  }
}
