/**
 * API Utilities and Helpers
 * 
 * Common utilities for API error handling, data transformation, etc.
 */

import { AxiosError } from 'axios';

// ============================================================================
// Error Types
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number | undefined,
    public data: any,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAxiosError(error: unknown): error is AxiosError {
  return error instanceof AxiosError;
}

/**
 * Extract error message from API response
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as any;
    return (
      data?.message ||
      data?.error ||
      error.message ||
      'An error occurred'
    );
  }

  return 'Unknown error occurred';
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): ApiError {
  if (isAxiosError(error)) {
    const statusCode = error.response?.status;
    const data = error.response?.data;
    const message = getErrorMessage(error);

    return new ApiError(statusCode, data, message);
  }

  return new ApiError(
    undefined,
    null,
    getErrorMessage(error)
  );
}

// ============================================================================
// Data Transformations
// ============================================================================

/**
 * Format power in watts to kiloWatts
 */
export function formatPower(watts: number): string {
  return `${(watts / 1000).toFixed(2)} kW`;
}

/**
 * Format energy in wattHours to kiloWattHours
 */
export function formatEnergy(wh: number): string {
  return `${(wh / 1000).toFixed(2)} kWh`;
}

/**
 * Format duration from milliseconds
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Parse ISO timestamp to readable date
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString();
}

/**
 * Parse ISO timestamp to short time
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString();
}

/**
 * Calculate charging time from transactions
 */
export function calculateChargingDuration(startTime: string, endTime?: string): number {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  return end - start;
}

/**
 * Calculate energy delivered from meter readings
 */
export function calculateEnergyDelivered(startValue: number, endValue: number): number {
  return Math.max(0, endValue - startValue);
}

/**
 * Calculate average power from energy and duration
 */
export function calculateAveragePower(energyWh: number, durationMs: number): number {
  const durationHours = durationMs / (1000 * 60 * 60);
  return durationHours > 0 ? energyWh / durationHours : 0;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate phone format (international format)
 */
export function isValidPhone(phone: string): boolean {
  const regex = /^\+?[0-9\s\-\(\)]{7,}$/;
  return regex.test(phone);
}

/**
 * Validate charging station ID format
 */
export function isValidStationId(id: string): boolean {
  return !!(id && id.length > 0 && id.trim().length > 0);
}

// ============================================================================
// Filter & Search Helpers
// ============================================================================

/**
 * Filter stations by status
 */
export function filterStationsByStatus(stations: any[], status: string) {
  return stations.filter(s => s.status === status);
}

/**
 * Filter stations that are available
 */
export function getAvailableStations(stations: any[]) {
  return filterStationsByStatus(stations, 'Available');
}

/**
 * Filter stations that are in error
 */
export function getErrorStations(stations: any[]) {
  return filterStationsByStatus(stations, 'Unavailable');
}

/**
 * Search stations by serial number or model
 */
export function searchStations(stations: any[], query: string) {
  const q = query.toLowerCase();
  return stations.filter(s => 
    s.chargeBoxSerialNumber?.toLowerCase().includes(q) ||
    s.model?.toLowerCase().includes(q) ||
    s.vendor?.toLowerCase().includes(q)
  );
}

/**
 * Filter transactions by status
 */
export function filterTransactionsByStatus(transactions: any[], status: 'active' | 'completed') {
  return transactions.filter(t => {
    if (status === 'active') {
      return !t.stopTimestamp;
    } else {
      return t.stopTimestamp;
    }
  });
}

/**
 * Get transactions for a specific station
 */
export function getStationTransactions(transactions: any[], stationId: string) {
  return transactions.filter(t => t.chargeBoxId === stationId);
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate(transactions: any[]) {
  return [...transactions].sort((a, b) => 
    new Date(b.startTimestamp).getTime() - new Date(a.startTimestamp).getTime()
  );
}

// ============================================================================
// Aggregation & Statistics
// ============================================================================

/**
 * Calculate total energy delivered
 */
export function calculateTotalEnergy(transactions: any[]): number {
  return transactions.reduce((total, tx) => {
    const energy = calculateEnergyDelivered(tx.startValue, tx.stopValue || tx.startValue);
    return total + energy;
  }, 0);
}

/**
 * Calculate average charging duration
 */
export function calculateAverageChargingDuration(transactions: any[]): number {
  if (transactions.length === 0) return 0;

  const totalDuration = transactions.reduce((total, tx) => {
    const duration = calculateChargingDuration(tx.startTimestamp, tx.stopTimestamp);
    return total + duration;
  }, 0);

  return totalDuration / transactions.length;
}

/**
 * Calculate average energy per charging session
 */
export function calculateAverageEnergyPerSession(transactions: any[]): number {
  if (transactions.length === 0) return 0;
  const totalEnergy = calculateTotalEnergy(transactions);
  return totalEnergy / transactions.length;
}

/**
 * Group transactions by user
 */
export function groupTransactionsByUser(transactions: any[]) {
  return transactions.reduce((acc, tx) => {
    const userId = tx.idTag || 'Unknown';
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(tx);
    return acc;
  }, {} as Record<string, any[]>);
}

/**
 * Group transactions by charging station
 */
export function groupTransactionsByStation(transactions: any[]) {
  return transactions.reduce((acc, tx) => {
    const stationId = tx.chargeBoxId || 'Unknown';
    if (!acc[stationId]) {
      acc[stationId] = [];
    }
    acc[stationId].push(tx);
    return acc;
  }, {} as Record<string, any[]>);
}

/**
 * Calculate transaction statistics
 */
export function calculateTransactionStats(transactions: any[]) {
  const completed = filterTransactionsByStatus(transactions, 'completed');
  const active = filterTransactionsByStatus(transactions, 'active');

  return {
    total: transactions.length,
    active: active.length,
    completed: completed.length,
    totalEnergyWh: calculateTotalEnergy(completed),
    averageDurationMs: calculateAverageChargingDuration(completed),
    averageEnergyWh: calculateAverageEnergyPerSession(completed),
  };
}

// ============================================================================
// Export Helpers
// ============================================================================

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');

  return csv;
}

/**
 * Download data as CSV file
 */
export function downloadAsCSV(data: any[], filename: string) {
  const csv = arrayToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data to JSON and download
 */
export function downloadAsJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ============================================================================
// Rate Limiting & Debouncing
// ============================================================================

/**
 * Simple debounce helper
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Simple throttle helper
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// ============================================================================
// Cache Helper
// ============================================================================

export class SimpleCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

export default {
  // Errors
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

  // Statistics
  calculateTransactionStats,
  groupTransactionsByUser,
  groupTransactionsByStation,

  // Export
  arrayToCSV,
  downloadAsCSV,
  downloadAsJSON,

  // Utilities
  debounce,
  throttle,
  SimpleCache,
};
