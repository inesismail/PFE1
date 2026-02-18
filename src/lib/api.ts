import { apiClient } from './api-client';

// ============================================================================
// TYPES
// ============================================================================

// WattzHub CPO API Types
export interface Connector {
  id: string;
  connectorId: number;
  type: string;
  maxPower?: number;
  voltage?: number;
  amperage?: number;
  tariffId?: string;
}

export interface ChargingStationConnector {
  id: string;
  connectorId: number;
  standard: string;
  format: string;
  powerType: string;
  maxElectricPower?: number;
  tariffIds?: string[];
}

export interface ChargingStation {
  id: string;
  chargePointId?: string;
  ocppProtocol?: string;
  ocppVersion?: string;
  chargeBoxSerialNumber?: string;
  model?: string;
  vendor?: string;
  firmwareVersion?: string;
  status?: string;
  statusLastUpdatedOn?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  connectors?: ChargingStationConnector[];
}

export interface Transaction {
  id: string;
  chargeBoxId?: string;
  connectorId?: number;
  idTag?: string;
  startTimestamp: string;
  startValue: number;
  stopTimestamp?: string;
  stopValue?: number;
  status?: string;
  meterValues?: MeterValue[];
}

export interface MeterValue {
  timestamp: string;
  sampledValues: {
    value: string;
    measurand?: string;
    unit?: string;
  }[];
}

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
  createdOn?: string;
  lastChangedOn?: string;
}

export interface Tag {
  id: string;
  idToken?: string;
  type?: string;
  visualID?: string;
  issuer?: string;
  active?: boolean;
  createdOn?: string;
  lastChangedOn?: string;
}

export interface Site {
  id: string;
  name?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  chargingStations?: string[];
}

export interface SiteArea {
  id: string;
  name?: string;
  siteID?: string;
  address?: string;
  chargingStations?: string[];
}

export interface Company {
  id: string;
  name?: string;
  address?: string;
  logo?: string;
}

export interface Asset {
  id: string;
  name?: string;
  assetType?: string;
  siteAreaID?: string;
  connectorID?: string;
  consumptions?: AssetConsumption[];
}

export interface AssetConsumption {
  id?: string;
  timestamp?: string;
  value?: number;
  unit?: string;
}

export interface ApiResponse<T> {
  data?: T;
  status?: number;
  message?: string;
}

// Local API Types
export interface ActorType {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Actor {
  id: string;
  code: string;
  name: string;
  actorType: ActorType;
  config: Record<string, unknown>;
  isActive: boolean;
  cpoConnection?: CpoConnection;
  actorImplementations?: ActorImplementation[];
}

export interface Implementation {
  id: string;
  code: string;
  name: string;
  version: string;
  implementationType: {
    id: string;
    code: string;
    name: string;
  };
}

export interface PluginMetadata {
  id: string;
  type: string;
  name: string;
  version: string;
  description: string;
  supportedActorTypes: string[];
}

export interface ActorImplementation {
  id: string;
  implementation: Implementation;
  config: Record<string, unknown>;
  isEnabled: boolean;
}

export interface CpoConnection {
  id: string;
  baseUrl: string;
  authUrl?: string;
  authType: 'credentials' | 'token';
  email?: string;
  isConnected: boolean;
  fetchIntervalMinutes: number;
  fetchEnabled: boolean;
  lastFetchAt?: string;
  nextFetchAt?: string;
  lastSyncAt?: string;
  hasCredentials: boolean;
  hasToken: boolean;
  actor: Actor;
}

export interface EdfRegion {
  id: string;
  code: string;
  name: string;
  apiEndpoint: string;
  datasetId: string;
  isActive: boolean;
  _count?: {
    sites: number;
  };
}

export interface LocalSite {
  id: string;
  externalId: string;
  name: string;
  address?: string;
  maxCapacityKw?: number;
  currentLimitKw?: number;
  reducedLimitKw?: number;
  isActive: boolean;
  lastSignalValue?: number;
  lastSignalAt?: string;
  lastLimitSetAt?: string;
  edfRegion?: EdfRegion;
  cpoConnection: CpoConnection;
  latestSignal?: Signal;
  hasEdfPlugin?: boolean;
  manualOverrideLimitKw?: number | null;
  manualOverrideUntil?: string | null;
  manualOverrideReason?: string | null;
}

export interface Signal {
  id: string;
  time: string;
  regionCode: string;
  signalType: string;
  value: number;
}

export interface ProcessingStatus {
  connectionId: string;
  actorName: string;
  isConnected: boolean;
  fetchEnabled: boolean;
  fetchIntervalMinutes: number;
  lastFetchAt?: string;
  nextFetchAt?: string;
  siteCount: number;
  jobActive: boolean;
}

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export type LogSource =
  | 'CpoConnection'
  | 'SignalProcessor'
  | 'EdfSignal'
  | 'SiteLimit'
  | 'System'
  | 'Plugin';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  action: string;
  message: string;
  actorId?: string;
  actorName?: string;
  siteId?: string;
  siteName?: string;
  connectionId?: string;
  metadata?: Record<string, unknown>;
}

export interface LogsQueryParams {
  level?: LogLevel;
  source?: LogSource;
  actorId?: string;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface LogsResponse {
  logs: SystemLog[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface LogsStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  bySource: Record<LogSource, number>;
  recent: SystemLog[];
}

// ============================================================================
// DSO Connection Types (✅ PATCHED)
// ============================================================================

export interface DsoConnection {
  id: string;
  label?: string;
  baseUrl: string;
  authEmail: string;
  authPassword?: string;

  // ✅ AJOUTÉS POUR TON UI
  tariffUrl?: string | null;
  energyUrl?: string | null;
  isActive?: boolean;

  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  siteLinks?: SiteLink[];
}

export interface SiteLink {
  id: string;
  siteId: string;
  dsoConnectionId: string;
  dsoSiteRef: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  energySnapshots?: EnergySnapshot[];
  dsoConnection?: DsoConnection;
}

export interface EnergySnapshot {
  id: string;
  siteLinkId: string;
  energieKw: number;
  tarif: number;
  signal: number;
  congestionLevel?: number;
  timestamp: string;
}

// ✅ Inputs typés (pour éviter l'erreur tariffUrl/energyUrl)
export type CreateDsoConnectionInput = {
  label?: string;
  baseUrl: string;
  authEmail: string;
  authPassword: string;
  tariffUrl?: string | null;
  energyUrl?: string | null;
};

export type UpdateDsoConnectionInput = Partial<CreateDsoConnectionInput> & {
  isActive?: boolean;
};

// ============================================================================
// ACTORS API (Local Backend)
// ============================================================================

export const actorsApi = {
  getTypes: () => apiClient.get<ActorType[]>('/actors/types'),

  getAll: (type?: string) =>
    apiClient.get<Actor[]>(`/actors${type ? `?type=${type}` : ''}`),

  getById: (id: string) => apiClient.get<Actor>(`/actors/${id}`),

  create: (data: { actorTypeId: string; code: string; name: string }) =>
    apiClient.post<Actor>('/actors', data),

  update: (id: string, data: Partial<Actor>) =>
    apiClient.put<Actor>(`/actors/${id}`, data),

  delete: (id: string) => apiClient.delete(`/actors/${id}`),

  getImplementations: (id: string) =>
    apiClient.get<ActorImplementation[]>(`/actors/${id}/implementations`),

  getAvailableImplementations: (id: string) =>
    apiClient.get(`/actors/${id}/implementations/available`),

  enableImplementation: (
    id: string,
    implementationCode: string,
    config?: Record<string, unknown>
  ) => apiClient.post(`/actors/${id}/implementations`, { implementationCode, config }),

  disableImplementation: (id: string, code: string) =>
    apiClient.delete(`/actors/${id}/implementations/${code}`),
};

// ============================================================================
// CPO CONNECTIONS API (Local Backend)
// ============================================================================

export const cpoApi = {
  connect: (data: {
    actorId: string;
    baseUrl: string;
    authUrl?: string;
    tenant?: string;
    authType: 'credentials' | 'token';
    email?: string;
    password?: string;
    accessToken?: string;
    fetchIntervalMinutes?: number;
  }) => apiClient.post<CpoConnection>('/cpo-connections/connect', data),

  getAll: () => apiClient.get<CpoConnection[]>('/cpo-connections'),

  getById: (id: string) => apiClient.get<CpoConnection>(`/cpo-connections/${id}`),

  update: (id: string, data: Partial<CpoConnection>) =>
    apiClient.put<CpoConnection>(`/cpo-connections/${id}`, data),

  disconnect: (id: string) => apiClient.post(`/cpo-connections/${id}/disconnect`),

  delete: (id: string) => apiClient.delete(`/cpo-connections/${id}`),

  syncSites: (id: string) => apiClient.post(`/cpo-connections/${id}/sync-sites`),

  updateFetchInterval: (id: string, fetchIntervalMinutes: number) =>
    apiClient.put(`/cpo-connections/${id}/fetch-interval`, { fetchIntervalMinutes }),

  updateFetchEnabled: (id: string, fetchEnabled: boolean) =>
    apiClient.put(`/cpo-connections/${id}/fetch-enabled`, { fetchEnabled }),
};

// ============================================================================
// LOCAL SITES API (Local Backend)
// ============================================================================

export const sitesApi = {
  getAll: (connectionId?: string) =>
    apiClient.get<LocalSite[]>(`/sites${connectionId ? `?connectionId=${connectionId}` : ''}`),

  getWithStatus: () => apiClient.get<LocalSite[]>('/sites/with-status'),

  getById: (id: string) => apiClient.get<LocalSite>(`/sites/${id}`),

  update: (id: string, data: Partial<LocalSite>) => apiClient.put<LocalSite>(`/sites/${id}`, data),

  assignRegion: (id: string, edfRegionId: string, reducedLimitKw?: number) =>
    apiClient.post(`/sites/${id}/assign-region`, { edfRegionId, reducedLimitKw }),

  unassignRegion: (id: string) => apiClient.post(`/sites/${id}/unassign-region`),

  setLimit: (id: string, limitKw: number) => apiClient.post(`/sites/${id}/set-limit`, { limitKw }),

  setOverride: (id: string, limitKw: number, durationMinutes?: number, reason?: string) => {
    const payload: any = { limitKw };
    if (durationMinutes && durationMinutes > 0) payload.durationMinutes = durationMinutes;
    if (reason && reason.trim()) payload.reason = reason;
    return apiClient.post(`/sites/${id}/override`, payload);
  },

  clearOverride: (id: string) => apiClient.delete(`/sites/${id}/override`),

  getOverride: (id: string) => apiClient.get(`/sites/${id}/override`),
};

// ============================================================================
// EDF REGIONS API (Local Backend)
// ============================================================================

export const regionsApi = {
  getAll: () => apiClient.get<EdfRegion[]>('/edf-regions'),

  getById: (id: string) => apiClient.get<EdfRegion>(`/edf-regions/${id}`),

  create: (data: { code: string; name: string; apiEndpoint: string; datasetId: string }) =>
    apiClient.post<EdfRegion>('/edf-regions', data),

  update: (id: string, data: Partial<EdfRegion>) =>
    apiClient.put<EdfRegion>(`/edf-regions/${id}`, data),

  delete: (id: string) => apiClient.delete(`/edf-regions/${id}`),

  seed: () => apiClient.post('/edf-regions/seed'),
};

// ============================================================================
// EDF SIGNALS API (Local Backend)
// ============================================================================

export const signalsApi = {
  fetchAll: () => apiClient.post('/edf-signals/fetch'),

  getLatest: () => apiClient.get<Record<string, Signal>>('/edf-signals/latest'),

  getByRegion: (code: string) => apiClient.get<Signal>(`/edf-signals/region/${code}`),

  getCurrentByRegion: (code: string) =>
    apiClient.get<Signal>(`/edf-signals/region/${code}/current`),

  getHistory: (code: string, hours?: number) =>
    apiClient.get<Signal[]>(`/edf-signals/region/${code}/history${hours ? `?hours=${hours}` : ''}`),

  getStats: (code: string, hours?: number) =>
    apiClient.get(`/edf-signals/region/${code}/stats${hours ? `?hours=${hours}` : ''}`),
};

// ============================================================================
// SIGNAL PROCESSOR API (Local Backend)
// ============================================================================

export const processorApi = {
  getStatus: () => apiClient.get<ProcessingStatus[]>('/signal-processor/status'),

  trigger: (connectionId: string) => apiClient.post(`/signal-processor/trigger/${connectionId}`),

  updateInterval: (connectionId: string, intervalMinutes: number) =>
    apiClient.put(`/signal-processor/${connectionId}/interval`, { intervalMinutes }),

  setEnabled: (connectionId: string, enabled: boolean) =>
    apiClient.put(`/signal-processor/${connectionId}/enabled`, { enabled }),
};

// ============================================================================
// LOGS API (Local Backend)
// ============================================================================

export const logsApi = {
  getAll: (params?: LogsQueryParams) => apiClient.get<LogsResponse>('/logs'),

  getStats: (hours?: number) => apiClient.get<LogsStats>(`/logs/stats${hours ? `?hours=${hours}` : ''}`),

  cleanup: (daysToKeep?: number) =>
    apiClient.delete(`/logs/cleanup${daysToKeep ? `?daysToKeep=${daysToKeep}` : ''}`),
};

// ============================================================================
// WATTZHUB CPO API (External API)
// ============================================================================

export const chargingStationsApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<ChargingStation[]>(
      `/cpo/charging-stations${
        skip || limit
          ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}`
          : ''
      }`
    ),

  getById: (id: string) => apiClient.get<ChargingStation>(`/cpo/charging-stations/${id}`),

  getTransactions: (id: string) => apiClient.get<Transaction[]>(`/cpo/charging-stations/${id}/transactions`),

  getStatus: (id: string) => apiClient.get(`/cpo/charging-stations/${id}/status`),

  reset: (id: string) => apiClient.put(`/cpo/charging-stations/${id}/reset`, {}),

  clearCache: (id: string) => apiClient.put(`/cpo/charging-stations/${id}/cache/clear`, {}),

  remoteStart: (id: string, connectorId: number, idTag?: string) =>
    apiClient.put(`/cpo/charging-stations/${id}/remote/start`, { connectorId, idTag }),

  remoteStop: (id: string, transactionId: number) =>
    apiClient.put(`/cpo/charging-stations/${id}/remote/stop`, { transactionId }),

  unlockConnector: (id: string, connectorId: number) =>
    apiClient.put(`/cpo/charging-stations/${id}/connectors/${connectorId}/unlock`, {}),

  updateAvailability: (id: string, availability: string) =>
    apiClient.put(`/cpo/charging-stations/${id}/availability/change`, { availability }),

  setPowerLimit: (id: string, limit: number) =>
    apiClient.put(`/cpo/charging-stations/${id}/power/limit`, { limit }),

  setParameters: (id: string, parameters: Record<string, string>) =>
    apiClient.put(`/cpo/charging-stations/${id}/parameters`, parameters),
};

export const transactionsApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<Transaction[]>(
      `/cpo/transactions${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<Transaction>(`/cpo/transactions/${id}`),

  getCompleted: (skip?: number, limit?: number) =>
    apiClient.get<Transaction[]>(
      `/cpo/transactions/status/completed${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getActive: (skip?: number, limit?: number) =>
    apiClient.get<Transaction[]>(
      `/cpo/transactions/status/active${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getByChargingStation: (stationId: string) =>
    apiClient.get<Transaction[]>(`/cpo/charging-stations/${stationId}/transactions`),

  stop: (id: string) => apiClient.put(`/cpo/transactions/${id}/stop`, {}),

  softStop: (id: string) => apiClient.put(`/cpo/transactions/${id}/soft-stop`, {}),

  getConsumptions: (id: string) => apiClient.get<MeterValue[]>(`/cpo/transactions/${id}/consumptions`),

  exportToOcpiCdr: (id: string) => apiClient.post(`/cpo/transactions/${id}/ocpi/cdr`, {}),
};

export const usersApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<User[]>(
      `/cpo/users${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<User>(`/cpo/users/${id}`),

  create: (data: Partial<User>) => apiClient.post<User>('/cpo/users', data),

  update: (id: string, data: Partial<User>) => apiClient.put<User>(`/cpo/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/users/${id}`),

  getDefaultCarTag: (id: string) => apiClient.get(`/cpo/users/${id}/default-car-tag`),

  getSites: (id: string) => apiClient.get<Site[]>(`/cpo/users/${id}/sites`),

  assignSite: (id: string, siteId: string) => apiClient.post(`/cpo/users/${id}/sites`, { siteId }),

  setAdminRole: (id: string, siteId: string) =>
    apiClient.put(`/cpo/users/${id}/sites/admin`, { siteId }),
};

export const tagsApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<Tag[]>(
      `/cpo/tags${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<Tag>(`/cpo/tags/${id}`),

  create: (data: Partial<Tag>) => apiClient.post<Tag>('/cpo/tags', data),

  update: (id: string, data: Partial<Tag>) => apiClient.put<Tag>(`/cpo/tags/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/tags/${id}`),

  assignToUser: (id: string, userId: string) => apiClient.put(`/cpo/tags/${id}/assign`, { userId }),

  unassignFromUser: (id: string) => apiClient.put(`/cpo/tags/${id}/unassign`, {}),
};

export const sitesWattzApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<Site[]>(
      `/cpo/sites${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<Site>(`/cpo/sites/${id}`),

  create: (data: Partial<Site>) => apiClient.post<Site>('/cpo/sites', data),

  update: (id: string, data: Partial<Site>) => apiClient.put<Site>(`/cpo/sites/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/sites/${id}`),

  assignChargingStation: (id: string, stationId: string) =>
    apiClient.put(`/cpo/sites/${id}/assign`, { stationId }),

  unassignChargingStation: (id: string, stationId: string) =>
    apiClient.put(`/cpo/sites/${id}/unassign`, { stationId }),
};

export const siteAreasApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<SiteArea[]>(
      `/cpo/site-areas${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<SiteArea>(`/cpo/site-areas/${id}`),

  create: (data: Partial<SiteArea>) => apiClient.post<SiteArea>('/cpo/site-areas', data),

  update: (id: string, data: Partial<SiteArea>) =>
    apiClient.put<SiteArea>(`/cpo/site-areas/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/site-areas/${id}`),

  getConsumptions: (id: string) => apiClient.get(`/cpo/site-areas/${id}/consumptions`),

  assignChargingStation: (id: string, stationId: string) =>
    apiClient.put(`/cpo/site-areas/${id}/charging-stations/assign`, { stationId }),

  unassignChargingStation: (id: string, stationId: string) =>
    apiClient.put(`/cpo/site-areas/${id}/charging-stations/unassign`, { stationId }),
};

export const assetsApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<Asset[]>(
      `/cpo/assets${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<Asset>(`/cpo/assets/${id}`),

  create: (data: Partial<Asset>) => apiClient.post<Asset>('/cpo/assets', data),

  update: (id: string, data: Partial<Asset>) => apiClient.put<Asset>(`/cpo/assets/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/assets/${id}`),

  getConsumptions: (id: string) => apiClient.get<AssetConsumption[]>(`/cpo/assets/${id}/consumptions`),

  addConsumption: (id: string, consumption: AssetConsumption) =>
    apiClient.post(`/cpo/assets/${id}/consumptions`, consumption),
};

export const companiesApi = {
  getAll: (skip?: number, limit?: number) =>
    apiClient.get<Company[]>(
      `/cpo/companies${
        skip || limit ? `?${skip ? `skip=${skip}` : ''}${limit ? `&limit=${limit}` : ''}` : ''
      }`
    ),

  getById: (id: string) => apiClient.get<Company>(`/cpo/companies/${id}`),

  create: (data: Partial<Company>) => apiClient.post<Company>('/cpo/companies', data),

  update: (id: string, data: Partial<Company>) =>
    apiClient.put<Company>(`/cpo/companies/${id}`, data),

  delete: (id: string) => apiClient.delete(`/cpo/companies/${id}`),
};

// ============================================================================
// DSO CONNECTIONS API (Local Backend) ✅ FINAL PATCHED
// ============================================================================

export const dsoApi = {
  // DSO Connection endpoints
  getConnections: () => apiClient.get<DsoConnection[]>('/dso-connections'),

  getConnectionById: (id: string) => apiClient.get<DsoConnection>(`/dso-connections/${id}`),

  // ✅ FIX: accepter tariffUrl / energyUrl
  createConnection: (data: CreateDsoConnectionInput) =>
    apiClient.post<DsoConnection>('/dso-connections', data),

  // ✅ FIX: update typé (isActive + urls + token si supporté)
  updateConnection: (id: string, data: UpdateDsoConnectionInput) =>
    apiClient.put<DsoConnection>(`/dso-connections/${id}`, data),

  deleteConnection: (id: string) => apiClient.delete(`/dso-connections/${id}`),

  // Site Link endpoints
  getSiteLinks: (connectionId?: string) =>
    apiClient.get<SiteLink[]>(
      `/dso-connections${connectionId ? `/${connectionId}` : ''}/site-links`
    ),

  getSiteLinkById: (id: string) => apiClient.get<SiteLink>(`/dso-connections/site-links/${id}`),

  createSiteLink: (data: { siteId: string; dsoConnectionId: string; dsoSiteRef?: string }) =>
    apiClient.post<SiteLink>('/dso-connections/site-links', data),

  updateSiteLink: (id: string, data: Partial<SiteLink>) =>
    apiClient.put<SiteLink>(`/dso-connections/site-links/${id}`, data),

  deleteSiteLink: (id: string) => apiClient.delete(`/dso-connections/site-links/${id}`),

  // Get available DSO sites from a connection
  getDsoSites: (connectionId: string) =>
    apiClient.get<any[]>(`/dso-connections/${connectionId}/sites`),

  // Energy sync endpoint
  syncEnergy: (siteLinkId: string) =>
    apiClient.post<EnergySnapshot>(`/dso-connections/site-links/${siteLinkId}/sync-energy`, {}),
};
