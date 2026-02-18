/**
 * CPO Client - WattzHub CPO API Integration
 * 
 * This module provides a configured client for consuming the WattzHub CPO REST API.
 * The API uses JWT Bearer token authentication and is proxied through the local backend.
 * 
 * Base URL: https://beta.cpo.server.wattzhub.com/v1
 * API Docs: https://beta.cpo.server.wattzhub.com/v1/docs/
 * 
 * Usage Example:
 * ```typescript
 * import { cpoClient } from '@/lib/cpo-client';
 * 
 * // Get charging stations
 * const stations = await cpoClient.get('/api/charging-stations');
 * 
 * // Start charging
 * await cpoClient.put('/api/charging-stations/{id}/remote/start', {
 *   connectorId: 1,
 *   idTag: 'USER123'
 * });
 * ```
 */

import { apiClient } from './api-client';

// ============================================================================
// CPO API Routes
// ============================================================================

interface RequestOptions {
  skip?: number;
  limit?: number;
  [key: string]: unknown;
}

/**
 * Proxy to WattzHub CPO API through local backend
 */
export const cpoClient = {
  /**
   * GET Charging Stations
   * @example cpoClient.getChargingStations({ skip: 0, limit: 50 })
   */
  getChargingStations: (options?: RequestOptions) => 
    apiClient.get(`/cpo/api/charging-stations${buildQueryString(options)}`),

  /**
   * GET Charging Station by ID
   */
  getChargingStation: (id: string) =>
    apiClient.get(`/cpo/api/charging-stations/${id}`),

  /**
   * GET Charging Station Transactions
   */
  getChargingStationTransactions: (id: string) =>
    apiClient.get(`/cpo/api/charging-stations/${id}/transactions`),

  /**
   * GET Charging Station Status
   */
  getChargingStationStatus: (id: string) =>
    apiClient.get(`/cpo/api/charging-stations/${id}/status`),

  /**
   * PUT Reset Charging Station
   */
  resetChargingStation: (id: string) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/reset`, {}),

  /**
   * PUT Clear Charging Station Cache
   */
  clearChargingStationCache: (id: string) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/cache/clear`, {}),

  /**
   * PUT Remote Start Charging
   */
  remoteStartCharging: (id: string, connectorId: number, idTag?: string) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/remote/start`, { 
      connectorId, 
      idTag 
    }),

  /**
   * PUT Remote Stop Charging
   */
  remoteStopCharging: (id: string, transactionId: number) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/remote/stop`, { 
      transactionId 
    }),

  /**
   * PUT Unlock Connector
   */
  unlockConnector: (id: string, connectorId: number) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/connectors/${connectorId}/unlock`, {}),

  /**
   * PUT Update Charging Station Availability
   */
  updateAvailability: (id: string, availability: string) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/availability/change`, { 
      availability 
    }),

  /**
   * PUT Set Power Limit
   */
  setPowerLimit: (id: string, limit: number) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/power/limit`, { 
      limit 
    }),

  /**
   * PUT Set OCPP Parameters
   */
  setParameters: (id: string, parameters: Record<string, string>) =>
    apiClient.put(`/cpo/api/charging-stations/${id}/parameters`, parameters),

  /**
   * GET Transactions
   */
  getTransactions: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/transactions${buildQueryString(options)}`),

  /**
   * GET Transaction by ID
   */
  getTransaction: (id: string) =>
    apiClient.get(`/cpo/api/transactions/${id}`),

  /**
   * GET Completed Transactions
   */
  getCompletedTransactions: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/transactions/status/completed${buildQueryString(options)}`),

  /**
   * GET Active Transactions
   */
  getActiveTransactions: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/transactions/status/active${buildQueryString(options)}`),

  /**
   * GET Transaction Consumptions (meter values)
   */
  getTransactionConsumptions: (id: string) =>
    apiClient.get(`/cpo/api/transactions/${id}/consumptions`),

  /**
   * PUT Stop Transaction
   */
  stopTransaction: (id: string) =>
    apiClient.put(`/cpo/api/transactions/${id}/stop`, {}),

  /**
   * PUT Soft Stop Transaction
   */
  softStopTransaction: (id: string) =>
    apiClient.put(`/cpo/api/transactions/${id}/soft-stop`, {}),

  /**
   * GET Users
   */
  getUsers: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/users${buildQueryString(options)}`),

  /**
   * GET User by ID
   */
  getUser: (id: string) =>
    apiClient.get(`/cpo/api/users/${id}`),

  /**
   * POST Create User
   */
  createUser: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/users', data),

  /**
   * PUT Update User
   */
  updateUser: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/users/${id}`, data),

  /**
   * DELETE Delete User
   */
  deleteUser: (id: string) =>
    apiClient.delete(`/cpo/api/users/${id}`),

  /**
   * GET User Sites
   */
  getUserSites: (id: string) =>
    apiClient.get(`/cpo/api/users/${id}/sites`),

  /**
   * GET Tags
   */
  getTags: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/tags${buildQueryString(options)}`),

  /**
   * GET Tag by ID
   */
  getTag: (id: string) =>
    apiClient.get(`/cpo/api/tags/${id}`),

  /**
   * POST Create Tag
   */
  createTag: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/tags', data),

  /**
   * PUT Update Tag
   */
  updateTag: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/tags/${id}`, data),

  /**
   * DELETE Delete Tag
   */
  deleteTag: (id: string) =>
    apiClient.delete(`/cpo/api/tags/${id}`),

  /**
   * PUT Assign Tag to User
   */
  assignTagToUser: (id: string, userId: string) =>
    apiClient.put(`/cpo/api/tags/${id}/assign`, { userId }),

  /**
   * GET Sites
   */
  getSites: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/sites${buildQueryString(options)}`),

  /**
   * GET Site by ID
   */
  getSite: (id: string) =>
    apiClient.get(`/cpo/api/sites/${id}`),

  /**
   * POST Create Site
   */
  createSite: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/sites', data),

  /**
   * PUT Update Site
   */
  updateSite: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/sites/${id}`, data),

  /**
   * DELETE Delete Site
   */
  deleteSite: (id: string) =>
    apiClient.delete(`/cpo/api/sites/${id}`),

  /**
   * GET Site Areas
   */
  getSiteAreas: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/site-areas${buildQueryString(options)}`),

  /**
   * GET Site Area by ID
   */
  getSiteArea: (id: string) =>
    apiClient.get(`/cpo/api/site-areas/${id}`),

  /**
   * POST Create Site Area
   */
  createSiteArea: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/site-areas', data),

  /**
   * PUT Update Site Area
   */
  updateSiteArea: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/site-areas/${id}`, data),

  /**
   * DELETE Delete Site Area
   */
  deleteSiteArea: (id: string) =>
    apiClient.delete(`/cpo/api/site-areas/${id}`),

  /**
   * GET Assets
   */
  getAssets: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/assets${buildQueryString(options)}`),

  /**
   * GET Asset by ID
   */
  getAsset: (id: string) =>
    apiClient.get(`/cpo/api/assets/${id}`),

  /**
   * POST Create Asset
   */
  createAsset: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/assets', data),

  /**
   * PUT Update Asset
   */
  updateAsset: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/assets/${id}`, data),

  /**
   * DELETE Delete Asset
   */
  deleteAsset: (id: string) =>
    apiClient.delete(`/cpo/api/assets/${id}`),

  /**
   * GET Asset Consumptions
   */
  getAssetConsumptions: (id: string) =>
    apiClient.get(`/cpo/api/assets/${id}/consumptions`),

  /**
   * GET Companies
   */
  getCompanies: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/companies${buildQueryString(options)}`),

  /**
   * GET Company by ID
   */
  getCompany: (id: string) =>
    apiClient.get(`/cpo/api/companies/${id}`),

  /**
   * POST Create Company
   */
  createCompany: (data: Record<string, unknown>) =>
    apiClient.post('/cpo/api/companies', data),

  /**
   * PUT Update Company
   */
  updateCompany: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/cpo/api/companies/${id}`, data),

  /**
   * DELETE Delete Company
   */
  deleteCompany: (id: string) =>
    apiClient.delete(`/cpo/api/companies/${id}`),

  /**
   * GET Statistics - Charging Station Consumption
   */
  getChargingStationConsumptionStats: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/statistics/charging-stations/consumption${buildQueryString(options)}`),

  /**
   * GET Statistics - User Consumption
   */
  getUserConsumptionStats: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/statistics/users/consumption${buildQueryString(options)}`),

  /**
   * GET OCPI Endpoints
   */
  getOcpiEndpoints: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/ocpi/endpoints${buildQueryString(options)}`),

  /**
   * GET Settings
   */
  getSettings: () =>
    apiClient.get('/cpo/api/settings'),

  /**
   * GET Billing Accounts
   */
  getBillingAccounts: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/billing/accounts${buildQueryString(options)}`),

  /**
   * GET Invoices
   */
  getInvoices: (options?: RequestOptions) =>
    apiClient.get(`/cpo/api/invoices${buildQueryString(options)}`),

  /**
   * GET Invoice by ID
   */
  getInvoice: (id: string) =>
    apiClient.get(`/cpo/api/invoices/${id}`),

  /**
   * GET Invoice Download (PDF)
   */
  downloadInvoice: (id: string) =>
    apiClient.get(`/cpo/api/invoices/${id}/download`),
};

/**
 * Helper function to build query string from options
 */
function buildQueryString(options?: Record<string, unknown>): string {
  if (!options || Object.keys(options).length === 0) {
    return '';
  }
  const params = new URLSearchParams();
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  return params.toString() ? `?${params.toString()}` : '';
}

export default cpoClient;
