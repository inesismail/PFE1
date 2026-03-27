// ══════════════════════════════════════════════════════════════════
// Interface commune pour tous les providers DSO
// ══════════════════════════════════════════════════════════════════

export interface DsoSite {
  id: string;
  name: string;
  address?: string;
  city: string;
  maxCapacity: number;
  dsoLabel: string;
}

export interface DsoTariffEntry {
  hour: number;
  price: number;
}

export interface DsoEnergyEntry {
  hour: number;
  value: number;
}

export interface DsoProvider {
  /** Récupère la liste des sites du DSO */
  getSites(count?: number): Promise<DsoSite[]>;

  /** Tarifs horaires pour un site */
  getTariffs(siteId: string): Promise<{ tariffs: DsoTariffEntry[]; currency: string; unit: string; date: string }>;

  /** Énergie disponible pour un site */
  getAvailableEnergy(siteId: string): Promise<{ energy: DsoEnergyEntry[]; unit: string; date: string }>;

  /** Calcule les limites de recharge proportionnelles */
  calculateLimits(energyAvailable: number, demands: number[]): number[];
}
