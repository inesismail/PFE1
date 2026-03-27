import { Injectable } from '@nestjs/common';
import { DsoSite } from '../providers/dso-provider.interface';

// ══════════════════════════════════════════════════════════════════
// Mapping ville → région administrative française
// ══════════════════════════════════════════════════════════════════

export const CITY_TO_REGION: Record<string, string> = {
  'Lyon': 'Auvergne-Rhône-Alpes',
  'Grenoble': 'Auvergne-Rhône-Alpes',
  'Paris': 'Île-de-France',
  'Marseille': "Provence-Alpes-Côte d'Azur",
  'Nice': "Provence-Alpes-Côte d'Azur",
  'Strasbourg': 'Grand Est',
  'Metz': 'Grand Est',
  'Bordeaux': 'Nouvelle-Aquitaine',
  'Nantes': 'Pays de la Loire',
  'Toulouse': 'Occitanie',
  'Montpellier': 'Occitanie',
  'Lille': 'Hauts-de-France',
  'Rennes': 'Bretagne',
};

export interface SiteWithRegion {
  id: string;
  name: string;
  address?: string;
  city: string;
  region: string;
  maxCapacity: number;
  dsoLabel: string;
}

@Injectable()
export class SiteAdapter {
  /** Transforme un DsoSite en SiteWithRegion */
  adapt(site: DsoSite): SiteWithRegion {
    return {
      id: site.id,
      name: site.name,
      address: site.address,
      city: site.city,
      region: CITY_TO_REGION[site.city] || 'Région inconnue',
      maxCapacity: site.maxCapacity,
      dsoLabel: site.dsoLabel,
    };
  }

  /** Transforme une liste de sites */
  adaptMany(sites: DsoSite[]): SiteWithRegion[] {
    return sites.map(s => this.adapt(s));
  }

  /** Extrait les régions uniques depuis une liste de sites */
  extractRegions(sites: DsoSite[]): string[] {
    return [...new Set(this.adaptMany(sites).map(s => s.region))];
  }
}
