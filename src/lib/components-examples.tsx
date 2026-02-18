/**
 * Real-world React Component Examples using WattzHub CPO API
 * 
 * Copy and adapt these examples for your specific needs.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { cpoClient } from '@/lib/cpo-client';
import type { ChargingStation, Transaction, User, MeterValue } from '@/lib/api';

// ============================================================================
// Custom Hook: useChargingStations
// ============================================================================

interface UseChargingStationsOptions {
  limit?: number;
  autoRefresh?: number; // milliseconds
}

export function useChargingStations(options?: UseChargingStationsOptions) {
  const { limit = 50, autoRefresh = 0 } = options || {};
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cpoClient.getChargingStations({ limit });
      setStations((data || []) as ChargingStation[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations');
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchStations();

    if (autoRefresh > 0) {
      const interval = setInterval(fetchStations, autoRefresh);
      return () => clearInterval(interval);
    }
  }, [fetchStations, autoRefresh]);

  return { stations, loading, error, refetch: fetchStations };
}

// ============================================================================
// Custom Hook: useTransaction
// ============================================================================

export function useTransaction(transactionId: string) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [consumptions, setConsumptions] = useState<MeterValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const [txData, consumptionData] = await Promise.all([
          cpoClient.getTransaction(transactionId),
          cpoClient.getTransactionConsumptions(transactionId),
        ]);
        setTransaction((txData || null) as Transaction | null);
        setConsumptions((consumptionData || []) as MeterValue[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transaction');
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [transactionId]);

  return { transaction, consumptions, loading, error };
}

// ============================================================================
// Component: ChargingStationsList
// ============================================================================

export function ChargingStationsList() {
  const { stations, loading, error, refetch } = useChargingStations({ 
    limit: 100,
    autoRefresh: 30000 // Refresh every 30 seconds
  });

  if (loading) {
    return <div className="p-4">Loading charging stations...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        Error: {error}
        <button 
          onClick={refetch}
          className="ml-2 px-3 py-1 bg-red-700 text-white rounded hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Charging Stations ({stations.length})</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {stations.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Component: StationCard
// ============================================================================

interface StationCardProps {
  station: ChargingStation;
}

function StationCard({ station }: StationCardProps) {
  const [isControlling, setIsControlling] = useState(false);

  const handleRemoteStart = async (connectorId: number) => {
    try {
      setIsControlling(true);
      await cpoClient.remoteStartCharging(station.id, connectorId);
      alert('Charging started');
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsControlling(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsControlling(true);
      await cpoClient.resetChargingStation(station.id);
      alert('Station reset');
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsControlling(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-lg transition">
      <h3 className="font-bold text-lg mb-2">{station.chargeBoxSerialNumber}</h3>
      
      <div className="text-sm text-gray-600 mb-3">
        <p><strong>Model:</strong> {station.model}</p>
        <p><strong>Vendor:</strong> {station.vendor}</p>
        <p><strong>Status:</strong> {station.status}</p>
        <p><strong>Connectors:</strong> {station.connectors?.length || 0}</p>
      </div>

      <div className="space-y-2">
        {station.connectors?.map((connector: any) => (
          <button
            key={connector.connectorId}
            onClick={() => handleRemoteStart(connector.connectorId)}
            disabled={isControlling}
            className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
          >
            {isControlling ? 'Processing...' : `Start Connector ${connector.connectorId}`}
          </button>
        ))}

        <button
          onClick={handleReset}
          disabled={isControlling}
          className="w-full px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 text-sm"
        >
          {isControlling ? 'Processing...' : 'Reset Station'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Component: ActiveTransactionsList
// ============================================================================

export function ActiveTransactionsList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await cpoClient.getActiveTransactions({ limit: 100 });
        setTransactions((data || []) as Transaction[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    }

    fetch();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4">Loading active transactions...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Active Charging Sessions ({transactions.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Transaction ID</th>
              <th className="border p-2">User Tag</th>
              <th className="border p-2">Start Time</th>
              <th className="border p-2">Power (kW)</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// Component: TransactionRow
// ============================================================================

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const [isStopping, setIsStopping] = useState(false);

  const handleStop = async () => {
    if (!window.confirm('Stop this charging session?')) return;

    try {
      setIsStopping(true);
      await cpoClient.stopTransaction(transaction.id);
      alert('Transaction stopped');
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsStopping(false);
    }
  };

  const startTime = new Date(transaction.startTimestamp).toLocaleString();

  return (
    <tr className="hover:bg-gray-50">
      <td className="border p-2 font-mono text-sm">{transaction.id}</td>
      <td className="border p-2">{transaction.idTag}</td>
      <td className="border p-2">{startTime}</td>
      <td className="border p-2">N/A</td>
      <td className="border p-2">
        <button
          onClick={handleStop}
          disabled={isStopping}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 text-sm"
        >
          {isStopping ? 'Stopping...' : 'Stop'}
        </button>
      </td>
    </tr>
  );
}

// ============================================================================
// Component: UserManagement
// ============================================================================

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await cpoClient.getUsers({ limit: 100 });
      setUsers((data || []) as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      await cpoClient.createUser(formData as Record<string, unknown>);
      alert('User created successfully');
      setFormData({ firstName: '', lastName: '', email: '', phone: '' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Users ({users.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateUser} className="mb-4 p-4 border rounded">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="First Name"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Create User
          </button>
        </form>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {users.map((user) => (
          <div key={user.id} className="p-4 border rounded shadow">
            <h3 className="font-bold">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">{user.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Component: TransactionDetails
// ============================================================================

export function TransactionDetails({ transactionId }: { transactionId: string }) {
  const { transaction, consumptions, loading, error } = useTransaction(transactionId);

  if (loading) {
    return <div className="p-4">Loading transaction...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Transaction {transactionId}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded">
          <p className="text-gray-600">Start Time</p>
          <p className="font-bold">{transaction?.startTimestamp ? new Date(transaction.startTimestamp).toLocaleString() : 'N/A'}</p>
        </div>
        <div className="p-4 border rounded">
          <p className="text-gray-600">Status</p>
          <p className="font-bold">{transaction?.status || 'Active'}</p>
        </div>
        <div className="p-4 border rounded">
          <p className="text-gray-600">User Tag</p>
          <p className="font-bold">{transaction?.idTag}</p>
        </div>
        <div className="p-4 border rounded">
          <p className="text-gray-600">Initial Reading</p>
          <p className="font-bold">{transaction?.startValue} kWh</p>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2">Energy Consumption</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Value</th>
              <th className="border p-2">Unit</th>
            </tr>
          </thead>
          <tbody>
            {consumptions.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">{(item as any).timestamp || 'N/A'}</td>
                <td className="border p-2">{(item as any).value || (item as any).meterValue || 'N/A'}</td>
                <td className="border p-2">{(item as any).unit || 'kWh'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default {
  useChargingStations,
  useTransaction,
  ChargingStationsList,
  ActiveTransactionsList,
  UserManagement,
  TransactionDetails,
};
