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
import { cpoApi, dsoApi, regionsApi, sitesApi, Site, DsoConnection } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Header } from '@/components/layout';
import { getSignalStatusText } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';

// DSO site type from mock API
interface DsoSite {
  id: string;
  name: string;
  address: string;
  maxCapacity: number;
  dsoId: string;
  dsoLabel: string;
}

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [filterConnection, setFilterConnection] = useState<string>('all');
  
  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [unassignDialogOpen, setUnassignDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');
  const [reducedLimit, setReducedLimit] = useState<number>(0);
  const [manualLimit, setManualLimit] = useState<number>(0);

  // Manual override dialog state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideLimit, setOverrideLimit] = useState<number>(0);
  const [overrideDuration, setOverrideDuration] = useState<number>(120);
  const [overrideReason, setOverrideReason] = useState<string>('');

  // Queries
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites', filterConnection],
    queryFn: () => sitesApi.getAll(filterConnection !== 'all' ? filterConnection : undefined),
  });

  const { data: regions } = useQuery({
    queryKey: ['edf-regions'],
    queryFn: regionsApi.getAll,
  });

  const { data: connections } = useQuery({
    queryKey: ['cpo-connections'],
    queryFn: cpoApi.getAll,
  });

  const { data: dsoConnections } = useQuery({
    queryKey: ['dso-connections'],
    queryFn: async () => {
      const res = await dsoApi.getConnections();
      return res || [];
    },
  });

  // Active tab: 'cpo' or 'dso'
  const [activeTab, setActiveTab] = useState<'cpo' | 'dso'>('cpo');
  const [dsoSearchTerm, setDsoSearchTerm] = useState('');

  // Fetch DSO sites from all active connections
  const [dsoSites, setDsoSites] = useState<(DsoSite & { connectionLabel: string })[]>([]);
  const [dsoSitesLoading, setDsoSitesLoading] = useState(false);

  useEffect(() => {
    if (!dsoConnections || dsoConnections.length === 0) {
      setDsoSites([]);
      return;
    }

    const fetchAll = async () => {
      setDsoSitesLoading(true);
      const all: (DsoSite & { connectionLabel: string })[] = [];

      for (const conn of dsoConnections as DsoConnection[]) {
        try {
          const data = await dsoApi.getDsoSites(conn.id);
          const raw = data as any;
          const sites: DsoSite[] = raw?.sites || (Array.isArray(raw) ? raw : []);
          sites.forEach((s) =>
            all.push({ ...s, connectionLabel: conn.label || conn.baseUrl })
          );
        } catch {
          // skip failed connections silently
        }
      }

      setDsoSites(all);
      setDsoSitesLoading(false);
    };

    fetchAll();
  }, [dsoConnections]);

  // Filter DSO sites
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

  // Mutations
  const assignRegionMutation = useMutation({
    mutationFn: ({
      siteId,
      regionId,
      reducedLimitKw,
    }: {
      siteId: string;
      regionId: string;
      reducedLimitKw?: number;
    }) => sitesApi.assignRegion(siteId, regionId, reducedLimitKw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] });
      setAssignDialogOpen(false);
      setSelectedSite(null);
      setSelectedRegionId('');
      setReducedLimit(0);
    },
  });

  const unassignRegionMutation = useMutation({
    mutationFn: (siteId: string) => sitesApi.unassignRegion(siteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] }),
  });

  const setLimitMutation = useMutation({
    mutationFn: ({ siteId, limitKw }: { siteId: string; limitKw: number }) =>
      sitesApi.setLimit(siteId, limitKw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] });
      setLimitDialogOpen(false);
      setSelectedSite(null);
      setManualLimit(0);
    },
  });

  const setOverrideMutation = useMutation({
    mutationFn: ({ siteId, limitKw, durationMinutes, reason }: { siteId: string; limitKw: number; durationMinutes?: number; reason?: string }) =>
      sitesApi.setOverride(siteId, limitKw, durationMinutes, reason),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] });
      setOverrideDialogOpen(false);
      setSelectedSite(null);
      setOverrideLimit(0);
      setOverrideDuration(120);
      setOverrideReason('');
      toast.success(`✓ Limite forcée à ${variables.limitKw} kW`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erreur lors de la mise à jour';
      toast.error(`✕ Erreur: ${message}`);
    },
  });

  const [clearOverrideConfirmOpen, setClearOverrideConfirmOpen] = useState(false);

  const clearOverrideMutation = useMutation({
    mutationFn: (siteId: string) => sitesApi.clearOverride(siteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] });
      setClearOverrideConfirmOpen(false);
      toast.success('✓ Override annulé');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Erreur lors de l\'annulation';
      toast.error(`✕ Erreur: ${message}`);
    },
  });

  const dsoSyncMutation = useMutation({
    mutationFn: (id: string) => dsoApi.syncSites(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites', filterConnection] });
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erreur lors de la synchronisation DSO');
    },
  });

  // Open assign dialog
  const openAssignDialog = (site: Site) => {
    setSelectedSite(site);
    setSelectedRegionId(site.edfRegion?.id || '');
    setReducedLimit(site.reducedLimitKw || 0);
    setAssignDialogOpen(true);
  };

  // Open limit dialog
  const openLimitDialog = (site: Site) => {
    setSelectedSite(site);
    setManualLimit(site.currentLimitKw || site.maxCapacityKw || 0);
    setLimitDialogOpen(true);
  };

  // Open override dialog
  const openOverrideDialog = (site: Site) => {
    setSelectedSite(site);
    // Default to 80% of max capacity or current limit
    const defaultLimit = site.manualOverrideLimitKw ?? (site.maxCapacityKw ? Math.round(site.maxCapacityKw * 0.8) : site.currentLimitKw ?? 0);
    setOverrideLimit(defaultLimit > 0 ? defaultLimit : 1);
    setOverrideDuration(120);
    setOverrideReason(site.manualOverrideReason || '');
    setOverrideDialogOpen(true);
  };

  // Filter sites
  const filteredSites = sites?.filter((site) => {
    const matchesSearch =
      !searchTerm ||
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion =
      filterRegion === 'all' ||
      (filterRegion === 'unassigned' && !site.edfRegion) ||
      site.edfRegion?.id === filterRegion;

    const matchesConnection =
      filterConnection === 'all' || site.cpoConnection?.id === filterConnection;

    return matchesSearch && matchesRegion && matchesConnection;
  });

  // Stats
  const totalSites = sites?.length || 0;
  const assignedSites = sites?.filter((s) => s.edfRegion)?.length || 0;
  const activeSites = sites?.filter((s) => s.isActive)?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Sites de Recharge"
        description="Gérez vos sites CPO et consultez les sites DSO"
      />

      <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('cpo')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'cpo'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="h-4 w-4" />
            Sites CPO
            <Badge variant="secondary" className="ml-1 text-xs">{totalSites}</Badge>
          </button>
          <button
            onClick={() => setActiveTab('dso')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dso'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Network className="h-4 w-4" />
            Sites DSO
            <Badge variant="secondary" className="ml-1 text-xs">{dsoSites.length}</Badge>
          </button>
        </div>

        {activeTab === 'cpo' && (
          <>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites Total</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{totalSites}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avec Région EDF</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{assignedSites}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites Actifs</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{activeSites}</p>
                </div>
                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10">
            <CardTitle className="text-lg font-bold">Filtres</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un site..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Select
                options={[
                  { value: 'all', label: 'Toutes les régions' },
                  { value: 'unassigned', label: 'Sans région' },
                  ...(regions?.map((r) => ({ value: r.id, label: r.name })) || []),
                ]}
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-56"
              />

              <Select
                options={[
                  { value: 'all', label: 'Toutes les connexions' },
                  ...(connections?.map((c) => ({
                    value: c.id,
                    label: c.actor?.name || 'CPO',
                  })) || []),
                ]}
                value={filterConnection}
                onChange={(e) => setFilterConnection(e.target.value)}
                className="w-56"
              />

              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  onClick={async () => {
                    if (!dsoConnections || dsoConnections.length === 0) {
                      toast.error('Aucune connexion DSO configurée');
                      return;
                    }

                    try {
                      for (const conn of dsoConnections as DsoConnection[]) {
                        await dsoSyncMutation.mutateAsync(conn.id);
                      }
                      toast.success('Synchronisation DSO terminée');
                    } catch (err: any) {
                      // errors handled in mutation onError
                    }
                  }}
                >
                  Sync DSO Sites
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites Table */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10">
            <CardTitle className="text-lg font-bold">
              Liste des Sites ({filteredSites?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Site
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      CPO
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Région EDF
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Signal
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Capacité
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Limite Actuelle
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sitesLoading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        Chargement...
                      </td>
                    </tr>
                  ) : filteredSites && filteredSites.length > 0 ? (
                    filteredSites.map((site) => (
                      <tr key={site.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-foreground">{site.name}</p>
                            {site.address && (
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {site.address}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {site.cpoConnection?.actor?.name || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {site.hasEdfPlugin === false ? (
                            <span className="text-xs text-muted-foreground italic">
                              N/A
                            </span>
                          ) : site.edfRegion ? (
                            <Badge variant="info">{site.edfRegion.name}</Badge>
                          ) : (
                            <Badge variant="warning">Non assigné</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {site.lastSignalValue !== undefined && site.lastSignalValue !== null ? (
                            <div className="flex items-center gap-1.5">
                              {site.lastSignalValue === 1 ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span
                                className={`text-sm ${
                                  site.lastSignalValue === 1 ? 'text-green-700' : 'text-red-700'
                                }`}
                              >
                                {getSignalStatusText(site.lastSignalValue)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-foreground">
                            {site.maxCapacityKw ? `${site.maxCapacityKw} kW` : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span
                              className={`text-sm font-medium ${
                                site.currentLimitKw !== site.maxCapacityKw
                                  ? 'text-orange-500'
                                  : 'text-foreground'
                              }`}
                            >
                              {site.currentLimitKw ? `${site.currentLimitKw} kW` : '-'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openLimitDialog(site)}
                              title="Modifier la limite manuellement"
                            >
                              <Edit className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {site.hasEdfPlugin === false ? (
                              <Badge variant="secondary" className="text-xs">
                                Plugin EDF non activé
                              </Badge>
                            ) : site.edfRegion ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAssignDialog(site)}
                                >
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSite(site);
                                    setUnassignDialogOpen(true);
                                  }}
                                >
                                  ✕
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openAssignDialog(site)}
                              >
                                <MapPin className="h-4 w-4 mr-1" />
                                Assigner Région
                              </Button>
                            )}

                            {/* Forcer button (more visible) */}
                            <Button
                              variant={site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date() ? 'destructive' : 'secondary'}
                              size="sm"
                              onClick={() => openOverrideDialog(site)}
                              title="Forcer une limite manuelle"
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              <span className="text-sm">Forcer</span>
                            </Button>

                            {site.manualOverrideUntil && new Date(site.manualOverrideUntil) > new Date() && (
                              <Badge variant="destructive" className="text-xs">
                                Forcé ({formatDistanceToNow(new Date(site.manualOverrideUntil), { addSuffix: true, locale: fr })})
                              </Badge>
                            )} 
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Aucun site trouvé</p>
                        <p className="text-sm text-muted-foreground/70">
                          Synchronisez vos sites depuis une connexion CPO
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Assign Region Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assigner une Région EDF</DialogTitle>
              <DialogDescription>
                Sélectionnez la région EDF pour le site{' '}
                <strong>{selectedSite?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select
                label="Région EDF"
                options={
                  regions?.map((r) => ({ value: r.id, label: r.name })) || []
                }
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                placeholder="Sélectionner une région..."
              />
              <Input
                label="Limite réduite (kW)"
                type="number"
                value={reducedLimit || ''}
                onChange={(e) => setReducedLimit(Number(e.target.value))}
                placeholder="Laisser vide pour utiliser la capacité max"
                helperText="Limite appliquée lors des signaux de délestage"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setAssignDialogOpen(false);
                  setSelectedSite(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (selectedSite && selectedRegionId) {
                    assignRegionMutation.mutate({
                      siteId: selectedSite.id,
                      regionId: selectedRegionId,
                      reducedLimitKw: reducedLimit || undefined,
                    });
                  }
                }}
                isLoading={assignRegionMutation.isPending}
                disabled={!selectedRegionId}
              >
                Assigner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manual Limit Dialog */}
        <Dialog open={limitDialogOpen} onOpenChange={setLimitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la Limite Manuellement</DialogTitle>
              <DialogDescription>
                Définissez une nouvelle limite de puissance pour le site{' '}
                <strong>{selectedSite?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                <p>Capacité maximale: <strong>{selectedSite?.maxCapacityKw || '-'} kW</strong></p>
                <p>Limite actuelle: <strong>{selectedSite?.currentLimitKw || '-'} kW</strong></p>
              </div>
              <Input
                label="Nouvelle limite (kW)"
                type="number"
                value={manualLimit || ''}
                onChange={(e) => setManualLimit(Number(e.target.value))}
                placeholder="Entrez la nouvelle limite"
                helperText="Cette limite sera envoyée au CPO via l'API WattzHub"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setLimitDialogOpen(false);
                  setSelectedSite(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => {
                  if (selectedSite && manualLimit > 0) {
                    setLimitMutation.mutate({
                      siteId: selectedSite.id,
                      limitKw: manualLimit,
                    });
                  }
                }}
                isLoading={setLimitMutation.isPending}
                disabled={!manualLimit || manualLimit <= 0}
              >
                Appliquer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Override Dialog */}
        <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Forcer une limite</DialogTitle>
              <DialogDescription>Forcer une limite pour ce site et ignorer les signaux EDF pendant la durée spécifiée.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="text-sm text-muted-foreground">
                <p>Site: <strong>{selectedSite?.name}</strong></p>
                <p>Capacité max: <strong>{selectedSite?.maxCapacityKw || '-'} kW</strong></p>
              </div>

              <div className="flex items-center gap-4">
                <Input
                  label="Limite (kW)"
                  type="number"
                  value={overrideLimit || ''}
                  onChange={(e) => setOverrideLimit(Number(e.target.value))}
                  placeholder="Ex: 80"
                />

                <div className="w-48">
                  <Input
                    label="Durée (minutes)"
                    type="number"
                    value={overrideDuration}
                    onChange={(e) => setOverrideDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(30)}>30m</Button>
                <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(120)}>2h</Button>
                <Button size="sm" variant="ghost" onClick={() => setOverrideDuration(1440)}>24h</Button>
              </div>

              <Input
                label="Raison"
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Ex: site prioritaire"
              />

              {overrideLimit <= 0 && (
                <p className="text-red-500 text-sm">La limite doit être supérieure à 0 kW.</p>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { setOverrideDialogOpen(false); setSelectedSite(null); }}>Annuler</Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedSite) {
                    setOverrideMutation.mutate({ siteId: selectedSite.id, limitKw: overrideLimit, durationMinutes: overrideDuration, reason: overrideReason });
                  }
                }}
                disabled={!selectedSite || overrideLimit <= 0}
                isLoading={setOverrideMutation.isPending}
              >
                Forcer
              </Button>

              {selectedSite?.manualOverrideUntil && new Date(selectedSite.manualOverrideUntil) > new Date() && (
                <Button 
                  variant="ghost" 
                  onClick={() => setClearOverrideConfirmOpen(true)}
                  disabled={clearOverrideMutation.isPending}
                >
                  Annuler override
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Clear Override Confirmation */}
        <ConfirmDialog
          open={clearOverrideConfirmOpen}
          onOpenChange={setClearOverrideConfirmOpen}
          title="Annuler l'override"
          description={`Êtes-vous sûr de vouloir annuler le forçage pour "${selectedSite?.name}" ? Les signaux EDF seront à nouveau appliqués.`}
          confirmText="Annuler l'override"
          cancelText="Non, garder"
          variant="destructive"
          onConfirm={() => {
            if (selectedSite) {
              clearOverrideMutation.mutate(selectedSite.id);
            }
          }}
          isLoading={clearOverrideMutation.isPending}
        />

        {/* Unassign Region Confirmation Dialog */}
        <ConfirmDialog
          open={unassignDialogOpen}
          onOpenChange={setUnassignDialogOpen}
          title="Retirer l'assignation de région"
          description={`Êtes-vous sûr de vouloir retirer la région ${selectedSite?.edfRegion?.name || ''} du site "${selectedSite?.name}" ? Le site ne recevra plus les signaux EDF de cette région.`}
          confirmText="Retirer"
          cancelText="Annuler"
          variant="warning"
          onConfirm={() => {
            if (selectedSite) {
              unassignRegionMutation.mutate(selectedSite.id);
              setUnassignDialogOpen(false);
              setSelectedSite(null);
            }
          }}
          isLoading={unassignRegionMutation.isPending}
        />
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* DSO Sites Tab                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeTab === 'dso' && (
          <>
            {/* DSO Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Sites DSO</p>
                      <p className="text-3xl font-bold text-foreground mt-2">{dsoSites.length}</p>
                    </div>
                    <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                      <Network className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Distributeurs</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {new Set(dsoSites.map((s) => s.dsoId)).size}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Capacité Totale</p>
                      <p className="text-3xl font-bold text-foreground mt-2">
                        {dsoSites.reduce((sum, s) => sum + (s.maxCapacity || 0), 0)} <span className="text-lg font-normal text-muted-foreground">kW</span>
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DSO Search */}
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-muted/10">
                <CardTitle className="text-lg font-bold">Recherche</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un site DSO..."
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={dsoSearchTerm}
                    onChange={(e) => setDsoSearchTerm(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* DSO Sites Table */}
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
                      </tr>
                    </thead>
                    <tbody>
                      {dsoSitesLoading ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            Chargement des sites DSO...
                          </td>
                        </tr>
                      ) : filteredDsoSites.length > 0 ? (
                        filteredDsoSites.map((site) => (
                          <tr key={site.id} className="border-b border-border hover:bg-muted/50 transition-colors">
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
                            <td className="py-3 px-4">
                              <Badge variant="info">{site.dsoLabel}</Badge>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-sm font-medium text-foreground">
                                {site.maxCapacity} kW
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                {site.connectionLabel}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center">
                            <Network className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">Aucun site DSO trouvé</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              Ajoutez une connexion DSO pour récupérer les sites
                            </p>
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
