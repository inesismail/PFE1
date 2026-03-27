import { DsoProvider, DsoSite } from './dso-provider.interface';
import { SitesClient } from '../sites/sites.client';
import { CITIES } from '../mock/dso-mock.data';

// ══════════════════════════════════════════════════════════════════
// InternalProvider — récupère les sites depuis sites-service (inter-service)
// ══════════════════════════════════════════════════════════════════

export class InternalProvider implements DsoProvider {
  constructor(private readonly sitesClient: SitesClient) {}

  async getSites(count?: number): Promise<DsoSite[]> {
    const sites = await this.sitesClient.getSites();
    const limited = count ? sites.slice(0, count) : sites;

    return limited.map((s: any) => ({
      id: s.id,
      name: s.name || '',
      address: s.address || '',
      city: s.city || this.extractCityFromAddress(s.address),
      maxCapacity: s.maxCapacityKw || s.maxCapacity || 0,
      dsoLabel: 'Internal',
    }));
  }

  async getTariffs(_siteId: string) {
    // Pas de tarification disponible pour les sites internes
    return { tariffs: [], currency: 'EUR', unit: 'EUR/kWh', date: new Date().toISOString().slice(0, 10) };
  }

  async getAvailableEnergy(_siteId: string) {
    // Pas de données énergie DSO pour les sites internes
    return { energy: [], unit: 'kW', date: new Date().toISOString().slice(0, 10) };
  }

  calculateLimits(_energyAvailable: number, demands: number[]): number[] {
    // Pas de limitation pour les sites internes → capacité complète
    return demands;
  }

  private extractCityFromAddress(address?: string): string {
    if (!address) return '';
    const knownCities = CITIES.map(([city]) => city);
    for (const city of knownCities) {
      if (address.includes(city)) return city;
    }
    const match = address.match(/\d{5}\s+(.+)/);
    return match?.[1]?.trim() || '';
  }
}
