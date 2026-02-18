'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  Actor,
  ActorImplementation,
  PluginMetadata,
  LocalSite,
  DsoConnection,
  SiteLink,
} from '@/lib/api';
import { actorsApi, sitesApi, dsoApi } from '@/lib/api';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
} from '@/components/ui';

import {
  Box,
  Building2,
  ChevronRight,
  Edit2,
  MapPin,
  Network,
  Plug,
  Plus,
  Settings,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';

import { Header } from '@/components/layout';

// ✅ helper: supporte apiClient qui renvoie soit T, soit { data: T }
function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as any)) {
    return (res as any).data as T;
  }
  return res as T;
}

export default function ActorsPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingActor, setEditingActor] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showActorModal, setShowActorModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'sites'>('config');

  const [formData, setFormData] = useState({
    actorTypeId: '',
    code: '',
    name: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [siteDsoSelection, setSiteDsoSelection] = useState<Record<string, string>>({});
  const [siteDsoSiteRefSelection, setSiteDsoSiteRefSelection] = useState<Record<string, string>>({});
  const [loadingDsoSites, setLoadingDsoSites] = useState<Record<string, boolean>>({});
  const [siteDsoSitesMap, setSiteDsoSitesMap] = useState<Record<string, any[]>>({});

  // -----------------------
  // QUERIES (TYPÉES ✅)
  // -----------------------

  const { data: actorTypes = [] } = useQuery<any[]>({
    queryKey: ['actor-types'],
    queryFn: async () => unwrap<any[]>(await actorsApi.getTypes()) ?? [],
  });

  const { data: actors = [], isLoading } = useQuery<Actor[]>({
    queryKey: ['actors'],
    queryFn: async () => unwrap<Actor[]>(await actorsApi.getAll()) ?? [],
  });

  const { data: implementations = [] } = useQuery<ActorImplementation[]>({
    queryKey: ['actor-implementations', selectedActor],
    enabled: !!selectedActor,
    queryFn: async () => {
      if (!selectedActor) return [];
      return unwrap<ActorImplementation[]>(await actorsApi.getImplementations(selectedActor)) ?? [];
    },
  });

  const { data: availableImplementations = [] } = useQuery<PluginMetadata[]>({
    queryKey: ['available-implementations', selectedActor],
    enabled: !!selectedActor,
    queryFn: async () => {
      if (!selectedActor) return [];
      return (
        unwrap<PluginMetadata[]>(await actorsApi.getAvailableImplementations(selectedActor)) ?? []
      );
    },
  });

  const { data: allSites = [] } = useQuery<LocalSite[]>({
    queryKey: ['all-sites'],
    queryFn: async () => unwrap<LocalSite[]>(await sitesApi.getAll()) ?? [],
  });

  const { data: dsoConnections = [] } = useQuery<DsoConnection[]>({
    queryKey: ['dso-connections'],
    queryFn: async () => unwrap<DsoConnection[]>(await dsoApi.getConnections()) ?? [],
  });

  const { data: existingSiteLinks = [] } = useQuery<SiteLink[]>({
    queryKey: ['all-site-links'],
    queryFn: async () => unwrap<SiteLink[]>(await dsoApi.getSiteLinks()) ?? [],
  });

  // -----------------------
  // DERIVED DATA
  // -----------------------

  const selectedActorData = useMemo(
    () => actors.find((a) => a.id === selectedActor) ?? null,
    [actors, selectedActor]
  );

  const actorSites = useMemo(
    () => allSites.filter((site) => site.cpoConnection?.actor?.id === selectedActor),
    [allSites, selectedActor]
  );

  const enabledCodes = useMemo(
    () => implementations.map((i) => i.implementation?.code).filter(Boolean) as string[],
    [implementations]
  );

  const filteredAvailableImplementations = useMemo(
    () =>
      availableImplementations.filter((plugin: PluginMetadata) => {
        // ✅ plugin typé => plus d'implicit any
        return !enabledCodes.includes(plugin.id);
      }),
    [availableImplementations, enabledCodes]
  );

  // -----------------------
  // MUTATIONS
  // -----------------------

  const resetForm = () => {
    setFormData({ actorTypeId: '', code: '', name: '' });
    setEditingActor(null);
  };

  const createActorMutation = useMutation({
    mutationFn: actorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateActorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      actorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setEditingActor(null);
      resetForm();
    },
  });

  const deleteActorMutation = useMutation({
    mutationFn: actorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setSelectedActor(null);
    },
  });

  const enableImplMutation = useMutation({
    mutationFn: ({ actorId, code }: { actorId: string; code: string }) =>
      actorsApi.enableImplementation(actorId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actor-implementations'] });
      queryClient.invalidateQueries({ queryKey: ['available-implementations'] });
    },
  });

  const disableImplMutation = useMutation({
    mutationFn: ({ actorId, code }: { actorId: string; code: string }) =>
      actorsApi.disableImplementation(actorId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actor-implementations'] });
      queryClient.invalidateQueries({ queryKey: ['available-implementations'] });
    },
  });

  const createSiteLinkMutation = useMutation({
    mutationFn: (data: { siteId: string; dsoConnectionId: string; dsoSiteRef: string }) => 
      dsoApi.createSiteLink(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['all-site-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-sites'] });
      setSiteDsoSelection({});
      setSiteDsoSiteRefSelection({});
    },
  });

  // -----------------------
  // UI HELPERS
  // -----------------------

  const getActorTypeIcon = (code: string) => {
    switch (code) {
      case 'CPO':
        return <Plug className="h-5 w-5" />;
      case 'PROVIDER':
        return <Zap className="h-5 w-5" />;
      case 'DSO':
        return <Building2 className="h-5 w-5" />;
      case 'TSO':
        return <Network className="h-5 w-5" />;
      case 'EMSP':
        return <Smartphone className="h-5 w-5" />;
      default:
        return <Box className="h-5 w-5" />;
    }
  };

  const getActorTypeBadgeColor = (code: string) => {
    switch (code) {
      case 'CPO':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PROVIDER':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'DSO':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'TSO':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'EMSP':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Group actors by type, filtered by search
  const actorsByType = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = q
      ? actors.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            a.actorType?.name?.toLowerCase().includes(q) ||
            a.actorType?.code?.toLowerCase().includes(q)
        )
      : actors;

    const groups: Record<string, { type: any; actors: Actor[] }> = {};
    for (const actor of filtered) {
      const typeCode = actor.actorType?.code || 'UNKNOWN';
      if (!groups[typeCode]) {
        groups[typeCode] = { type: actor.actorType, actors: [] };
      }
      groups[typeCode].actors.push(actor);
    }
    // Sort by a fixed order
    const order = ['CPO', 'PROVIDER', 'DSO', 'TSO', 'EMSP'];
    return order
      .filter((code) => groups[code])
      .map((code) => groups[code])
      .concat(
        Object.entries(groups)
          .filter(([code]) => !order.includes(code))
          .map(([, g]) => g)
      );
  }, [actors, searchQuery]);

  const handleEditActor = (actor: Actor | null) => {
    if (!actor) return;
    setEditingActor(actor.id);
    setFormData({
      actorTypeId: actor.actorType?.id || '',
      code: actor.code,
      name: actor.name,
    });
  };

  const handleLoadDsoSites = async (siteId: string, dsoConnectionId: string) => {
    setLoadingDsoSites((prev) => ({ ...prev, [siteId]: true }));
    try {
      const res = await dsoApi.getDsoSites(dsoConnectionId);
      // backend may return either an array or an object { sites: [...] }
      const raw = res as any;
      const sites = Array.isArray(raw) ? raw : (raw && (raw.sites || raw.data) ? (raw.sites || raw.data) : []);
      setSiteDsoSitesMap((prev) => ({ ...prev, [siteId]: sites }));
      // Don't auto-select — let the user pick from the dropdown
      setSiteDsoSiteRefSelection((prev) => ({ ...prev, [siteId]: '' }));
    } catch (error) {
      console.error('Failed to load DSO sites:', error);
      setSiteDsoSitesMap((prev) => ({ ...prev, [siteId]: [] }));
    } finally {
      setLoadingDsoSites((prev) => ({ ...prev, [siteId]: false }));
    }
  };

  // -----------------------
  // RENDER
  // -----------------------

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Acteurs"
        description="Gérez les acteurs et leurs implémentations (plugins)"
        searchValue={searchQuery}
        onSearch={setSearchQuery}
        searchPlaceholder="Rechercher un acteur..."
      />

      <div className="p-6 space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Liste des Acteurs</h2>
            <p className="text-sm text-muted-foreground">{actors.length} acteur(s) configuré(s)</p>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvel Acteur
          </Button>
        </div>

        {/* Create Actor Form */}
        {showForm && (
          <Card className="max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Nouvel Acteur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                label="Type d'acteur"
                options={actorTypes.map((t: any) => ({ value: t.id, label: t.name }))}
                value={formData.actorTypeId}
                onChange={(e) => setFormData({ ...formData, actorTypeId: e.target.value })}
                placeholder="Sélectionner..."
              />
              <Input
                label="Code"
                placeholder="WATTZHUB_PROD"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
              <Input
                label="Nom"
                placeholder="WattzHub Production"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() => createActorMutation.mutate(formData)}
                isLoading={createActorMutation.isPending}
                disabled={!formData.actorTypeId || !formData.code || !formData.name}
              >
                Créer
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Actors grouped by type */}
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Chargement des acteurs...
            </CardContent>
          </Card>
        ) : actors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun acteur configuré</h3>
              <p className="text-muted-foreground mb-4">Créez votre premier acteur pour commencer</p>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Créer un acteur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {actorsByType.map((group) => {
              const typeCode = group.type?.code || 'UNKNOWN';
              return (
                <Card key={typeCode} className="overflow-hidden">
                  {/* Type header */}
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border ${getActorTypeBadgeColor(typeCode)}`}>
                      {getActorTypeIcon(typeCode)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{group.type?.name || typeCode}</h3>
                      <p className="text-xs text-muted-foreground">{group.type?.description || ''}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {group.actors.length} acteur{group.actors.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/10">
                          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-3">Nom</th>
                          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-3">Code</th>
                          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-3">Statut</th>
                          <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-3">Créé le</th>
                          <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {group.actors.map((actor) => (
                          <tr
                            key={actor.id}
                            className="hover:bg-muted/20 transition-colors cursor-pointer group"
                            onClick={() => {
                              setSelectedActor(actor.id);
                              setShowActorModal(true);
                            }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${actor.isActive ? getActorTypeBadgeColor(typeCode) : 'bg-muted text-muted-foreground'}`}>
                                  {getActorTypeIcon(typeCode)}
                                </div>
                                <span className="font-medium text-sm text-foreground">{actor.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-foreground">{actor.code}</code>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant={actor.isActive ? 'success' : 'warning'} className="text-xs">
                                {actor.isActive ? 'Actif' : 'Inactif'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {(actor as any).createdAt ? new Date((actor as any).createdAt).toLocaleDateString('fr-FR') : '—'}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedActor(actor.id);
                                  setShowActorModal(true);
                                }}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={showActorModal} onOpenChange={setShowActorModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                {selectedActorData && getActorTypeIcon(selectedActorData.actorType?.code)}
              </div>
              {selectedActorData?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedActorData?.actorType?.name} • {selectedActorData?.code}
            </DialogDescription>
          </DialogHeader>

          {selectedActorData && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge variant={selectedActorData.isActive ? 'success' : 'default'}>
                  {selectedActorData.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleEditActor(selectedActorData)} className="justify-start">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Modifier
                </Button>

                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)} className="justify-start">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>

              {/* Tabs */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center gap-0 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setActiveTab('config')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                      activeTab === 'config'
                        ? 'text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400'
                        : 'text-gray-600 dark:text-gray-400 border-b-transparent hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    CONFIG
                  </button>
                  <button
                    onClick={() => setActiveTab('sites')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
                      activeTab === 'sites'
                        ? 'text-blue-600 dark:text-blue-400 border-b-blue-600 dark:border-b-blue-400'
                        : 'text-gray-600 dark:text-gray-400 border-b-transparent hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    SITES
                  </button>
                </div>

                {/* Tab Content */}
                <div className="pt-4">
                  {activeTab === 'config' && (
                    <div className="space-y-4">
                      {/* Enabled */}
                      {implementations.length > 0 && (
                        <div className="space-y-2">
                          {implementations.map((impl) => (
                            <div
                              key={impl.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20"
                            >
                              <div>
                                <p className="font-medium text-sm">{impl.implementation?.name}</p>
                                <p className="text-xs text-muted-foreground">v{impl.implementation?.version}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (selectedActor && impl.implementation?.code) {
                                    disableImplMutation.mutate({
                                      actorId: selectedActor,
                                      code: impl.implementation.code,
                                    });
                                  }
                                }}
                                disabled={disableImplMutation.isPending}
                              >
                                <ToggleRight className="h-5 w-5 text-primary" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Available */}
                      {filteredAvailableImplementations.length > 0 && (
                        <div className="space-y-2">
                          {filteredAvailableImplementations.map((plugin) => (
                            <div
                              key={plugin.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-muted"
                            >
                              <div>
                                <p className="font-medium text-sm">{plugin.name}</p>
                                <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (selectedActor) {
                                    enableImplMutation.mutate({
                                      actorId: selectedActor,
                                      code: plugin.id,
                                    });
                                  }
                                }}
                                disabled={enableImplMutation.isPending}
                              >
                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'sites' && (
                    <div className="space-y-3">
                      {actorSites.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {actorSites.map((site) => {
                            const existingLink = existingSiteLinks.find((l) => l.siteId === site.id);
                            const selectedDso = siteDsoSelection[site.id] || '';

                            return (
                              <div key={site.id} className="rounded-lg bg-muted/30 border border-muted overflow-hidden">
                                <div className="flex items-center justify-between p-3">
                                  <div>
                                    <p className="font-medium text-sm">{site.name}</p>
                                    <p className="text-xs text-muted-foreground">{site.address || "Pas d'adresse"}</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {existingLink && (
                                      <Badge variant="success" className="text-xs">
                                        ✓ DSO Lié
                                      </Badge>
                                    )}
                                    <Link href={`/sites/${site.id}`}>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>

                                {!existingLink && (
                                  <div className="border-t border-muted bg-background/50 p-3">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={selectedDso}
                                          onChange={(e) => {
                                            const newDsoId = e.target.value;
                                            setSiteDsoSelection((prev) => ({ ...prev, [site.id]: newDsoId }));
                                            if (newDsoId) {
                                              handleLoadDsoSites(site.id, newDsoId);
                                            }
                                          }}
                                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                          <option value="">Sélectionner un DSO...</option>
                                          {dsoConnections.map((conn) => (
                                            <option key={conn.id} value={conn.id}>
                                              {conn.label ? `${conn.label} — ${conn.baseUrl}` : conn.baseUrl}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {selectedDso && (
                                        <div className="flex items-center gap-2">
                                          {loadingDsoSites[site.id] ? (
                                            <div className="flex-1 px-3 py-2 text-sm text-muted-foreground italic">
                                              Chargement des sites DSO...
                                            </div>
                                          ) : (siteDsoSitesMap[site.id] && siteDsoSitesMap[site.id].length > 0) ? (
                                            <select
                                              value={siteDsoSiteRefSelection[site.id] || ''}
                                              onChange={(e) =>
                                                setSiteDsoSiteRefSelection((prev) => ({
                                                  ...prev,
                                                  [site.id]: e.target.value,
                                                }))
                                              }
                                              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                              <option value="">Sélectionner un site DSO...</option>
                                              {siteDsoSitesMap[site.id].map((dsoSite: any) => (
                                                <option key={dsoSite.id} value={dsoSite.id}>
                                                  {dsoSite.name}{dsoSite.address ? ` — ${dsoSite.address}` : ''}{dsoSite.city ? ` • ${dsoSite.city}` : ''}
                                                </option>
                                              ))}
                                            </select>
                                          ) : (
                                            <input
                                              type="text"
                                              placeholder="Entrer la ref DSO du site (ex: SITE_123)"
                                              value={siteDsoSiteRefSelection[site.id] || ''}
                                              onChange={(e) =>
                                                setSiteDsoSiteRefSelection((prev) => ({
                                                  ...prev,
                                                  [site.id]: e.target.value,
                                                }))
                                              }
                                              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                          )}
                                          <Button
                                            size="sm"
                                            onClick={() => {
                                              const dsoSiteRef = siteDsoSiteRefSelection[site.id];
                                              if (!dsoSiteRef) {
                                                alert('Veuillez entrer une référence DSO');
                                                return;
                                              }
                                              createSiteLinkMutation.mutate({
                                                siteId: site.id,
                                                dsoConnectionId: selectedDso,
                                                dsoSiteRef,
                                              });
                                            }}
                                            isLoading={createSiteLinkMutation.isPending}
                                          >
                                            Effectuer
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Aucun site lié à cet acteur</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer l'acteur"
        description={`Êtes-vous sûr de vouloir supprimer l'acteur "${selectedActorData?.name}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => {
          if (selectedActor) {
            deleteActorMutation.mutate(selectedActor);
            setDeleteDialogOpen(false);
            setShowActorModal(false);
          }
        }}
        isLoading={deleteActorMutation.isPending}
      />
    </div>
  );
}
