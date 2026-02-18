# 📚 API Documentation Index

Welcome! This guide helps you navigate all the API documentation and examples.

---

## 🚀 **Start Here**

### New to this integration?
→ **[SUMMARY.md](SUMMARY.md)** (Quick reference - 5 min read)

### Want complete guide?
→ **[API_GUIDE.md](API_GUIDE.md)** (Full documentation - 15 min read)

### Need code examples?
→ **[api-examples.ts](api-examples.ts)** (Function patterns)

### Building React components?
→ **[components-examples.tsx](components-examples.tsx)** (Component patterns)

---

## 📖 Documentation Files

| File | Purpose | Time |
|------|---------|------|
| **SUMMARY.md** | Quick reference & common tasks | 5 min |
| **API_GUIDE.md** | Complete developer guide | 15 min |
| **CHANGELOG.md** | What changed and why | 10 min |
| **INTEGRATION_STATUS.md** | Detailed status report | 5 min |
| **This file** | Documentation index | 3 min |

---

## 💻 Code Files

| File | Purpose | Contains |
|------|---------|----------|
| **cpo-client.ts** | WattzHub API wrapper | 50+ methods |
| **api.ts** | Local API & types | Types + 7 API groups |
| **api-utils.ts** | Helper functions | 30+ utilities |
| **api-examples.ts** | Usage examples | 10+ examples |
| **components-examples.tsx** | React components | 6 components |
| **api-client.ts** | HTTP client | Auth + token refresh |
| **index.ts** | Central exports | All exports |

---

## 🎯 Find What You Need

### I want to...

**...get charging stations**
```typescript
import { cpoClient } from '@/lib/cpo-client';
const stations = await cpoClient.getChargingStations();
// See: api-examples.ts:exampleGetChargingStations()
```

**...control charging**
```typescript
await cpoClient.remoteStartCharging(id, connectorId, tag);
// See: api-examples.ts:exampleControlCharging()
```

**...manage transactions**
```typescript
const txs = await cpoClient.getActiveTransactions();
// See: api-examples.ts:exampleGetTransactions()
```

**...manage users**
```typescript
const user = await cpoClient.createUser(data);
// See: api-examples.ts:exampleUserManagement()
```

**...export data**
```typescript
import { downloadAsCSV } from '@/lib/api-utils';
downloadAsCSV(data, 'file.csv');
// See: api-utils.ts line ~420
```

**...build a component**
```typescript
import { ChargingStationsList } from '@/lib/components-examples';
// See: components-examples.tsx
```

**...format data**
```typescript
import { formatPower, formatEnergy } from '@/lib/api-utils';
const power = formatPower(11000); // "11.00 kW"
// See: api-utils.ts lines ~80-90
```

**...handle errors**
```typescript
import { handleApiError } from '@/lib/api-utils';
try { ... } catch(e) { handleApiError(e); }
// See: api-utils.ts lines ~30-60
```

---

## 📊 API Coverage

### Fully Implemented Endpoints

- ✅ **Charging Stations** (15 methods)
- ✅ **Transactions** (8 methods)
- ✅ **Users** (7 methods)
- ✅ **Tags** (7 methods)
- ✅ **Sites** (7 methods)
- ✅ **Site Areas** (7 methods)
- ✅ **Assets** (7 methods)
- ✅ **Companies** (5 methods)
- ✅ **Billing** (5 methods)
- ✅ **Statistics** (2 methods)
- ✅ **Other** (3 methods)

**Total: 50+ endpoints**

See [API_GUIDE.md](API_GUIDE.md#-api-endpoints-overview) for full list.

---

## 🔍 Quick Reference

### Import Clients
```typescript
import { cpoClient } from '@/lib/cpo-client';
import { apiClient } from '@/lib/api-client';
```

### Import Utilities
```typescript
import { 
  formatPower, 
  calculateTransactionStats,
  downloadAsCSV 
} from '@/lib/api-utils';
```

### Import Components
```typescript
import {
  ChargingStationsList,
  useChargingStations,
  ActiveTransactionsList
} from '@/lib/components-examples';
```

### Import Types
```typescript
import {
  ChargingStation,
  Transaction,
  User,
  Tag
} from '@/lib/api';
```

---

## 🎓 Learning Paths

### Beginner
1. Read [SUMMARY.md](SUMMARY.md)
2. Check examples in [api-examples.ts](api-examples.ts)
3. Try one API call in your component

### Intermediate
1. Read [API_GUIDE.md](API_GUIDE.md)
2. Review [cpo-client.ts](cpo-client.ts) methods
3. Build component from [components-examples.tsx](components-examples.tsx)

### Advanced
1. Study [api-utils.ts](api-utils.ts)
2. Create custom hooks
3. Optimize with caching/React Query

---

## 💡 Common Patterns

### Hook Pattern
```typescript
import { useEffect, useState } from 'react';
import { cpoClient } from '@/lib/cpo-client';

function useData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cpoClient.getChargingStations()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
```
See: [components-examples.tsx](components-examples.tsx#L10-L45)

### Error Handling
```typescript
import { handleApiError } from '@/lib/api-utils';

try {
  const data = await cpoClient.getChargingStations();
} catch (error) {
  const apiError = handleApiError(error);
  console.error(`Error: ${apiError.message}`);
}
```
See: [api-utils.ts](api-utils.ts#L30-L60)

### Data Export
```typescript
import { downloadAsCSV } from '@/lib/api-utils';

const stations = await cpoClient.getChargingStations();
downloadAsCSV(stations, 'stations.csv');
```
See: [api-utils.ts](api-utils.ts#L420-L440)

---

## 🆘 Troubleshooting

### Q: Where do I import from?
**A:** Main files in `src/lib/`:
- **cpo-client.ts** → API calls to WattzHub
- **api-utils.ts** → Helper functions
- **components-examples.tsx** → React components

### Q: How do I get started?
**A:** 
1. Import `cpoClient`
2. Call an endpoint
3. Use the data in your component

### Q: Are there examples?
**A:** Yes! Check [api-examples.ts](api-examples.ts) for 10+ examples

### Q: Can I see components?
**A:** Yes! Check [components-examples.tsx](components-examples.tsx) for 6 components

### Q: Where's the full guide?
**A:** [API_GUIDE.md](API_GUIDE.md) has everything

---

## 📋 File Structure

```
src/lib/
├── 📄 cpo-client.ts              ← WattzHub API wrapper
├── 📄 api.ts                     ← Types + local APIs
├── 📄 api-client.ts              ← HTTP client
├── 📄 api-utils.ts               ← Helper functions
├── 📄 api-examples.ts            ← Code examples
├── 📄 components-examples.tsx    ← React components
├── 📄 index.ts                   ← Central exports
├── 📚 API_GUIDE.md               ← Full guide
├── 📚 SUMMARY.md                 ← Quick reference
├── 📚 CHANGELOG.md               ← Changes
├── 📚 INTEGRATION_STATUS.md      ← Status
└── 📚 README.md                  ← This file
```

---

## ✨ What You Get

✅ **50+ API methods** - All WattzHub endpoints
✅ **30+ utilities** - Common tasks made easy
✅ **6 React components** - Ready to use
✅ **Complete docs** - Guides + examples
✅ **Type safety** - Full TypeScript support
✅ **No setup needed** - Works out of the box
✅ **No breaking changes** - Use alongside existing code
✅ **No new dependencies** - Uses what you have

---

## 🚀 Ready to Build?

1. **Read** [SUMMARY.md](SUMMARY.md) (5 min)
2. **Check** [api-examples.ts](api-examples.ts) (10 min)
3. **Copy** [components-examples.tsx](components-examples.tsx) (15 min)
4. **Build** your feature!

---

## 📞 Resources

- **WattzHub API Docs**: https://beta.cpo.server.wattzhub.com/v1/docs/
- **This Project**: All docs in `src/lib/`
- **Examples**: [api-examples.ts](api-examples.ts)
- **Components**: [components-examples.tsx](components-examples.tsx)

---

## 🎉 You're Ready!

Pick a file from above and get started. All the tools you need are here!

**Happy coding! 🚀**

---

*Last updated: 2026-02-06*
