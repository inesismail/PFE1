import axios, { AxiosError, AxiosInstance } from 'axios';

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES
// ============================================================================

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

// Plugin metadata from PluginRegistry (available implementations)
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

export interface Site {
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
export type LogSource = 'CpoConnection' | 'SignalProcessor' | 'EdfSignal' | 'SiteLimit' | 'System' | 'Plugin';

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
// ACTORS API
// ============================================================================

export const actorsApi = {
  getTypes: () => api.get<ActorType[]>('/actors/types').then((r) => r.data),
  
  getAll: (type?: string) => 
    api.get<Actor[]>('/actors', { params: type ? { type } : {} }).then((r) => r.data),
  
  getById: (id: string) => api.get<Actor>(`/actors/${id}`).then((r) => r.data),
  
  create: (data: { actorTypeId: string; code: string; name: string }) =>
    api.post<Actor>('/actors', data).then((r) => r.data),
  
  update: (id: string, data: Partial<Actor>) =>
    api.put<Actor>(`/actors/${id}`, data).then((r) => r.data),
  
  delete: (id: string) => api.delete(`/actors/${id}`),
  
  getImplementations: (id: string) =>
    api.get<ActorImplementation[]>(`/actors/${id}/implementations`).then((r) => r.data),
  
  getAvailableImplementations: (id: string) =>
    api.get(`/actors/${id}/implementations/available`).then((r) => r.data),
  
  enableImplementation: (id: string, implementationCode: string, config?: Record<string, unknown>) =>
    api.post(`/actors/${id}/implementations`, { implementationCode, config }).then((r) => r.data),
  
  disableImplementation: (id: string, code: string) =>
    api.delete(`/actors/${id}/implementations/${code}`),
};

// ============================================================================
// CPO CONNECTIONS API
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
  }) => api.post<CpoConnection>('/cpo-connections/connect', data).then((r) => r.data),
  
  getAll: () => api.get<CpoConnection[]>('/cpo-connections').then((r) => r.data),
  
  getById: (id: string) => api.get<CpoConnection>(`/cpo-connections/${id}`).then((r) => r.data),
  
  update: (id: string, data: Partial<CpoConnection>) =>
    api.put<CpoConnection>(`/cpo-connections/${id}`, data).then((r) => r.data),
  
  disconnect: (id: string) => api.post(`/cpo-connections/${id}/disconnect`),
  
  delete: (id: string) => api.delete(`/cpo-connections/${id}`),
  
  syncSites: (id: string) => api.post(`/cpo-connections/${id}/sync-sites`).then((r) => r.data),
  
  updateFetchInterval: (id: string, fetchIntervalMinutes: number) =>
    api.put(`/cpo-connections/${id}/fetch-interval`, { fetchIntervalMinutes }).then((r) => r.data),
  
  updateFetchEnabled: (id: string, fetchEnabled: boolean) =>
    api.put(`/cpo-connections/${id}/fetch-enabled`, { fetchEnabled }).then((r) => r.data),
};

// ============================================================================
// SITES API
// ============================================================================

export const sitesApi = {
  getAll: (connectionId?: string) =>
    api.get<Site[]>('/sites', { params: connectionId ? { connectionId } : {} }).then((r) => r.data),
  
  getWithStatus: () => api.get<Site[]>('/sites/with-status').then((r) => r.data),
  
  getById: (id: string) => api.get<Site>(`/sites/${id}`).then((r) => r.data),
  
  update: (id: string, data: Partial<Site>) =>
    api.put<Site>(`/sites/${id}`, data).then((r) => r.data),
  
  assignRegion: (id: string, edfRegionId: string, reducedLimitKw?: number) =>
    api.post(`/sites/${id}/assign-region`, { edfRegionId, reducedLimitKw }).then((r) => r.data),
  
  unassignRegion: (id: string) => api.post(`/sites/${id}/unassign-region`),
  
  setLimit: (id: string, limitKw: number) =>
    api.post(`/sites/${id}/set-limit`, { limitKw }).then((r) => r.data),
};

// ============================================================================
// EDF REGIONS API
// ============================================================================

export const regionsApi = {
  getAll: () => api.get<EdfRegion[]>('/edf-regions').then((r) => r.data),
  
  getById: (id: string) => api.get<EdfRegion>(`/edf-regions/${id}`).then((r) => r.data),
  
  create: (data: { code: string; name: string; apiEndpoint: string; datasetId: string }) =>
    api.post<EdfRegion>('/edf-regions', data).then((r) => r.data),
  
  update: (id: string, data: Partial<EdfRegion>) =>
    api.put<EdfRegion>(`/edf-regions/${id}`, data).then((r) => r.data),
  
  delete: (id: string) => api.delete(`/edf-regions/${id}`),
  
  seed: () => api.post('/edf-regions/seed').then((r) => r.data),
};

// ============================================================================
// EDF SIGNALS API
// ============================================================================

export const signalsApi = {
  fetchAll: () => api.post('/edf-signals/fetch').then((r) => r.data),
  
  getLatest: () => api.get<Record<string, Signal>>('/edf-signals/latest').then((r) => r.data),
  
  getByRegion: (code: string) => api.get<Signal>(`/edf-signals/region/${code}`).then((r) => r.data),
  
  getCurrentByRegion: (code: string) =>
    api.get<Signal>(`/edf-signals/region/${code}/current`).then((r) => r.data),
  
  getHistory: (code: string, hours?: number) =>
    api.get<Signal[]>(`/edf-signals/region/${code}/history`, { params: { hours } }).then((r) => r.data),
  
  getStats: (code: string, hours?: number) =>
    api.get(`/edf-signals/region/${code}/stats`, { params: { hours } }).then((r) => r.data),
};

// ============================================================================
// SIGNAL PROCESSOR API
// ============================================================================

export const processorApi = {
  getStatus: () => api.get<ProcessingStatus[]>('/signal-processor/status').then((r) => r.data),
  
  trigger: (connectionId: string) =>
    api.post(`/signal-processor/trigger/${connectionId}`).then((r) => r.data),
  
  updateInterval: (connectionId: string, intervalMinutes: number) =>
    api.put(`/signal-processor/${connectionId}/interval`, { intervalMinutes }).then((r) => r.data),
  
  setEnabled: (connectionId: string, enabled: boolean) =>
    api.put(`/signal-processor/${connectionId}/enabled`, { enabled }).then((r) => r.data),
};

// ============================================================================
// LOGS API
// ============================================================================

export const logsApi = {
  getAll: (params?: LogsQueryParams) =>
    api.get<LogsResponse>('/logs', { params }).then((r) => r.data),
  
  getStats: (hours?: number) =>
    api.get<LogsStats>('/logs/stats', { params: { hours } }).then((r) => r.data),
  
  cleanup: (daysToKeep?: number) =>
    api.delete('/logs/cleanup', { params: { daysToKeep } }).then((r) => r.data),
};

export default api;
