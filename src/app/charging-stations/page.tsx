'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  StatusDot,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  Activity,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  MapPin,
  Plug,
  RefreshCw,
  Wifi,
  WifiOff,
  Wrench,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/layout';
import {
  chargingStationsApi,
  siteAreasApi,
  transactionsApi,
} from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function connectorStatusColor(
  status?: string,
): 'online' | 'offline' | 'warning' | 'error' | 'pending' {
  if (!status) return 'offline';
  const s = status.toLowerCase();
  if (s === 'available') return 'online';
  if (s === 'charging' || s === 'occupied') return 'pending';
  if (s === 'preparing' || s === 'finishing' || s === 'suspendedev' || s === 'suspendedevse')
    return 'warning';
  if (s === 'faulted') return 'error';
  return 'offline';
}

function connectorStatusLabel(status?: string): string {
  if (!status) return 'Inconnu';
  const map: Record<string, string> = {
    available: 'Disponible',
    charging: 'En charge',
    occupied: 'Occupé',
    preparing: 'Préparation',
    finishing: 'Finalisation',
    suspendedev: 'Suspendu (EV)',
    suspendedevse: 'Suspendu (EVSE)',
    faulted: 'En panne',
    unavailable: 'Indisponible',
  };
  return map[status.toLowerCase()] || status;
}

function stationOverallStatus(connectors: any[]): string {
  if (!connectors?.length) return 'offline';
  if (connectors.some((c) => c.status?.toLowerCase() === 'faulted')) return 'faulted';
  if (connectors.some((c) => c.status?.toLowerCase() === 'charging')) return 'charging';
  if (connectors.every((c) => c.status?.toLowerCase() === 'available')) return 'available';
  return connectors[0]?.status || 'unavailable';
}

function stationStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'destructive' | 'outline' }> = {
    available: { label: '🟢 Online', variant: 'success' },
    charging: { label: '🟡 Charging', variant: 'warning' },
    faulted: { label: '🔴 Erreur', variant: 'error' },
    offline: { label: '🔴 Offline', variant: 'destructive' },
    unavailable: { label: '⚪ Indisponible', variant: 'outline' },
  };
  const info = map[status] || map.unavailable;
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

const PAGE_SIZE = 15;

// ─── Normalize helper ─────────────────────────────────────────────────────────

function normalizeArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.result && Array.isArray(raw.result)) return raw.result;
  return [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChargingStationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteParam = searchParams.get('site');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>(siteParam || 'all');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('liste');

  const { data: stationsResponse, isLoading, isError: stationsError, refetch, isRefetching } = useQuery({
    queryKey: ['charging-stations'],
    queryFn: () => chargingStationsApi.getAll(0, 500),
    staleTime: 30_000,
  });

  const { data: siteAreasResponse } = useQuery({
    queryKey: ['site-areas'],
    queryFn: () => siteAreasApi.getAll(0, 200),
    staleTime: 60_000,
  });

  const { data: activeTransactionsResponse } = useQuery({
    queryKey: ['active-transactions'],
    queryFn: () => transactionsApi.getActive(0, 100),
    staleTime: 15_000,
    refetchInterval: (query) =>
      query.state.status === 'error' ? false : (activeTab === 'realtime' ? 15_000 : false),
  });

  const stations = useMemo(() => normalizeArray(stationsResponse), [stationsResponse]);
  const siteAreas = useMemo(() => normalizeArray(siteAreasResponse), [siteAreasResponse]);
  const activeTransactions = useMemo(() => normalizeArray(activeTransactionsResponse), [activeTransactionsResponse]);

  // Unique site names for filter
  const siteNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of stations) {
      const name = s.siteArea?.name || s.site?.name;
      if (name) names.add(name);
    }
    return Array.from(names).sort();
  }, [stations]);

  // Filter + search
  const filtered = useMemo(() => {
    let list = stations;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (s: any) =>
          s.id?.toLowerCase().includes(term) ||
          s.chargePointVendor?.toLowerCase().includes(term) ||
          s.chargePointModel?.toLowerCase().includes(term) ||
          s.siteArea?.name?.toLowerCase().includes(term),
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((s: any) => {
        const overall = stationOverallStatus(s.connectors || []);
        if (statusFilter === 'online') return overall === 'available';
        if (statusFilter === 'charging') return overall === 'charging';
        if (statusFilter === 'offline') return overall === 'offline' || overall === 'unavailable';
        if (statusFilter === 'faulted') return overall === 'faulted';
        return true;
      });
    }
    if (siteFilter !== 'all') {
      list = list.filter(
        (s: any) => s.siteArea?.name === siteFilter || s.site?.name === siteFilter,
      );
    }
    return list;
  }, [stations, searchTerm, statusFilter, siteFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  // Stats
  const stats = useMemo(() => {
    let online = 0, charging = 0, offline = 0, faulted = 0;
    for (const s of stations) {
      const overall = stationOverallStatus(s.connectors || []);
      if (overall === 'available') online++;
      else if (overall === 'charging') charging++;
      else if (overall === 'faulted') faulted++;
      else offline++;
    }
    return { total: stations.length, online, charging, offline, faulted };
  }, [stations]);

  const handleSearch = useCallback((v: string) => {
    setSearchTerm(v);
    setPage(1);
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <Header
        title="Bornes de recharge"
        description="Gérez vos bornes de recharge connectées via WattzHub CPO"
        searchValue={searchTerm}
        onSearch={handleSearch}
        searchPlaceholder="Rechercher une borne…"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        }
      />

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={Plug} label="Bornes total" value={stats.total} color="blue" />
        <StatCard icon={Wifi} label="En ligne" value={stats.online} color="emerald"
          percentage={stats.total ? `${Math.round((stats.online / stats.total) * 100)}%` : undefined} />
        <StatCard icon={BatteryCharging} label="En charge" value={stats.charging} color="amber"
          percentage={stats.total ? `${Math.round((stats.charging / stats.total) * 100)}%` : undefined} />
        <StatCard icon={WifiOff} label="Hors ligne" value={stats.offline} color="red"
          percentage={stats.total ? `${Math.round((stats.offline / stats.total) * 100)}%` : undefined} />
        <StatCard icon={Activity} label="Erreurs" value={stats.faulted} color="orange"
          percentage={stats.total ? `${Math.round((stats.faulted / stats.total) * 100)}%` : undefined} />
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="liste">📋 Liste</TabsTrigger>
          <TabsTrigger value="carte">🗺️ Carte</TabsTrigger>
          <TabsTrigger value="realtime">⚡ Temps réel</TabsTrigger>
        </TabsList>

        {/* ═══ TAB 1: LISTE ═══════════════════════════════════════════ */}
        <TabsContent value="liste">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtres:</span>
            </div>
            <SelectRoot value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[160px]" size="sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="online">🟢 En ligne</SelectItem>
                <SelectItem value="charging">🟡 En charge</SelectItem>
                <SelectItem value="offline">🔴 Hors ligne</SelectItem>
                <SelectItem value="faulted">⚠️ Erreurs</SelectItem>
              </SelectContent>
            </SelectRoot>
            <SelectRoot value={siteFilter} onValueChange={(v) => { setSiteFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[200px]" size="sm">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les sites</SelectItem>
                {siteNames.map((name) => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <span className="ml-auto text-xs text-muted-foreground">
              {filtered.length} borne{filtered.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Table */}
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Plug className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {searchTerm || statusFilter !== 'all' ? 'Aucune borne trouvée' : 'Aucune borne de recharge'}
                </p>
                <p className="text-sm mt-1">
                  {searchTerm ? 'Essayez un autre terme de recherche.' : 'Vérifiez la connexion CPO dans les paramètres.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Borne</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Connecteurs</TableHead>
                    <TableHead>Puissance</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((station: any) => {
                    const connectors: any[] = station.connectors || [];
                    const overall = stationOverallStatus(connectors);
                    const vendor = station.chargePointVendor || station.vendor || '';
                    const model = station.chargePointModel || station.model || '';
                    const siteName = station.siteArea?.name || station.site?.name || '—';
                    const maxPowerKw = connectors.reduce((sum: number, c: any) => sum + (c.power || c.maxElectricPower || 0) / 1000, 0);
                    const activePowerKw = connectors.reduce((sum: number, c: any) => sum + (c.currentInstantWatt || 0) / 1000, 0);

                    return (
                      <TableRow key={station.id} className="cursor-pointer" onClick={() => router.push(`/charging-stations/${station.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium text-sm">{station.id}</p>
                              {(vendor || model) && (
                                <p className="text-xs text-muted-foreground">{[vendor, model].filter(Boolean).join(' · ')}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><span className="text-sm">{siteName}</span></TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {connectors.map((c: any) => (
                              <div key={c.connectorId} className="flex items-center gap-1.5 text-xs">
                                <StatusDot status={connectorStatusColor(c.status)} size="sm" pulse={c.status?.toLowerCase() === 'charging'} />
                                <span>{c.type || c.standard || `#${c.connectorId}`}</span>
                                <span className="text-muted-foreground">{connectorStatusLabel(c.status)}</span>
                              </div>
                            ))}
                            {connectors.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {activePowerKw > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">{activePowerKw.toFixed(0)}kW</span>
                            ) : (
                              <span>0kW</span>
                            )}
                            <span className="text-muted-foreground">/{maxPowerKw.toFixed(0)}kW</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {stationStatusBadge(overall)}
                          {station.lastSeen && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatDistanceToNow(new Date(station.lastSeen), { addSuffix: true, locale: fr })}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/charging-stations/${station.id}`); }} title="Voir détails">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 mt-2">
                  <p className="text-xs text-muted-foreground">
                    Affichage {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} bornes
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (page <= 3) pageNum = i + 1;
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = page - 2 + i;
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page === pageNum ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/50'}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ═══ TAB 2: CARTE ═══════════════════════════════════════════ */}
        <TabsContent value="carte">
          <MapTab stations={stations} />
        </TabsContent>

        {/* ═══ TAB 3: TEMPS RÉEL ══════════════════════════════════════ */}
        <TabsContent value="realtime">
          <RealTimeTab stations={stations} activeTransactions={activeTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, percentage }: {
  icon: any; label: string; value: number; color: string; percentage?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg p-2.5 ${colorMap[color]}`}><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}{percentage && <span className="ml-1 font-medium">{percentage}</span>}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Map Tab ──────────────────────────────────────────────────────────────────

function MapTab({ stations }: { stations: any[] }) {
  const [mapFilter, setMapFilter] = useState<string>('all');
  const router = useRouter();

  const grouped = useMemo(() => {
    const groups: Record<string, { name: string; stations: any[] }> = {};
    for (const s of stations) {
      const areaName = s.siteArea?.name || 'Sans site';
      if (!groups[areaName]) groups[areaName] = { name: areaName, stations: [] };
      groups[areaName].stations.push(s);
    }
    return Object.values(groups);
  }, [stations]);

  const filteredGroups = useMemo(() => {
    if (mapFilter === 'all') return grouped;
    return grouped
      .map((g) => ({
        ...g,
        stations: g.stations.filter((s: any) => {
          const overall = stationOverallStatus(s.connectors || []);
          if (mapFilter === 'available') return overall === 'available';
          if (mapFilter === 'charging') return overall === 'charging';
          if (mapFilter === 'offline') return overall === 'offline' || overall === 'unavailable';
          return true;
        }),
      }))
      .filter((g) => g.stations.length > 0);
  }, [grouped, mapFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Visualisation géographique de vos {stations.length} bornes</p>
        <div className="flex items-center gap-2">
          {(['all', 'available', 'charging', 'offline'] as const).map((f) => (
            <Button key={f} variant={mapFilter === f ? 'default' : 'outline'} size="sm" onClick={() => setMapFilter(f)}>
              {f === 'all' && 'Toutes'}
              {f === 'available' && '🟢 Disponibles'}
              {f === 'charging' && '🟡 En charge'}
              {f === 'offline' && '🔴 Hors ligne'}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <Card key={group.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {group.name}
                <Badge variant="outline" className="ml-auto">{group.stations.length} borne{group.stations.length > 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {group.stations.map((s: any) => {
                  const overall = stationOverallStatus(s.connectors || []);
                  const maxPower = (s.connectors || []).reduce((sum: number, c: any) => sum + (c.power || c.maxElectricPower || 0) / 1000, 0);
                  const statusIcon = overall === 'available' ? '🟢' : overall === 'charging' ? '🟡' : overall === 'faulted' ? '🟠' : '🔴';
                  return (
                    <div key={s.id} className="flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors text-center"
                      onClick={() => router.push(`/charging-stations/${s.id}`)}>
                      <span className="text-lg">{statusIcon}</span>
                      <span className="text-xs font-medium truncate w-full">{s.id}</span>
                      <span className="text-[10px] text-muted-foreground">{maxPower.toFixed(0)}kW {connectorStatusLabel(overall)}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground justify-center pt-2">
        <span>🟢 Disponible</span>
        <span>🟡 En charge</span>
        <span>🔴 Hors ligne</span>
        <span>🟠 Maintenance</span>
        <span>⚪ Inconnu</span>
      </div>
    </div>
  );
}

// ─── Real-Time Tab ────────────────────────────────────────────────────────────

function RealTimeTab({ stations, activeTransactions }: { stations: any[]; activeTransactions: any[] }) {
  const router = useRouter();

  const chargingStations = useMemo(
    () => stations.filter((s: any) => stationOverallStatus(s.connectors || []) === 'charging'),
    [stations],
  );

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{chargingStations.length}</p>
            <p className="text-xs text-muted-foreground">Bornes en charge actuellement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{activeTransactions.length}</p>
            <p className="text-xs text-muted-foreground">Transactions actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {chargingStations.reduce((sum: number, s: any) =>
                sum + (s.connectors || []).reduce((cs: number, c: any) => cs + (c.currentInstantWatt || 0) / 1000, 0), 0).toFixed(1)} kW
            </p>
            <p className="text-xs text-muted-foreground">Puissance totale active</p>
          </CardContent>
        </Card>
      </div>

      {/* Charging stations live */}
      {chargingStations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-muted-foreground">
            <BatteryCharging className="h-10 w-10 mb-3 opacity-50" />
            <p className="font-medium">Aucune charge en cours</p>
            <p className="text-sm mt-1">Les sessions de charge actives apparaîtront ici en temps réel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Sessions en cours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chargingStations.map((station: any) => {
              const chargingConnectors = (station.connectors || []).filter((c: any) => c.status?.toLowerCase() === 'charging');
              return (
                <Card key={station.id} className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-500"
                  onClick={() => router.push(`/charging-stations/${station.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        <span className="font-semibold text-sm">{station.id}</span>
                      </div>
                      <Badge variant="warning">En charge</Badge>
                    </div>
                    {chargingConnectors.map((c: any) => {
                      const power = (c.currentInstantWatt || 0) / 1000;
                      const maxPower = (c.power || c.maxElectricPower || 22000) / 1000;
                      const pct = maxPower ? Math.min(100, (power / maxPower) * 100) : 0;
                      return (
                        <div key={c.connectorId} className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Connecteur #{c.connectorId}{c.type && ` (${c.type})`}</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{power.toFixed(1)} kW / {maxPower.toFixed(0)} kW</span>
                          </div>
                          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            {c.currentStateOfCharge > 0 && <span>SoC: {c.currentStateOfCharge}%</span>}
                            {c.currentTotalConsumptionWh > 0 && <span>{(c.currentTotalConsumptionWh / 1000).toFixed(1)} kWh consommés</span>}
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Active transactions table */}
      {activeTransactions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Transactions actives</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Borne</TableHead>
                <TableHead>Connecteur</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Consommation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTransactions.map((tx: any) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.chargeBoxId || '—'}</TableCell>
                  <TableCell>#{tx.connectorId || '—'}</TableCell>
                  <TableCell><Badge variant="outline">{tx.idTag || '—'}</Badge></TableCell>
                  <TableCell className="text-xs">
                    {tx.startTimestamp ? formatDistanceToNow(new Date(tx.startTimestamp), { addSuffix: true, locale: fr }) : '—'}
                  </TableCell>
                  <TableCell>
                    {tx.stopValue && tx.startValue ? `${((tx.stopValue - tx.startValue) / 1000).toFixed(1)} kWh` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
