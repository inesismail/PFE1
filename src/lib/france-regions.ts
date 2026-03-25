export interface FranceRegion {
  code: string;
  nom: string;
  chefLieu: string;
  color: string;
  gradient: string;
  population: string;
  departements: number;
}

export const FRANCE_REGIONS: FranceRegion[] = [
  { code: '84', nom: 'Auvergne-Rhône-Alpes',       chefLieu: 'Lyon',           color: '#3b82f6', gradient: 'from-blue-500 to-blue-600',       population: '8,1M', departements: 12 },
  { code: '27', nom: 'Bourgogne-Franche-Comté',     chefLieu: 'Dijon',          color: '#a855f7', gradient: 'from-purple-500 to-purple-600',   population: '2,8M', departements: 8 },
  { code: '53', nom: 'Bretagne',                     chefLieu: 'Rennes',         color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600',       population: '3,4M', departements: 4 },
  { code: '24', nom: 'Centre-Val de Loire',          chefLieu: 'Orléans',        color: '#f59e0b', gradient: 'from-amber-500 to-amber-600',     population: '2,6M', departements: 6 },
  { code: '94', nom: 'Corse',                        chefLieu: 'Ajaccio',        color: '#14b8a6', gradient: 'from-teal-500 to-teal-600',       population: '0,3M', departements: 2 },
  { code: '44', nom: 'Grand Est',                    chefLieu: 'Strasbourg',     color: '#ec4899', gradient: 'from-pink-500 to-pink-600',       population: '5,6M', departements: 10 },
  { code: '32', nom: 'Hauts-de-France',              chefLieu: 'Lille',          color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600',   population: '6,0M', departements: 5 },
  { code: '11', nom: 'Île-de-France',                chefLieu: 'Paris',          color: '#ef4444', gradient: 'from-red-500 to-red-600',         population: '12,3M', departements: 8 },
  { code: '28', nom: 'Normandie',                    chefLieu: 'Rouen',          color: '#10b981', gradient: 'from-emerald-500 to-emerald-600', population: '3,3M', departements: 5 },
  { code: '75', nom: 'Nouvelle-Aquitaine',           chefLieu: 'Bordeaux',       color: '#f43f5e', gradient: 'from-rose-500 to-rose-600',       population: '6,0M', departements: 12 },
  { code: '76', nom: 'Occitanie',                    chefLieu: 'Toulouse',       color: '#f97316', gradient: 'from-orange-500 to-orange-600',   population: '6,0M', departements: 13 },
  { code: '52', nom: 'Pays de la Loire',             chefLieu: 'Nantes',         color: '#8b5cf6', gradient: 'from-violet-500 to-violet-600',   population: '3,8M', departements: 5 },
  { code: '93', nom: 'Provence-Alpes-Côte d\'Azur', chefLieu: 'Marseille',      color: '#0ea5e9', gradient: 'from-sky-500 to-sky-600',         population: '5,1M', departements: 6 },
  { code: '01', nom: 'Guadeloupe',                   chefLieu: 'Basse-Terre',    color: '#22c55e', gradient: 'from-green-500 to-green-600',     population: '0,4M', departements: 1 },
  { code: '02', nom: 'Martinique',                   chefLieu: 'Fort-de-France', color: '#d946ef', gradient: 'from-fuchsia-500 to-fuchsia-600', population: '0,4M', departements: 1 },
  { code: '03', nom: 'Guyane',                       chefLieu: 'Cayenne',        color: '#84cc16', gradient: 'from-lime-500 to-lime-600',       population: '0,3M', departements: 1 },
  { code: '04', nom: 'La Réunion',                   chefLieu: 'Saint-Denis',    color: '#e11d48', gradient: 'from-rose-600 to-rose-700',       population: '0,9M', departements: 1 },
  { code: '06', nom: 'Mayotte',                      chefLieu: 'Mamoudzou',      color: '#0d9488', gradient: 'from-teal-600 to-teal-700',       population: '0,3M', departements: 1 },
];
