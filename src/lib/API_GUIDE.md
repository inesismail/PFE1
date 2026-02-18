# API Integration Guide - WattzHub CPO

## Overview

This project integrates with the **WattzHub CPO REST API** for managing electric vehicle charging stations. The API is proxied through the local backend for security and consistency.

### Key Resources:
- **API Base URL**: `https://beta.cpo.server.wattzhub.com/v1`
- **API Docs**: [https://beta.cpo.server.wattzhub.com/v1/docs/](https://beta.cpo.server.wattzhub.com/v1/docs/)
- **API Version**: 1.0.0 (OpenAPI 3.0)

---

## Architecture

```
Frontend (Next.js)
    ↓
    └─→ apiClient (with auth & token refresh)
            ↓
            └─→ Local Backend (NestJS)
                    ↓
                    └─→ WattzHub CPO API (proxied /cpo/*)
```

All API calls are proxied through `/cpo/*` routes in your local backend for:
- ✅ Centralized authentication/token management
- ✅ Error handling and logging
- ✅ Rate limiting and caching
- ✅ Security (no exposing external URLs to frontend)

---

## Quick Start

### 1. Import the CPO Client

```typescript
import { cpoClient } from '@/lib/cpo-client';
```

### 2. Make API Calls

```typescript
// Get all charging stations
const stations = await cpoClient.getChargingStations({ limit: 50 });

// Get specific station
const station = await cpoClient.getChargingStation('station-123');

// Control charging
await cpoClient.remoteStartCharging('station-123', 1, 'USER-TAG');
```

### 3. Pagination

All list endpoints support pagination:

```typescript
// Get stations with pagination
const stations = await cpoClient.getChargingStations({
  skip: 0,    // Offset
  limit: 50   // Items per page
});
```

---

## API Endpoints Overview

### Charging Stations

```typescript
// Get operations
cpoClient.getChargingStations(options)        // List all
cpoClient.getChargingStation(id)              // Get by ID
cpoClient.getChargingStationStatus(id)        // Get status
cpoClient.getChargingStationTransactions(id)  // Get transactions

// Control operations
cpoClient.remoteStartCharging(id, connectorId, idTag?)
cpoClient.remoteStopCharging(id, transactionId)
cpoClient.unlockConnector(id, connectorId)
cpoClient.updateAvailability(id, availability)
cpoClient.setPowerLimit(id, limitKw)

// Maintenance
cpoClient.resetChargingStation(id)
cpoClient.clearChargingStationCache(id)
cpoClient.setParameters(id, parameters)
```

### Transactions

```typescript
cpoClient.getTransactions(options)            // All transactions
cpoClient.getTransaction(id)                  // Get by ID
cpoClient.getCompletedTransactions(options)   // Completed only
cpoClient.getActiveTransactions(options)      // Active sessions
cpoClient.getTransactionConsumptions(id)      // Meter values
cpoClient.stopTransaction(id)                 // Stop charging
cpoClient.softStopTransaction(id)             // Graceful stop
```

### Users & Tags

```typescript
// Users
cpoClient.getUsers(options)                   // List users
cpoClient.getUser(id)                         // Get by ID
cpoClient.createUser(data)                    // Create new
cpoClient.updateUser(id, data)                // Update
cpoClient.deleteUser(id)                      // Delete
cpoClient.getUserSites(id)                    // User's sites

// Tags (RFID, etc)
cpoClient.getTags(options)                    // List tags
cpoClient.getTag(id)                          // Get by ID
cpoClient.createTag(data)                     // Create new
cpoClient.updateTag(id, data)                 // Update
cpoClient.deleteTag(id)                       // Delete
cpoClient.assignTagToUser(tagId, userId)     // Assign to user
```

### Sites & Site Areas

```typescript
// Sites
cpoClient.getSites(options)                   // List sites
cpoClient.getSite(id)                         // Get by ID
cpoClient.createSite(data)                    // Create new
cpoClient.updateSite(id, data)                // Update
cpoClient.deleteSite(id)                      // Delete

// Site Areas
cpoClient.getSiteAreas(options)               // List areas
cpoClient.getSiteArea(id)                     // Get by ID
cpoClient.createSiteArea(data)                // Create new
cpoClient.updateSiteArea(id, data)            // Update
cpoClient.deleteSiteArea(id)                  // Delete
```

### Assets (Battery, Solar, etc)

```typescript
cpoClient.getAssets(options)                  // List assets
cpoClient.getAsset(id)                        // Get by ID
cpoClient.createAsset(data)                   // Create new
cpoClient.updateAsset(id, data)               // Update
cpoClient.deleteAsset(id)                     // Delete
cpoClient.getAssetConsumptions(id)            // Energy consumption
```

### Billing & Invoices

```typescript
cpoClient.getBillingAccounts(options)         // List accounts
cpoClient.getInvoices(options)                // List invoices
cpoClient.getInvoice(id)                      // Get invoice
cpoClient.downloadInvoice(id)                 // Download PDF
```

### Statistics

```typescript
cpoClient.getChargingStationConsumptionStats()  // Station stats
cpoClient.getUserConsumptionStats()             // User stats
```

### Other

```typescript
cpoClient.getCompanies(options)               // List companies
cpoClient.getOcpiEndpoints(options)           // OCPI config
cpoClient.getSettings()                       // API settings
```

---

## Local Backend API

Your local backend also provides endpoints not proxied to CPO API:

```typescript
import { 
  actorsApi, 
  cpoApi, 
  sitesApi, 
  regionsApi, 
  signalsApi, 
  logsApi 
} from '@/lib/api';

// Actors/Integrations
actorsApi.getAll()
actorsApi.getById(id)
actorsApi.create(data)

// CPO Connections (configured on local system)
cpoApi.getAll()
cpoApi.getById(id)
cpoApi.connect(config)
cpoApi.syncSites(id)

// Local Sites (synchronized from CPO)
sitesApi.getAll()
sitesApi.getById(id)
sitesApi.setLimit(id, limitKw)
sitesApi.setOverride(id, limitKw, duration, reason)

// EDF Regions
regionsApi.getAll()
regionsApi.getById(id)

// Signals (real-time data)
signalsApi.fetchAll()
signalsApi.getLatest()
signalsApi.getByRegion(code)

// System Logs
logsApi.getAll(params)
logsApi.getStats(hours)
```

---

## Usage Examples

### Example 1: List Charging Stations

```typescript
import { cpoClient } from '@/lib/cpo-client';

async function loadChargingStations() {
  try {
    const stations = await cpoClient.getChargingStations({
      skip: 0,
      limit: 50
    });
    console.log('Stations:', stations);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 2: Control Charging

```typescript
async function startCharging(stationId: string, connectorId: number) {
  try {
    await cpoClient.remoteStartCharging(
      stationId,
      connectorId,
      'USER-TAG-123' // optional
    );
    console.log('Charging started');
  } catch (error) {
    console.error('Error:', error);
  }
}

async function stopCharging(transactionId: number, stationId: string) {
  try {
    await cpoClient.remoteStopCharging(stationId, transactionId);
    console.log('Charging stopped');
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 3: Get Transaction Data

```typescript
async function getTransactionDetails(transactionId: string) {
  try {
    const transaction = await cpoClient.getTransaction(transactionId);
    const consumption = await cpoClient.getTransactionConsumptions(transactionId);
    
    console.log('Transaction:', transaction);
    console.log('Energy consumed:', consumption);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Example 4: React Hook Pattern

```typescript
import { useEffect, useState } from 'react';
import { cpoClient } from '@/lib/cpo-client';

function useChargingStations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await cpoClient.getChargingStations({ limit: 100 });
        setStations(data);
      } catch (err) {
        setError(err?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetch();
  }, []);

  return { stations, loading, error };
}

// Usage in component
export function StationsList() {
  const { stations, loading, error } = useChargingStations();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {stations.map(station => (
        <li key={station.id}>
          {station.chargeBoxSerialNumber} - {station.status}
        </li>
      ))}
    </ul>
  );
}
```

---

## Error Handling

All API calls return promises that may reject. Handle errors gracefully:

```typescript
try {
  const stations = await cpoClient.getChargingStations();
} catch (error) {
  if (error instanceof AxiosError) {
    console.error('API Error:', error.response?.status, error.response?.data);
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Authentication

Authentication is handled automatically by `apiClient`:
- Access token stored in localStorage
- Automatic token refresh on 401
- Token attached to all requests via `Authorization: Bearer <token>` header
- Session redirection to login on refresh failure

No manual token management needed in component code.

---

## Environment Variables

Configure API endpoints in `.env.local`:

```env
# Local backend (where CPO calls are proxied to)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Optional: Direct CPO API (not recommended in production)
# NEXT_PUBLIC_CPO_API_URL=https://beta.cpo.server.wattzhub.com/v1
```

---

## File Structure

```
src/lib/
├── api.ts              # Local backend API types & functions
├── api-client.ts       # Axios client with auth
├── cpo-client.ts       # WattzHub CPO API wrapper
└── api-examples.ts     # Usage examples & patterns
```

---

## Related Resources

- [WattzHub API Documentation](https://beta.cpo.server.wattzhub.com/v1/docs/)
- [OpenAPI Specification](https://beta.cpo.server.wattzhub.com/v1/docs/)
- Local Backend (NestJS) - Check `back/flexee_backend/src/modules/`

---

## Next Steps

1. ✅ Review `api-examples.ts` for common patterns
2. ✅ Test API calls using the examples
3. ✅ Create React components using the hooks pattern
4. ✅ Implement error handling in your pages
5. ✅ Add loading states and caching as needed

---

## Support

For issues with:
- **Frontend API Integration**: Check `src/lib/` files and type definitions
- **Backend CPO Proxy**: Check `back/flexee_backend/src/modules/cpo-connection/`
- **WattzHub API**: Refer to official docs at https://beta.cpo.server.wattzhub.com/v1/docs/
