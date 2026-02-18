// DSO Connections - Frontend API Usage Examples
// File: src/lib/dso-examples.ts

import { dsoApi, DsoConnection, SiteLink, EnergySnapshot } from './api';

/**
 * Complete example flow for DSO connections integration
 */

// ============================================================================
// 1. CREATING A DSO CONNECTION
// ============================================================================

export async function createDsoConnectionExample() {
  try {
    const response = await dsoApi.createConnection({
      baseUrl: 'http://dso-api.example.com',
      authEmail: 'dso@example.com',
      authPassword: 'secure-password-123',
    });

    const connection: DsoConnection = response;
    console.log('DSO Connection created:', connection);
    return connection;
  } catch (error) {
    console.error('Failed to create DSO connection:', error);
    throw error;
  }
}

// ============================================================================
// 2. LISTING ALL DSO CONNECTIONS
// ============================================================================

export async function listDsoConnectionsExample() {
  try {
    const response = await dsoApi.getConnections();
    const connections: DsoConnection[] = Array.isArray(response) ? response : [];

    connections.forEach((conn) => {
      console.log(`Connection: ${conn.baseUrl}`);
      console.log(`  Sites linked: ${conn.siteLinks?.length || 0}`);
      if (conn.lastSyncAt) {
        console.log(`  Last sync: ${new Date(conn.lastSyncAt).toLocaleString()}`);
      }
    });

    return connections;
  } catch (error) {
    console.error('Failed to fetch connections:', error);
    throw error;
  }
}

// ============================================================================
// 3. CREATING A SITE LINK (Mapping CPO Site to DSO Site)
// ============================================================================

export async function createSiteLinkExample(
  dsoConnectionId: string,
  cpoSiteId: string,
  dsoSiteRef: string
) {
  try {
    const response = await dsoApi.createSiteLink({
      siteId: cpoSiteId,
      dsoConnectionId: dsoConnectionId,
      dsoSiteRef: dsoSiteRef, // DSO's reference (e.g., "PARIS_01")
    });

    const siteLink: SiteLink = response;
    console.log('Site link created:', siteLink);
    return siteLink;
  } catch (error) {
    console.error('Failed to create site link:', error);
    throw error;
  }
}

// ============================================================================
// 4. SYNCHRONIZING ENERGY DATA
// ============================================================================

export async function syncEnergyExample(siteLinkId: string) {
  try {
    const response = await dsoApi.syncEnergy(siteLinkId);
    const snapshot: EnergySnapshot = response;

    console.log('Energy snapshot received:');
    console.log(`  Energy: ${snapshot.energieKw} kW`);
    console.log(`  Tariff: ${snapshot.tarif} €/kWh`);
    console.log(`  Signal: ${snapshot.signal === 0 ? 'Unfavorable' : 'Favorable'}`);
    console.log(`  Congestion: ${snapshot.congestionLevel}%`);

    return snapshot;
  } catch (error) {
    console.error('Failed to sync energy:', error);
    throw error;
  }
}

// ============================================================================
// 5. USING IN REACT COMPONENTS WITH REACT QUERY
// ============================================================================

/*
 * Note: React components should be in .tsx files, not .ts files
 * These examples are pseudo-code patterns to show how to use the hooks
 *
 * Example pattern for a React Component:
 * 
 * export const DsoConnectionsListExample = () => {
 *   const { data: connections, isLoading, error } = useDsoConnections();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <h2>DSO Connections</h2>
 *       {connections?.map((conn) => (
 *         <div key={conn.id}>
 *           <h3>{conn.baseUrl}</h3>
 *           <p>Email: {conn.authEmail}</p>
 *           <p>Sites: {conn.siteLinks?.length || 0}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * };
 */

// Custom hook for fetching DSO connections
export const useDsoConnections = () => {
  const { useQuery } = require('@tanstack/react-query');
  return useQuery({
    queryKey: ['dso-connections'],
    queryFn: async () => {
      const response = await dsoApi.getConnections();
      return Array.isArray(response) ? response : [];
    },
  });
};

// Custom hook for creating a DSO connection
export const useCreateDsoConnection = () => {
  const { useMutation, useQueryClient } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof dsoApi.createConnection>[0]) =>
      dsoApi.createConnection(data),
    onSuccess: () => {
      // Invalidate and refetch connections list
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
  });
};

// ============================================================================
// 6. ERROR HANDLING PATTERNS
// ============================================================================

export async function robustDsoConnectionExample() {
  try {
    // Create connection with validation
    const response = await dsoApi.createConnection({
      baseUrl: 'http://dso-api.local:5000',
      authEmail: 'operator@dso.com',
      authPassword: 'password123',
    });

    if (!response) {
      throw new Error('No data returned from server');
    }

    const connection = response;

    // Log success
    console.log(`Successfully created connection: ${connection.id}`);
    return connection;
  } catch (error: any) {
    // Handle different error types
    if (error.response?.status === 401) {
      console.error('Unauthorized: Check credentials');
    } else if (error.response?.status === 400) {
      console.error('Validation error:', error.response.data.message);
    } else if (error.response?.status === 409) {
      console.error('Conflict: Resource already exists');
    } else if (error.message === 'Network Error') {
      console.error('Network error: Check DSO API availability');
    } else {
      console.error('Unexpected error:', error.message);
    }
    throw error;
  }
}

// ============================================================================
// 7. BATCH OPERATIONS
// ============================================================================

export async function batchCreateSiteLinksExample(
  dsoConnectionId: string,
  siteMappings: Array<{ cpoSiteId: string; dsoSiteRef: string }>
) {
  const results = [];

  for (const mapping of siteMappings) {
    try {
      const response = await dsoApi.createSiteLink({
        siteId: mapping.cpoSiteId,
        dsoConnectionId: dsoConnectionId,
        dsoSiteRef: mapping.dsoSiteRef,
      });
      results.push({ success: true, data: response });
    } catch (error) {
      results.push({ success: false, error });
    }
  }

  // Log results
  const successCount = results.filter((r) => r.success).length;
  console.log(`Successfully created ${successCount}/${siteMappings.length} site links`);

  return results;
}

export async function batchSyncEnergyExample(siteLinkIds: string[]) {
  const results = [];

  for (const linkId of siteLinkIds) {
    try {
      const response = await dsoApi.syncEnergy(linkId);
      results.push({ linkId, success: true, snapshot: response });
    } catch (error) {
      results.push({ linkId, success: false, error });
    }
  }

  return results;
}

// ============================================================================
// 8. REACT QUERY INTEGRATION PATTERNS
// ============================================================================

/**
 * Hook for managing DSO connection CRUD operations
 */
export const useDsoConnectionCrud = () => {
  const { useMutation, useQueryClient, useQuery } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['dso-connections'],
    queryFn: async () => {
      const response = await dsoApi.getConnections();
      return Array.isArray(response) ? response : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof dsoApi.createConnection>[0]) =>
      dsoApi.createConnection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Parameters<typeof dsoApi.updateConnection>[1] }) =>
      dsoApi.updateConnection(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteConnection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
  });

  return {
    connections: listQuery.data || [],
    isLoading: listQuery.isLoading,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

/**
 * Hook for managing site links within a DSO connection
 */
export const useSiteLinksCrud = () => {
  const { useMutation, useQueryClient, useQuery } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['dso-site-links'],
    queryFn: async () => {
      const response = await dsoApi.getSiteLinks();
      return Array.isArray(response) ? response : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof dsoApi.createSiteLink>[0]) =>
      dsoApi.createSiteLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-site-links'] });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (linkId: string) => dsoApi.syncEnergy(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-site-links'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteSiteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-site-links'] });
    },
  });

  return {
    siteLinks: listQuery.data || [],
    isLoading: listQuery.isLoading,
    create: createMutation,
    sync: syncMutation,
    delete: deleteMutation,
  };
};
