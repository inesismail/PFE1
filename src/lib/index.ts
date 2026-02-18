/**
 * API Module Index
 * 
 * Central export point for all API-related modules and utilities.
 * Import from here instead of importing individual files.
 */

// ============================================================================
// Clients
// ============================================================================

export { apiClient } from './api-client';
export { cpoClient } from './cpo-client';

// ============================================================================
// Local Backend API
// ============================================================================

export {
  // Types
  type ActorType,
  type Actor,
  type Implementation,
  type PluginMetadata,
  type ActorImplementation,
  type CpoConnection,
  type EdfRegion,
  type LocalSite,
  type Signal,
  type ProcessingStatus,
  type LogLevel,
  type LogSource,
  type SystemLog,
  type LogsQueryParams,
  type LogsResponse,
  type LogsStats,
  // APIs
  actorsApi,
  cpoApi,
  sitesApi,
  regionsApi,
  signalsApi,
  processorApi,
  logsApi,
} from './api';

// ============================================================================
// WattzHub CPO Types
// ============================================================================

export {
  // Types
  type Connector,
  type ChargingStationConnector,
  type ChargingStation,
  type Transaction,
  type MeterValue,
  type User,
  type Tag,
  type Site,
  type SiteArea,
  type Company,
  type Asset,
  type AssetConsumption,
  type ApiResponse,
  // APIs
  chargingStationsApi,
  transactionsApi,
  usersApi,
  tagsApi,
  sitesWattzApi,
  siteAreasApi,
  assetsApi,
  companiesApi,
} from './api';

// ============================================================================
// Utilities
// ============================================================================

export {
  // Error handling
  ApiError,
  isApiError,
  isAxiosError,
  getErrorMessage,
  handleApiError,
  // Formatting
  formatPower,
  formatEnergy,
  formatDuration,
  formatDate,
  formatTime,
  // Calculations
  calculateChargingDuration,
  calculateEnergyDelivered,
  calculateAveragePower,
  calculateTotalEnergy,
  calculateAverageChargingDuration,
  calculateAverageEnergyPerSession,
  calculateTransactionStats,
  // Validation
  isValidEmail,
  isValidPhone,
  isValidStationId,
  // Filtering & Search
  filterStationsByStatus,
  getAvailableStations,
  getErrorStations,
  searchStations,
  filterTransactionsByStatus,
  getStationTransactions,
  sortTransactionsByDate,
  groupTransactionsByUser,
  groupTransactionsByStation,
  // Export
  arrayToCSV,
  downloadAsCSV,
  downloadAsJSON,
  // Other
  debounce,
  throttle,
  SimpleCache,
} from './api-utils';

// ============================================================================
// Quick Reference
// ============================================================================

/**
 * Quick reference for commonly used APIs:
 *
 * Charging Stations:
 * - cpoClient.getChargingStations()
 * - cpoClient.getChargingStation(id)
 * - cpoClient.remoteStartCharging(id, connectorId, tag?)
 * - cpoClient.remoteStopCharging(id, transactionId)
 *
 * Transactions:
 * - cpoClient.getTransactions()
 * - cpoClient.getActiveTransactions()
 * - cpoClient.getCompletedTransactions()
 * - cpoClient.stopTransaction(id)
 *
 * Users:
 * - cpoClient.getUsers()
 * - cpoClient.createUser(data)
 * - cpoClient.updateUser(id, data)
 * - cpoClient.deleteUser(id)
 *
 * Tags:
 * - cpoClient.getTags()
 * - cpoClient.createTag(data)
 * - cpoClient.assignTagToUser(tagId, userId)
 *
 * Local Backend:
 * - cpoApi.getAll()           // Get CPO connections
 * - sitesApi.getAll()         // Get local sites
 * - signalsApi.getLatest()    // Get EDF signals
 * - logsApi.getAll()          // Get system logs
 *
 * Utilities:
 * - formatPower(watts)
 * - formatEnergy(wh)
 * - calculateTransactionStats(transactions)
 * - filterStationsByStatus(stations, status)
 * - downloadAsCSV(data, filename)
 */
