'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle,
  Edit,
  MapPin,
  Network,
  Search,
  Zap,
  Play,
  Square,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from '@/components/ui';
import { cpoApi, dsoApi, regionsApi, sitesApi, LocalSite, DsoConnection, SiteLink } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Header } from '@/components/layout';
import { getSignalStatusText } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DsoSite {
  id: string;
  name: string;
  address: string;
  maxCapacity: number;
  dsoId: string;
  dsoLabel: string;
  connectionLabel: string;
  connectionId: string;
}

type OptimLevel = 'full' | 'reduced' | 'stop';

interface OptimResult {
  siteId: string;
  energyKw: number;
  newMaxCapacityKw: number;
  computedLimitKw: number;
  level: OptimLevel;
  updatedAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getJwtToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flexee_access_token') ?? null;
}

/**
 * Logique de calcul :
 *  energyKw <= 0               → maxCapacity = 0,    limit = 0    (stop)
 *  energyKw >= originalMax     → maxCapacity = max,  limit = max  (full)
 *  0 < energyKw < originalMax  → maxCapacity = energy, limit = energy (réduit)
 */
function computeNewLimits(
  energyKw: number,
  originalMaxCapacity: number,
): { newMaxCapacityKw: number; newLimitKw: number; level: OptimLevel } {
  if (energyKw <= 0) {
    return { newMaxCapacityKw: 0, newLimitKw: 0, level: 'stop' };
  }
  if (energyKw >= originalMaxCapacity) {
    return { newMaxCapacityKw: originalMaxCapacity, newLimitKw: originalMaxCapacity, level: 'full' };
  }
 const reduced = Math.max(1, Math.min(originalMaxCapacity, Math.floor(energyKw)));
return { newMaxCapacityKw: reduced, newLimitKw: reduced, level: 'reduced' };
}

function LevelBadge({ level }: { level: OptimLevel }) {
  if (level === 'full')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
        <TrendingUp className="h-3 w-3" /> Plein
      </span>
    );
  if (level === 'reduced')
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full">
        <Minus className="h-3 w-3" /> Réduit
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full">
      <TrendingDown className="h-3 w-3" /> Arrêt
    </span>
  );
}

// ─── FIX 2 : persistOptimizationLog avec fetch direct + JWT ──────────────────
// On n'utilise plus dsoOptimizationApi.createLog (apiClient sans JWT),
// on fait un fetch direct vers le backend avec le token.
async function persistOptimizationLog(
  jwt: string,
  payload: {
    dsoSiteRef: string;
    dsoSiteName: string;
    siteLinkId?: string;
    energyKw: number;
    maxCapacityKw: number;
    computedLimitKw: number;
    level: OptimLevel;
    appliedToCpo: boolean;
    triggeredBy: 'auto' | 'manual';
  }
): Promise<boolean> {
  const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? '';
  try {
    const res = await fetch(`${BACKEND}/dso-optimization/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error('[persistOptimizationLog] HTTP', res.status, body);
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[persistOptimizationLog] fetch failed:', err?.message);
    return false;
  }
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<LocalSite | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [reducedLimit, setReducedLimit] = useState<number>(0);
  const [manualLimit, setManualLimit] = useState<number>(0);
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideLimit, setOverrideLimit] = useState<number>(0);
  const [overrideDuration, setOverrideDuration] = useState<number>(120);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [clearOverrideConfirmOpen, setClearOverrideConfirmOpen] = useState(false);

  // Optimisation
  const [optimRunning, setOptimRunning]         = useState(false);
  const [optimInterval, setOptimInterval]       = useState<number>(30);
  const [optimResults, setOptimResults]         = useState<Record<string, OptimResult>>({});
  const [optimLastRun, setOptimLastRun]         = useState<Date | null>(null);
  const [countdown, setCountdown]               = useState(0);
  const [siteOptimLoading, setSiteOptimLoading] = useState<Record<string, boolean>>({});
  const optimTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites', filterConnection],
    queryFn: () => sitesApi.getAll(filterConnection !== 'all' ? filterConnection : undefined),
  });

  const { data: regions }     = useQuery({ queryKey: ['edf-regions'],     queryFn: regionsApi.getAll });
  const { data: connections } = useQuery({ queryKey: ['cpo-connections'], queryFn: cpoApi.getAll });

  const { data: dsoConnections } = useQuery({
    queryKey: ['dso-connections'],
    queryFn: async () => (await dsoApi.getConnections()) || [],
  });

  const { data: allSiteLinks = [] } = useQuery({
    queryKey: ['all-site-links'],
    queryFn: async () => {
      if (!dsoConnections?.length) return [];
      const results = await Promise.all(
        (dsoConnections as DsoConnection[]).map(async (conn) => {
          try {
            const res = await dsoApi.getSiteLinks(conn.id);
            return Array.isArray(res) ? (res as SiteLink[]) : [];
          } catch { return []; }
        })
      );
      return results.flat();
    },
    enabled: !!dsoConnections && dsoConnections.length > 0,
  });

  // Tabs & DSO sites
  const [activeTab, setActiveTab] = useState<'cpo' | 'dso'>('cpo');
  const [dsoSearchTerm, setDsoSearchTerm] = useState('');
  const [dsoSites, setDsoSites] = useState<(DsoSite & { connectionLabel: string })[]>([]);
  const [dsoSitesLoading, setDsoSitesLoading] = useState(false);

  useEffect(() => {
    if (!dsoConnections || dsoConnections.length === 0) { setDsoSites([]); return; }
    const fetchAll = async () => {
      setDsoSitesLoading(true);
      const all: (DsoSite & { connectionLabel: string })[] = [];
      for (const conn of dsoConnections as DsoConnection[]) {
        try {
          const data = await dsoApi.getDsoSites(conn.id);
          const raw = data as any;
          const sites: DsoSite[] = raw?.sites || (Array.isArray(raw) ? raw : []);
          sites.forEach((s) =>
            all.push({
              ...s,
              connectionLabel: conn.label || conn.baseUrl,
              connectionId: conn.id,
            })
          );
        } catch { /* skip */ }
      }
      setDsoSites(all);
      setDsoSitesLoading(false);
    };
    fetchAll();
  }, [dsoConnections]);

  const filteredDsoSites = useMemo(() => {
    if (!dsoSearchTerm) return dsoSites;
    const term = dsoSearchTerm.toLowerCase();
    return dsoSites.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.address.toLowerCase().includes(term) ||
        s.dsoLabel.toLowerCase().includes(term)
    );
  }, [dsoSites, dsoSearchTerm]);

  // ── Optimisation d'un seul site ───────────────────────────────────────────
  const optimizeSingleSite = useCallback(async (
    site: DsoSite,
    triggeredBy: 'auto' | 'manual' = 'manual'
  ): Promise<OptimResult | null> => {
    setSiteOptimLoading(prev => ({ ...prev, [site.id]: true }));
    try {
      // 1. JWT
      const jwt = getJwtToken();
      if (!jwt) {
        toast.error('Session expirée — veuillez vous reconnecter');
        return null;
      }

      // 2. Énergie disponible depuis le mock DSO (via proxy Next.js)
      const res = await fetch(
        `/api/dso?endpoint=energy&site_id=${site.id}&connection_id=${site.connectionId}`,
        { headers: { Authorization: `Bearer ${jwt}` }, cache: 'no-store' },
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // 3. Valeur de l'heure courante
      const hour = new Date().getHours();
      const entries: { hour: number; value: number }[] = data?.energy ?? [];
      const match = entries.find(e => e.hour === hour) ?? entries[entries.length - 1];
      const energyKw = match?.value ?? 0;

      // 4. Calcul des nouvelles limites
      const { newMaxCapacityKw, newLimitKw, level } = computeNewLimits(energyKw, site.maxCapacity);

      // 5. Appliquer sur le site CPO lié
      const link = allSiteLinks.find(l => l.dsoSiteRef === site.id);
      let appliedToCpo = false;

      if (link?.siteId) {
        try {
          // 5a. Mettre à jour maxCapacityKw (capacité physique visible dans l'onglet CPO)
          await sitesApi.update(link.siteId, { maxCapacityKw: newMaxCapacityKw });
          // 5b. Appliquer la limite courante (currentLimitKw)
          await sitesApi.setLimit(link.siteId, newLimitKw);
          appliedToCpo = true;

          // Mise à jour optimiste du cache React Query — le tableau CPO reflète
          // immédiatement les nouvelles valeurs sans attendre le refetch réseau
          queryClient.setQueriesData(
            { queryKey: ['sites'], exact: false },
            (old: any) => {
              if (!Array.isArray(old)) return old;
              return old.map((s: any) =>
                s.id === link.siteId
                  ? { ...s, maxCapacityKw: newMaxCapacityKw, currentLimitKw: newLimitKw }
                  : s
              );
            }
          );
        } catch (cpoErr) {
          console.warn('[optimizeSingleSite] Site CPO non joignable:', cpoErr);
        }
      }

      // Forcer le refetch immédiat du tableau CPO pour synchroniser avec la BDD
      await queryClient.refetchQueries({ queryKey: ['sites'], exact: false, type: 'all' });

      // FIX 2 : persister le log avec fetch direct + JWT (pas apiClient)
      const saved = await persistOptimizationLog(jwt, {
        dsoSiteRef:      site.id,
        dsoSiteName:     site.name,
        siteLinkId:      link?.id,
        energyKw,
        maxCapacityKw:   newMaxCapacityKw,
        computedLimitKw: newLimitKw,
        level,
        appliedToCpo,
        triggeredBy,
      });

      if (!saved) {
        // Avertissement visible mais non bloquant
        toast.warning(`⚠️ ${site.name} — optimisé mais log non enregistré`);
      }

      // 7. Mettre à jour l'état local (tableau DSO)
      const result: OptimResult = {
        siteId: site.id,
        energyKw,
        newMaxCapacityKw,
        computedLimitKw: newLimitKw,
        level,
        updatedAt: new Date(),
      };
      setOptimResults(prev => ({ ...prev, [site.id]: result }));

      const levelLabel =
        level === 'full'    ? '⚡ Charge pleine'  :
        level === 'reduced' ? '⚠️ Charge réduite' : '🛑 Arrêt de charge';

      toast.success(
        `${site.name} — ${levelLabel} · énergie: ${energyKw.toFixed(0)} kW → max: ${newMaxCapacityKw} kW / limite: ${newLimitKw} kW${saved ? ' · ✓ log enregistré' : ''}`
      );

      return result;
    } catch (err: any) {
      console.error(`[optimizeSingleSite] ${site.name}:`, err);
      toast.error(`Erreur optimisation ${site.name} — ${err?.message ?? 'Erreur inconnue'}`);
      return null;
    } finally {
      setSiteOptimLoading(prev => ({ ...prev, [site.id]: false }));
    }
  }, [allSiteLinks, queryClient]);

  // ── Optimisation globale ──────────────────────────────────────────────────
  const runOptimization = useCallback(async () => {
    if (!dsoSites.length) { toast.error('Aucun site DSO chargé'); return; }
    await Promise.all(dsoSites.map(site => optimizeSingleSite(site, 'auto')));
    setOptimLastRun(new Date());
  }, [dsoSites, optimizeSingleSite]);

  const startOptim = useCallback(() => {
    if (optimTimerRef.current) return;
    setOptimRunning(true);
    runOptimization();
    setCountdown(optimInterval);
    optimTimerRef.current = setInterval(() => {
      runOptimization();
      setCountdown(optimInterval);
    }, optimInterval * 1000);
    countdownRef.current = setInterval(
      () => setCountdown(prev => (prev <= 1 ? optimInterval : prev - 1)),
      1000
    );
  }, [optimInterval, runOptimization]);

  const stopOptim = useCallback(() => {
    if (optimTimerRef.current) { clearInterval(optimTimerRef.current); optimTimerRef.current = null; }
    if (countdownRef.current)  { clearInterval(countdownRef.current);  countdownRef.current  = null; }
    setOptimRunning(false);
    setCountdown(0);
    toast('Optimisation automatique arrêtée');
  }, []);

  useEffect(() => () => {
    if (optimTimerRef.current) clearInterval(optimTimerRef.current);
    if (countdownRef.current)  clearInterval(countdownRef.current);
  }, []);

  // ── Mutations CPO ─────────────────────────────────────────────────────────
  const assignRegionMutation = useMutation({
    mutationFn: ({ siteId, regionId, reducedLimitKw }: { siteId: string; regionId: string; reducedLimitKw?: number }) =>
      sitesApi.assignRegion(siteId, regionId, reducedLimitKw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'], exact: false });
      setAssignDialogOpen(false); setSelectedSite(null); setSelectedRegionId(''); setReducedLimit(0);
    },
  });

  const unassignRegionMutation = useMutation({
    mutationFn: (siteId: string) => sitesApi.unassignRegion(siteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'], exact: false }),
  });

  const setLimitMutation = useMutation({
    mutationFn: ({ siteId, limitKw }: { siteId: string; limitKw: number }) =>
      sitesApi.setLimit(siteId, limitKw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'], exact: false });
      setLimitDialogOpen(false); setSelectedSite(null); setManualLimit(0);
    },
  });

  const setOverrideMutation = useMutation({
    mutationFn: ({ siteId, limitKw, durationMinutes, reason }: { siteId: string; limitKw: number; durationMinutes?: number; reason?: string }) =>
      sitesApi.setOverride(siteId, limitKw, durationMinutes, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sites'], exact: false });
      setOverrideDialogOpen(false); setSelectedSite(null);
      setOverrideLimit(0); setOverrideDuration(120); setOverrideReason('');
      toast.success(`✓ Limite forcée à ${variables.limitKw} kW`);
    },
    onError: (error: any) => {
      toast.error(`✕ Erreur: ${error?.response?.data?.message || error?.message}`);
    },
  });

  const clearOverrideMutation = useMutation({
    mutationFn: (siteId: string) => sitesApi.clearOverride(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'], exact: false });
      setClearOverrideConfirmOpen(false);
      toast.success('✓ Override annulé');
    },
    onError: (error: any) => {
      toast.error(`✕ Erreur: ${error?.response?.data?.message || error?.message}`);
    },
  });

  const dsoSyncMutation = useMutation({
    mutationFn: (id: string) => dsoApi.syncSites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la synchronisation DSO');
    },
  });

  const openAssignDialog = (site: LocalSite) => {
    setSelectedSite(site); setSelectedRegionId(site.edfRegion?.id || '');
    setReducedLimit(site.reducedLimitKw || 0); setAssignDialogOpen(true);
  };
  const openLimitDialog = (site: LocalSite) => {
    setSelectedSite(site); setManualLimit(site.currentLimitKw || site.maxCapacityKw || 0);
    setLimitDialogOpen(true);
  };
  const openOverrideDialog = (site: LocalSite) => {
    setSelectedSite(site);
    const def = site.manualOverrideLimitKw ?? (site.maxCapacityKw ? Math.round(site.maxCapacityKw * 0.8) : site.currentLimitKw ?? 0);
    setOverrideLimit(def > 0 ? def : 1); setOverrideDuration(120);
    setOverrideReason(site.manualOverrideReason || ''); setOverrideDialogOpen(true);
  };

  const filteredSites = sites?.filter((site) => {
    const matchesSearch = !searchTerm || site.name.toLowerCase().includes(searchTerm.toLowerCase()) || site.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = filterRegion === 'all' || (filterRegion === 'unassigned' && !site.edfRegion) || site.edfRegion?.id === filterRegion;
    const matchesConnection = filterConnection === 'all' || site.cpoConnection?.id === filterConnection;
    return matchesSearch && matchesRegion && matchesConnection;
  });

  const totalSites       = sites?.length || 0;
  const assignedSites    = sites?.filter((s) => s.edfRegion)?.length || 0;
  const activeSites      = sites?.filter((s) => s.isActive)?.length || 0;
  const optimResultsList = Object.values(optimResults);

  return (
    <div className="min-h-screen bg-background">
      <Header title="Sites de Recharge" description="Gérez vos sites CPO et consultez les sites DSO" />

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          <button onClick={() => setActiveTab('cpo')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'cpo' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <Zap className="h-4 w-4" />Sites CPO<Badge variant="secondary" className="ml-1 text-xs">{totalSites}</Badge>
          </button>
          <button onClick={() => setActiveTab('dso')} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'dso' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <Network className="h-4 w-4" />Sites DSO<Badge variant="secondary" className="ml-1 text-xs">{dsoSites.length}</Badge>
          </button>
        </div>

        {/* ══════════════════ CPO TAB ══════════════════ */}
        {activeTab === 'cpo' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites Total</p><p className="text-3xl font-bold text-foreground mt-2">{totalSites}</p></div><div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div></div></CardContent></Card>
              <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avec Région EDF</p><p className="text-3xl font-bold text-foreground mt-2">{assignedSites}</p></div><div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><MapPin className="h-6 w-6 text-green-600 dark:text-green-400" /></div></div></CardContent></Card>
              <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites Actifs</p><p className="text-3xl font-bold text-foreground mt-2">{activeSites}</p></div><div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"><Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div></div></CardContent></Card>
            </div>

            <Card className="shadow-md">
              <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10"><CardTitle className="text-lg font-bold">Filtres</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[250px]"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input type="text" placeholder="Rechercher un site..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
                  <Select options={[{ value: 'all', label: 'Toutes les régions' }, { value: 'unassigned', label: 'Sans région' }, ...(regions?.map((r) => ({ value: r.id, label: r.name })) || [])]} value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)} className="w-56" />
                  <Select options={[{ value: 'all', label: 'Toutes les connexions' }, ...(connections?.map((c) => ({ value: c.id, label: c.actor?.name || 'CPO' })) || [])]} value={filterConnection} onChange={(e) => setFilterConnection(e.target.value)} className="w-56" />
                  <button className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600" onClick={async () => {
                    if (!dsoConnections || dsoConnections.length === 0) { toast.error('Aucune connexion DSO configurée'); return; }
                    try { for (const conn of dsoConnections as DsoConnection[]) await dsoSyncMutation.mutateAsync(conn.id); toast.success('Synchronisation DSO terminée'); } catch { /* handled */ }
                  }}>Sync DSO Sites</button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10"><CardTitle className="text-lg font-bold">Liste des Sites ({filteredSites?.length || 0})</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {['Site','CPO','Région EDF','Signal','Capacité','Limite Actuelle','Actions'].map(h => (
                          <th key={h} className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sitesLoading
                        ? <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Chargement...</td></tr>
                        : filteredSites && filteredSites.length > 0
                          ? filteredSites.map((site, index) => {
                              // Récupérer le résultat d'optimisation lié à ce site CPO
                              const linkedOptim = Object.values(optimResults).find(r => {
                                const link = allSiteLinks.find(l => l.dsoSiteRef === r.siteId);
                                return link?.siteId === site.id;
                              });
                              return (
                                <tr key={site.id + '-' + index} className="border-b border-border hover:bg-muted/50">
                                  <td className="py-3 px-4">
                                    <div>
                                      <p className="font-medium text-foreground">{site.name}</p>
                                      {site.address && <p className="text-sm text-muted-foreground truncate max-w-xs">{site.address}</p>}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4"><span className="text-sm">{site.cpoConnection?.actor?.name || '-'}</span></td>
                                  <td className="py-3 px-4">
                                    {site.hasEdfPlugin === false
                                      ? <span className="text-xs text-muted-foreground italic">N/A</span>
                                      : site.edfRegion
                                        ? <Badge variant="info">{site.edfRegion.name}</Badge>
                                        : <Badge variant="warning">Non assigné</Badge>}
                                  </td>
                                  <td className="py-3 px-4">
                                    {site.lastSignalValue != null
                                      ? <div className="flex items-center gap-1.5">
                                          {site.lastSignalValue === 1
                                            ? <CheckCircle className="h-4 w-4 text-green-600" />
                                            : <AlertCircle className="h-4 w-4 text-red-600" />}
                                          <span className={`text-sm ${site.lastSignalValue === 1 ? 'text-green-700' : 'text-red-700'}`}>
                                            {getSignalStatusText(site.lastSignalValue)}
                                          </span>
                                        </div>
                                      : <span className="text-sm text-muted-foreground">-</span>}
                                  </td>

                                  {/* ── Capacité : affiche le badge "optimisé" si changé récemment ── */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm text-foreground">
                                        {site.maxCapacityKw ? `${site.maxCapacityKw} kW` : '-'}
                                      </span>
                                      {linkedOptim && (
                                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                                          DSO ↑
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* ── Limite actuelle ── */}
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1">
                                      <span className={`text-sm font-medium ${site.currentLimitKw !== site.maxCapacityKw ? 'text-orange-500' : 'text-foreground'}`}>
                                        {site.currentLimitKw ? `${site.currentLimitKw} kW` : '-'}
                                      </span>
                                      <Button variant="ghost" size="icon-xs" onClick={() => openLimitDialog(site)}>
                                        <Edit className="h-3 w-3 text-muted-foreground" />
                                      </Button>
                                    </div>
                                  </td>

                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                      {site.hasEdfPlugin === false
                                        ? <Badge variant="secondary" className="text-xs">Plugin EDF non activé</Badge>
                                        : site.edfRegion
                                          ? (<>
                                              <Button variant="outline" size="sm" onClick={() => openAssignDialog(site)}><MapPin className="h-4 w-4 mr-1" />Modifier</Button>
                                              <Button variant="ghost" size="sm" onClick={() => { setSelectedSite(site); setUnassignDialogOpen(true); }}>✕</Button>
                                            </>)
                                          : <Button variant="outline" size="sm" onClick={() => openAssignDialog(site)}><MapPin className="h-4 w-4 mr-1" />Assigner Région</Button>}
                                      <Button
                                        variant={site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date() ? 'destructive' : 'secondary'}
                                        size="sm"
                                        onClick={() => openOverrideDialog(site)}
                                        title="Forcer une limite manuelle"
                                      >
                                        <Zap className="h-4 w-4 mr-2" /><span className="text-sm">Forcer</span>
                                      </Button>
                                      {site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date() && (
                                        <Badge variant="destructive" className="text-xs">
                                          Forcé ({formatDistanceToNow(new Date(site.manualOverrideUntil), { addSuffix: true, locale: fr })})
                                        </Badge>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          : <tr><td colSpan={7} className="py-12 text-center">
                              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                              <p className="text-muted-foreground">Aucun site trouvé</p>
                              <p className="text-sm text-muted-foreground/70">Synchronisez vos sites depuis une connexion CPO</p>
                            </td></tr>}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Dialogs CPO */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogContent className="bg-background text-foreground">
                <DialogHeader><DialogTitle>Assigner une Région EDF</DialogTitle><DialogDescription>Sélectionnez la région EDF pour le site <strong>{selectedSite?.name}</strong></DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <Select label="Région EDF" options={regions?.map((r) => ({ value: r.id, label: r.name })) || []} value={selectedRegionId} onChange={(e) => setSelectedRegionId(e.target.value)} placeholder="Sélectionner une région..." />
                  <Input className="bg-background text-foreground border" label="Limite réduite (kW)" type="number" value={reducedLimit || ''} onChange={(e) => setReducedLimit(Number(e.target.value))} placeholder="Laisser vide pour utiliser la capacité max" helperText="Limite appliquée lors des signaux de délestage" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setAssignDialogOpen(false); setSelectedSite(null); }}>Annuler</Button>
                  <Button onClick={() => { if (selectedSite && selectedRegionId) assignRegionMutation.mutate({ siteId: selectedSite.id, regionId: selectedRegionId, reducedLimitKw: reducedLimit || undefined }); }} isLoading={assignRegionMutation.isPending} disabled={!selectedRegionId}>Assigner</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
              <DialogContent className="bg-background text-foreground">
                <DialogHeader><DialogTitle>Modifier la Limite Manuellement</DialogTitle><DialogDescription>Définissez une nouvelle limite de puissance pour le site <strong>{selectedSite?.name}</strong></DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground"><p>Capacité maximale: <strong>{selectedSite?.maxCapacityKw || '-'} kW</strong></p><p>Limite actuelle: <strong>{selectedSite?.currentLimitKw || '-'} kW</strong></p></div>
                  <Input className="bg-background text-foreground border" label="Nouvelle limite (kW)" type="number" value={manualLimit || ''} onChange={(e) => setManualLimit(Number(e.target.value))} placeholder="Entrez la nouvelle limite" helperText="Cette limite sera envoyée au CPO via l'API WattzHub" />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setLimitDialogOpen(false); setSelectedSite(null); }}>Annuler</Button>
                  <Button onClick={() => { if (selectedSite && manualLimit > 0) setLimitMutation.mutate({ siteId: selectedSite.id, limitKw: manualLimit }); }} isLoading={setLimitMutation.isPending} disabled={!manualLimit || manualLimit <= 0}>Appliquer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
              <DialogContent className="bg-background text-foreground">
                <DialogHeader><DialogTitle className="text-foreground">Forcer une limite</DialogTitle><DialogDescription className="text-muted-foreground/80">Forcer une limite pour ce site et ignorer les signaux EDF pendant la durée spécifiée.</DialogDescription></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground"><p>Site: <strong>{selectedSite?.name}</strong></p><p>Capacité max: <strong>{selectedSite?.maxCapacityKw || '-'} kW</strong></p></div>
                  <div className="flex items-center gap-4">
                    <Input className="bg-background text-foreground border" label="Limite (kW)" type="number" value={overrideLimit || ''} onChange={(e) => setOverrideLimit(Number(e.target.value))} placeholder="Ex: 80" />
                    <div className="w-48"><Input className="bg-background text-foreground border" label="Durée (minutes)" type="number" value={overrideDuration} onChange={(e) => setOverrideDuration(Number(e.target.value))} /></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(30)}>30m</Button>
                    <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(120)}>2h</Button>
                    <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(1440)}>24h</Button>
                  </div>
                  <Input className="bg-background text-foreground border" label="Raison" type="text" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} placeholder="Ex: site prioritaire" />
                  {overrideLimit <= 0 && <p className="text-red-500 text-sm">La limite doit être supérieure à 0 kW.</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setOverrideDialogOpen(false); setSelectedSite(null); }}>Annuler</Button>
                  <Button variant="destructive" onClick={() => { if (selectedSite) setOverrideMutation.mutate({ siteId: selectedSite.id, limitKw: overrideLimit, durationMinutes: overrideDuration, reason: overrideReason }); }} disabled={!selectedSite || overrideLimit <= 0} isLoading={setOverrideMutation.isPending}>Forcer</Button>
                  {selectedSite?.manualOverrideUntil && new Date(selectedSite.manualOverrideUntil) > new Date() && (
                    <Button variant="ghost" onClick={() => setClearOverrideConfirmOpen(true)} disabled={clearOverrideMutation.isPending}>Annuler override</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <ConfirmDialog open={clearOverrideConfirmOpen} onOpenChange={setClearOverrideConfirmOpen} title="Annuler l'override" description={`Annuler le forçage pour "${selectedSite?.name}" ?`} confirmText="Annuler l'override" cancelText="Non, garder" variant="danger" onConfirm={() => { if (selectedSite) clearOverrideMutation.mutate(selectedSite.id); }} isLoading={clearOverrideMutation.isPending} />
            <ConfirmDialog open={unassignDialogOpen} onOpenChange={setUnassignDialogOpen} title="Retirer l'assignation de région" description={`Retirer la région ${selectedSite?.edfRegion?.name || ''} du site "${selectedSite?.name}" ?`} confirmText="Retirer" cancelText="Annuler" variant="warning" onConfirm={() => { if (selectedSite) { unassignRegionMutation.mutate(selectedSite.id); setUnassignDialogOpen(false); setSelectedSite(null); } }} isLoading={unassignRegionMutation.isPending} />
          </>
        )}

        {/* ══════════════════ DSO TAB ══════════════════ */}
        {activeTab === 'dso' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites DSO</p><p className="text-3xl font-bold text-foreground mt-2">{dsoSites.length}</p></div><div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"><Network className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div></div></CardContent></Card>
              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Distributeurs</p><p className="text-3xl font-bold text-foreground mt-2">{new Set(dsoSites.map((s) => s.dsoId)).size}</p></div><div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"><Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" /></div></div></CardContent></Card>
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all"><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Capacité Totale</p><p className="text-3xl font-bold text-foreground mt-2">{dsoSites.reduce((sum, s) => sum + (s.maxCapacity || 0), 0)} <span className="text-lg font-normal text-muted-foreground">kW</span></p></div><div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"><Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div></div></CardContent></Card>
            </div>

            {/* Panneau optimisation globale */}
            <Card className={`shadow-md border-2 transition-all ${optimRunning ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-dashed border-muted-foreground/20'}`}>
              <CardHeader className={`border-b pb-4 ${optimRunning ? 'border-emerald-500/20' : 'border-border'}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${optimRunning ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-muted'}`}>
                      <Zap className={`h-5 w-5 ${optimRunning ? 'text-white animate-pulse' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        Optimisation Énergétique — Tous les Sites DSO
                        {optimRunning && <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full animate-pulse">● EN COURS</span>}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        energy ≥ max → plein · 0 &lt; energy &lt; max → réduit (energy = nouvelle capacité) · energy = 0 → arrêt · Log <strong>enregistré en base</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-1.5">
                      <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Toutes les</span>
                      <input type="number" min={5} max={3600} value={optimInterval} onChange={(e) => setOptimInterval(Math.max(5, Number(e.target.value)))} disabled={optimRunning} className="w-14 px-1.5 py-0.5 border border-border rounded bg-background text-foreground text-center text-sm disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-primary" />
                      <span className="text-muted-foreground">s</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => Promise.all(dsoSites.map(s => optimizeSingleSite(s, 'manual'))).then(() => setOptimLastRun(new Date()))} disabled={optimRunning || dsoSites.length === 0}>
                      <RefreshCw className="h-4 w-4 mr-1.5" />Lancer 1×
                    </Button>
                    {!optimRunning
                      ? <Button size="sm" onClick={startOptim} disabled={dsoSites.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white"><Play className="h-4 w-4 mr-1.5" />Démarrer auto</Button>
                      : <Button variant="destructive" size="sm" onClick={stopOptim}><Square className="h-4 w-4 mr-1.5" />Arrêter</Button>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-6 flex-wrap text-sm">
                  <span className={`flex items-center gap-1.5 font-medium ${optimRunning ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    <span className={`h-2 w-2 rounded-full ${optimRunning ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                    {optimRunning ? 'Actif' : 'Inactif'}
                  </span>
                  {optimLastRun && <span className="text-muted-foreground">Dernier calcul : <strong className="text-foreground">{optimLastRun.toLocaleTimeString('fr-FR')}</strong></span>}
                  {optimRunning && countdown > 0 && (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Prochain refresh dans <strong className="text-foreground tabular-nums">{countdown}s</strong>
                    </span>
                  )}
                  {optimResultsList.length > 0 && (
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="flex items-center gap-1 text-green-700 dark:text-green-400 font-semibold text-xs"><TrendingUp className="h-3.5 w-3.5" />{optimResultsList.filter(r => r.level === 'full').length} plein</span>
                      <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold text-xs"><Minus className="h-3.5 w-3.5" />{optimResultsList.filter(r => r.level === 'reduced').length} réduit</span>
                      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-xs"><TrendingDown className="h-3.5 w-3.5" />{optimResultsList.filter(r => r.level === 'stop').length} arrêt</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recherche DSO */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10"><CardTitle className="text-lg font-bold">Recherche</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" placeholder="Rechercher un site DSO..." className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" value={dsoSearchTerm} onChange={(e) => setDsoSearchTerm(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Table DSO */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-emerald-500/10 to-emerald-500/5">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Network className="h-5 w-5 text-emerald-600" />
                  Sites DSO ({filteredDsoSites.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Site</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Adresse</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Distributeur (DSO)</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Capacité Max</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Connexion</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Dernier calcul</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Optimiser</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsoSitesLoading ? (
                        <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Chargement des sites DSO...</td></tr>
                      ) : filteredDsoSites.length > 0 ? (
                        filteredDsoSites.map((site, index) => {
                          const result  = optimResults[site.id];
                          const loading = siteOptimLoading[site.id] ?? false;
                          return (
                            <tr key={site.id + '-' + index} className="border-b border-border hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <span className="font-medium text-foreground">{site.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate max-w-xs">{site.address}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4"><Badge variant="info">{site.dsoLabel}</Badge></td>

                              {/* Capacité Max DSO — affiche la valeur après optimisation si disponible */}
                              <td className="py-3 px-4">
                                <div className="space-y-0.5">
                                  <span className="text-sm font-medium text-foreground">{site.maxCapacity} kW</span>
                                  {result && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-[10px] text-muted-foreground">→</span>
                                      <span className={`text-xs font-semibold ${
                                        result.newMaxCapacityKw < site.maxCapacity
                                          ? 'text-orange-600'
                                          : result.newMaxCapacityKw === 0
                                          ? 'text-red-600'
                                          : 'text-green-600'
                                      }`}>
                                        {result.newMaxCapacityKw} kW
                                      </span>
                                      <LevelBadge level={result.level} />
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4"><span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{site.connectionLabel}</span></td>

                              {/* Dernier résultat d'optimisation */}
                              <td className="py-3 px-4">
                                {result ? (
                                  <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">
                                      <span className="font-mono">{result.energyKw.toFixed(1)} kW dispo</span>
                                    </p>
                                    <p className="text-xs">
                                      <span className="text-muted-foreground">max: </span>
                                      <span className="font-mono font-semibold text-foreground">{result.newMaxCapacityKw} kW</span>
                                      <span className="text-muted-foreground mx-1">·</span>
                                      <span className="text-muted-foreground">limite: </span>
                                      <span className="font-mono font-semibold text-foreground">{result.computedLimitKw} kW</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/60">{result.updatedAt.toLocaleTimeString('fr-FR')}</p>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Non calculé</span>
                                )}
                              </td>

                              <td className="py-3 px-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => optimizeSingleSite(site, 'manual')}
                                  disabled={loading || optimRunning}
                                  className="whitespace-nowrap"
                                >
                                  {loading
                                    ? <><RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />Calcul...</>
                                    : <><Zap className="h-3.5 w-3.5 mr-1.5" />Optimiser</>}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center">
                            <Network className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Aucun site DSO trouvé</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">Ajoutez une connexion DSO pour récupérer les sites</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}