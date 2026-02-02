'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle,
  Edit,
  MapPin,
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
import { cpoApi, regionsApi, sitesApi, Site } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/layout';
import { getSignalStatusText } from '@/lib/utils';
import { useState } from 'react';

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

  // Queries
  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.getAll(),
  });

  const { data: regions } = useQuery({
    queryKey: ['edf-regions'],
    queryFn: regionsApi.getAll,
  });

  const { data: connections } = useQuery({
    queryKey: ['cpo-connections'],
    queryFn: cpoApi.getAll,
  });

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
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setAssignDialogOpen(false);
      setSelectedSite(null);
      setSelectedRegionId('');
      setReducedLimit(0);
    },
  });

  const unassignRegionMutation = useMutation({
    mutationFn: (siteId: string) => sitesApi.unassignRegion(siteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites'] }),
  });

  const setLimitMutation = useMutation({
    mutationFn: ({ siteId, limitKw }: { siteId: string; limitKw: number }) =>
      sitesApi.setLimit(siteId, limitKw),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setLimitDialogOpen(false);
      setSelectedSite(null);
      setManualLimit(0);
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
        description="Gérez vos sites et assignez-les aux régions EDF"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSites}</p>
                  <p className="text-sm text-muted-foreground">Sites Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{assignedSites}</p>
                  <p className="text-sm text-muted-foreground">Avec Région EDF</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeSites}</p>
                  <p className="text-sm text-muted-foreground">Sites Actifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un site..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                className="w-48"
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
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sites Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Liste des Sites ({filteredSites?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>
    </div>
  );
}
