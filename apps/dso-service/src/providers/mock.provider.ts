import { DsoProvider, DsoSite } from './dso-provider.interface';
import { DsoMockService } from '../mock/dso-mock.service';
import { CITIES } from '../mock/dso-mock.data';

// ══════════════════════════════════════════════════════════════════
// MockProvider — DSO simulé (constantes PREFIXES, CITIES, CAPS…)
// ══════════════════════════════════════════════════════════════════

export class MockProvider implements DsoProvider {
  constructor(
    private readonly mockService: DsoMockService,
    private readonly token: string,
  ) {}

  async getSites(count = 3): Promise<DsoSite[]> {
    const raw = this.mockService.generateSites(this.token, count);
    return raw.map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      city: s.city || this.extractCityFromName(s.name),
      maxCapacity: s.maxCapacity,
      dsoLabel: s.dsoLabel,
    }));
  }

  async getTariffs(siteId: string) {
    const data = this.mockService.generateTariff(siteId);
    return {
      tariffs: data.tariffs,
      currency: data.currency,
      unit: data.unit,
      date: data.date,
    };
  }

  async getAvailableEnergy(siteId: string) {
    const data = this.mockService.generateEnergy(siteId);
    return {
      energy: data.energy,
      unit: data.unit,
      date: data.date,
    };
  }

  calculateLimits(energyAvailable: number, demands: number[]): number[] {
    const total = demands.reduce((s, d) => s + d, 0);
    const ratio = total > 0 ? Math.min(energyAvailable / total, 1) : 0;
    return demands.map(d => Math.round(d * ratio * 10) / 10);
  }

  /** Extrait la ville depuis le nom du site (ex: "Centrale Lyon Nord" → "Lyon") */
  private extractCityFromName(name: string): string {
    const knownCities = CITIES.map(([city]) => city);
    for (const city of knownCities) {
      if (name.includes(city)) return city;
    }
    return '';
  }
}
