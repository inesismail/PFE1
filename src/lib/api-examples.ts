/**
 * API Usage Examples - WattzHub CPO Integration
 * 
 * This file demonstrates how to consume the WattzHub CPO API through your frontend.
 * All calls are proxied through your local backend (/cpo/* routes).
 * 
 * Authentication is handled automatically via JWT tokens stored in localStorage.
 */

// ============================================================================
// EXAMPLE 1: Get Charging Stations
// ============================================================================

import { cpoClient } from '@/lib/cpo-client';
import { chargingStationsApi } from '@/lib/api';

export async function exampleGetChargingStations() {
  try {
    // Simple get all
    const stations = await cpoClient.getChargingStations();
    console.log('All stations:', stations);

    // With pagination
    const paginatedStations = await cpoClient.getChargingStations({ 
      skip: 0, 
      limit: 50 
    });
    console.log('Paginated stations:', paginatedStations);

    // Get specific station
    const station = await cpoClient.getChargingStation('station-123');
    console.log('Station details:', station);
  } catch (error) {
    console.error('Failed to get stations:', error);
  }
}

// ============================================================================
// EXAMPLE 2: Control Charging (Remote Start/Stop)
// ============================================================================

export async function exampleControlCharging() {
  try {
    // Start charging on connector
    const startResult = await cpoClient.remoteStartCharging(
      'station-123',
      1, // connector ID
      'USER-TAG-123' // optional user tag
    );
    console.log('Charging started:', startResult);

    // Stop charging transaction
    const stopResult = await cpoClient.softStopTransaction('transaction-456');
    console.log('Charging stopped:', stopResult);

    // Soft stop (graceful stop)
    const softStopResult = await cpoClient.softStopTransaction('transaction-456');
    console.log('Soft stop initiated:', softStopResult);
  } catch (error) {
    console.error('Failed to control charging:', error);
  }
}

// ============================================================================
// EXAMPLE 3: Get Transactions and Energy Consumption
// ============================================================================

export async function exampleGetTransactions() {
  try {
    // Get all transactions
    const allTransactions = await cpoClient.getTransactions({ 
      skip: 0, 
      limit: 100 
    });
    console.log('All transactions:', allTransactions);

    // Get completed transactions
    const completed = await cpoClient.getCompletedTransactions({ 
      limit: 50 
    });
    console.log('Completed transactions:', completed);

    // Get active charging sessions
    const active = await cpoClient.getActiveTransactions();
    console.log('Active sessions:', active);

    // Get specific transaction details
    const transaction = await cpoClient.getTransaction('transaction-123');
    console.log('Transaction details:', transaction);

    // Get meter values (consumption data)
    const consumption = await cpoClient.getTransactionConsumptions('transaction-123');
    console.log('Energy consumption data:', consumption);
  } catch (error) {
    console.error('Failed to get transactions:', error);
  }
}

// ============================================================================
// EXAMPLE 4: Manage Users and Tags
// ============================================================================

export async function exampleUserManagement() {
  try {
    // Get all users
    const users = await cpoClient.getUsers({ limit: 100 });
    console.log('All users:', users);

    // Create new user
    const newUser = await cpoClient.createUser({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+33123456789'
    }) as any;
    console.log('User created:', newUser);

    // Update user
    const updated = await cpoClient.updateUser((newUser as any).id, {
      firstName: 'Jane'
    });
    console.log('User updated:', updated);

    // Get user's sites
    const userSites = await cpoClient.getUserSites((newUser as any).id);
    console.log('User sites:', userSites);

    // Manage tags
    const tags = await cpoClient.getTags({ limit: 50 });
    console.log('All tags:', tags);

    // Create tag for user
    const tag = await cpoClient.createTag({
      idToken: 'RFID123456',
      type: 'RFID',
      issuer: 'MyCompany'
    }) as any;
    console.log('Tag created:', tag);

    // Assign tag to user
    await cpoClient.assignTagToUser((tag as any).id, (newUser as any).id);
    console.log('Tag assigned to user');
  } catch (error) {
    console.error('Failed to manage users:', error);
  }
}

// ============================================================================
// EXAMPLE 5: Manage Sites and Site Areas
// ============================================================================

export async function exampleSiteManagement() {
  try {
    // Get all sites
    const sites = await cpoClient.getSites({ limit: 50 });
    console.log('All sites:', sites);

    // Get specific site
    const site = await cpoClient.getSite('site-123');
    console.log('Site details:', site);

    // Create site
    const newSite = await cpoClient.createSite({
      name: 'New Charging Hub',
      address: '123 Main St, Paris'
    }) as any;
    console.log('Site created:', newSite);

    // Get site areas
    const siteAreas = await cpoClient.getSiteAreas();
    console.log('Site areas:', siteAreas);

    // Create site area
    const siteArea = await cpoClient.createSiteArea({
      name: 'North Parking',
      siteID: (newSite as any).id
    });
    console.log('Site area created:', siteArea);
  } catch (error) {
    console.error('Failed to manage sites:', error);
  }
}

// ============================================================================
// EXAMPLE 6: Get Statistics and Analytics
// ============================================================================

export async function exampleGetStatistics() {
  try {
    // Charging station consumption stats
    const stationStats = await cpoClient.getChargingStationConsumptionStats({
      // Add query parameters as needed
    });
    console.log('Station consumption stats:', stationStats);

    // User consumption stats
    const userStats = await cpoClient.getUserConsumptionStats();
    console.log('User consumption stats:', userStats);
  } catch (error) {
    console.error('Failed to get statistics:', error);
  }
}

// ============================================================================
// EXAMPLE 7: Assets Management (Battery Storage, PV, etc)
// ============================================================================

export async function exampleAssetManagement() {
  try {
    // Get all assets
    const assets = await cpoClient.getAssets({ limit: 100 });
    console.log('All assets:', assets);

    // Create asset
    const asset = await cpoClient.createAsset({
      name: 'Solar Panel Array',
      assetType: 'SOLAR',
      siteAreaID: 'site-area-123'
    }) as any;
    console.log('Asset created:', asset);

    // Get asset consumption
    const consumption = await cpoClient.getAssetConsumptions((asset as any).id);
    console.log('Asset consumption:', consumption);
  } catch (error) {
    console.error('Failed to manage assets:', error);
  }
}

// ============================================================================
// EXAMPLE 8: Billing and Invoices
// ============================================================================

export async function exampleBillingManagement() {
  try {
    // Get billing accounts
    const accounts = await cpoClient.getBillingAccounts();
    console.log('Billing accounts:', accounts);

    // Get all invoices
    const invoices = await cpoClient.getInvoices({ limit: 50 });
    console.log('All invoices:', invoices);

    // Get specific invoice
    const invoice = await cpoClient.getInvoice('invoice-123');
    console.log('Invoice details:', invoice);

    // Download invoice PDF
    const pdfUrl = await cpoClient.downloadInvoice('invoice-123');
    console.log('Invoice PDF URL:', pdfUrl);
  } catch (error) {
    console.error('Failed to manage billing:', error);
  }
}

// ============================================================================
// EXAMPLE 9: Station Configuration and Maintenance
// ============================================================================

export async function exampleStationMaintenance() {
  try {
    const stationId = 'station-123';

    // Get station status
    const status = await cpoClient.getChargingStationStatus(stationId);
    console.log('Station status:', status);

    // Reset station
    await cpoClient.resetChargingStation(stationId);
    console.log('Station reset completed');

    // Clear station cache
    await cpoClient.clearChargingStationCache(stationId);
    console.log('Station cache cleared');

    // Update availability
    await cpoClient.updateAvailability(stationId, 'AVAILABLE');
    console.log('Availability updated');

    // Set power limit
    await cpoClient.setPowerLimit(stationId, 22); // 22 kW
    console.log('Power limit set to 22kW');

    // Unlock connector
    await cpoClient.unlockConnector(stationId, 1);
    console.log('Connector 1 unlocked');

    // Get station transactions
    const transactions = await cpoClient.getChargingStationTransactions(stationId);
    console.log('Station transactions:', transactions);
  } catch (error) {
    console.error('Failed maintenance operations:', error);
  }
}

// ============================================================================
// EXAMPLE 10: Using Local API Endpoints (Non-CPO)
// ============================================================================

import { 
  sitesApi, 
  cpoApi, 
  actorsApi, 
  regionsApi,
  signalsApi 
} from '@/lib/api';

export async function exampleLocalBackendAPI() {
  try {
    // Local backend endpoints (not CPO proxied)
    
    // Get CPO connections configured on local system
    const connections = await cpoApi.getAll();
    console.log('CPO connections:', connections);

    // Get actors/integrations
    const actors = await actorsApi.getAll();
    console.log('Actors:', actors);

    // Get EDF regions (local data)
    const regions = await regionsApi.getAll();
    console.log('EDF regions:', regions);

    // Get latest EDF signals
    const signals = await signalsApi.getLatest();
    console.log('Latest signals:', signals);

    // Get local sites
    const localSites = await sitesApi.getAll();
    console.log('Local sites:', localSites);
  } catch (error) {
    console.error('Failed local API calls:', error);
  }
}

// ============================================================================
// REACT HOOK EXAMPLE: Use in Components
// ============================================================================

import { useEffect, useState } from 'react';
import type { ChargingStation } from '@/lib/api';

export function useChargingStations() {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        setLoading(true);
        const data = await cpoClient.getChargingStations({ limit: 100 });
        setStations((data || []) as ChargingStation[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, []);

  return { stations, loading, error };
}

// Usage in component:
/*
function ChargingStationsPage() {
  const { stations, loading, error } = useChargingStations();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {stations.map(station => (
        <div key={station.id}>{station.chargeBoxSerialNumber}</div>
      ))}
    </div>
  );
}
*/

export default {
  exampleGetChargingStations,
  exampleControlCharging,
  exampleGetTransactions,
  exampleUserManagement,
  exampleSiteManagement,
  exampleGetStatistics,
  exampleAssetManagement,
  exampleBillingManagement,
  exampleStationMaintenance,
  exampleLocalBackendAPI,
  useChargingStations,
};
