export interface FranceRegion {
  code: string;
  nom: string;
  chefLieu: string;
  color: string;
  gradient: string;
  population: string;
  departements: number;
}

// Données d'enrichissement (l'API geo.api.gouv.fr ne retourne que code + nom)
const REGION_EXTRA: Record<string, Omit<FranceRegion, 'code' | 'nom'>> = {
  '84': { chefLieu: 'Lyon',           color: '#3b82f6', gradient: 'from-blue-500 to-blue-600',       population: '8,1M', departements: 12 },
  '27': { chefLieu: 'Dijon',          color: '#a855f7', gradient: 'from-purple-500 to-purple-600',   population: '2,8M', departements: 8 },
  '53': { chefLieu: 'Rennes',         color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600',       population: '3,4M', departements: 4 },
  '24': { chefLieu: 'Orléans',        color: '#f59e0b', gradient: 'from-amber-500 to-amber-600',     population: '2,6M', departements: 6 },
  '94': { chefLieu: 'Ajaccio',        color: '#14b8a6', gradient: 'from-teal-500 to-teal-600',       population: '0,3M', departements: 2 },
  '44': { chefLieu: 'Strasbourg',     color: '#ec4899', gradient: 'from-pink-500 to-pink-600',       population: '5,6M', departements: 10 },
  '32': { chefLieu: 'Lille',          color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600',   population: '6,0M', departements: 5 },
  '11': { chefLieu: 'Paris',          color: '#ef4444', gradient: 'from-red-500 to-red-600',         population: '12,3M', departements: 8 },
  '28': { chefLieu: 'Rouen',          color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', population: '3,3M', departements: 5 },
  '75': { chefLieu: 'Bordeaux',       color: '#f43f5e', gradient: 'from-rose-500 to-rose-600',       population: '6,0M', departements: 12 },
  '76': { chefLieu: 'Toulouse',       color: '#f97316', gradient: 'from-orange-500 to-orange-600',   population: '6,0M', departements: 13 },
  '52': { chefLieu: 'Nantes',         color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600',   population: '3,8M', departements: 5 },
  '93': { chefLieu: 'Marseille',      color: '#0ea5e9', gradient: 'from-sky-500 to-sky-600',         population: '5,1M', departements: 6 },
  '01': { chefLieu: 'Basse-Terre',    color: '#22c55e', gradient: 'from-green-500 to-green-600',     population: '0,4M', departements: 1 },
  '02': { chefLieu: 'Fort-de-France', color: '#d946ef', gradient: 'from-fuchsia-500 to-fuchsia-600', population: '0,4M', departements: 1 },
  '03': { chefLieu: 'Cayenne',        color: '#84cc16', gradient: 'from-lime-500 to-lime-600',       population: '0,3M', departements: 1 },
  '04': { chefLieu: 'Saint-Denis',    color: '#e11d48', gradient: 'from-rose-600 to-rose-700',       population: '0,9M', departements: 1 },
  '06': { chefLieu: 'Mamoudzou',      color: '#0d9488', gradient: 'from-teal-600 to-teal-700',       population: '0,3M', departements: 1 },
};

const DEFAULT_EXTRA: Omit<FranceRegion, 'code' | 'nom'> = {
  chefLieu: '—',
  color: '#6b7280',
  gradient: 'from-gray-500 to-gray-600',
  population: '—',
  departements: 0,
};

const COLORS = ['#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#f43f5e', '#06b6d4', '#8b5cf6', '#ec4899'];

/**
 * Récupère les régions depuis l'API officielle geo.api.gouv.fr
 * et les enrichit avec les données supplémentaires (chef-lieu, population, etc.)
 */
export async function fetchFranceRegions(): Promise<FranceRegion[]> {
  const response = await fetch('https://geo.api.gouv.fr/regions');
  if (!response.ok) throw new Error(`Erreur API régions: ${response.status}`);

  const data: { code: string; nom: string }[] = await response.json();

  return data.map((r, i) => {
    const extra = REGION_EXTRA[r.code];
    if (extra) {
      return { code: r.code, nom: r.nom, ...extra };
    }
    return {
      code: r.code,
      nom: r.nom,
      ...DEFAULT_EXTRA,
      color: COLORS[i % COLORS.length],
    };
  });
}
