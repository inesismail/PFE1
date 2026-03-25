export const VALID_TOKENS: Record<string, string> = {
  'token-enedis': 'Enedis',
  'token-geg': 'GEG Grenoble',
  'token-strasbourg': 'ES Reseaux',
  'token-metz': 'UEM Metz',
  'token-nantes': 'Geredis',
  'token-bordeaux': 'SeoLis',
  'token-lille': 'SICAE',
  'token-paris': 'SIGEIF',
  'token-lyon': 'SRD',
  'token-corse': 'EDF SEI',
  'xCeF9FfYok22BLI844lHtyLDloxGHOsrAPHyjLjFSCOAgGCdq2D070iK1rmUkwlF': 'Legacy',
};

export const PREFIXES = ['Centrale','Station','Hub','Parc','Terminal','Depot','Pole','Base','Relais','Point'];
export const SUFFIXES = ['Nord','Sud','Est','Ouest','Centre','Port','Technopole','Industrie','Logistique','Campus'];
export const CITIES = [
  ['Lyon','69'],['Grenoble','38'],['Marseille','13'],['Strasbourg','67'],
  ['Metz','57'],['Bordeaux','33'],['Nantes','44'],['Toulouse','31'],
  ['Lille','59'],['Nice','06'],['Rennes','35'],['Montpellier','34'],
];
export const STREETS = [
  "rue de l'Energie","avenue de la Republique","boulevard Solidarite",
  "rue du Rhin","quai du Port","avenue Alsace-Lorraine","rue Jean Jaures",
];
export const CAPS = [75, 90, 100, 120, 150, 180, 200, 250, 300, 400];

// Mapping token → région du distributeur
export const TOKEN_REGIONS: Record<string, { code: string; name: string; provider: string }> = {
  'token-enedis':     { code: 'FRANCE_METRO', name: 'France Metropolitaine', provider: 'Enedis' },
  'token-geg':        { code: 'GRENOBLE',     name: 'Grenoble',              provider: 'GEG' },
  'token-strasbourg': { code: 'STRASBOURG',   name: 'Strasbourg',            provider: 'ES Reseaux' },
  'token-metz':       { code: 'METZ',         name: 'Metz',                  provider: 'UEM' },
  'token-nantes':     { code: 'NANTES',       name: 'Nantes',                provider: 'Geredis' },
  'token-bordeaux':   { code: 'BORDEAUX',     name: 'Bordeaux',              provider: 'SeoLis' },
  'token-lille':      { code: 'LILLE',         name: 'Lille',                 provider: 'SICAE' },
  'token-paris':      { code: 'IDF',          name: 'Ile-de-France',         provider: 'SIGEIF' },
  'token-lyon':       { code: 'LYON',         name: 'Lyon',                  provider: 'SRD' },
  'token-corse':      { code: 'CORSE',        name: 'Corse',                 provider: 'EDF' },
};