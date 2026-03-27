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
import { fetchFranceRegions, type FranceRegion } from '@/lib/france-regions';

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
  Skeleton,
} from '@/components/ui';

import {
  Box,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit2,
  Eye,
  Link2,
  MapPin,
  Network,
  Plug,
  Plus,
  Radio,
  Settings,
  Smartphone,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Search,
  Layers,
  Activity,
  Landmark,
  X,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Header } from '@/components/layout';

// ✅ helper: supporte apiClient qui renvoie soit T, soit { data: T }
function unwrap<T>(res: unknown): T {
  if (res && typeof res === 'object' && 'data' in (res as any)) {
    return (res as any).data as T;
  }
  return res as T;
}

// Actor type visual config
const ACTOR_TYPE_CONFIG: Record<string, { icon: React.ElementType; gradient: string; badgeClass: string; bgClass: string; emoji: string }> = {
  CPO: { icon: Plug, gradient: 'from-blue-500 to-blue-600', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', bgClass: 'bg-blue-500/10', emoji: '⚡' },
  PROVIDER: { icon: Zap, gradient: 'from-amber-500 to-amber-600', badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', bgClass: 'bg-amber-500/10', emoji: '🔌' },
  DSO: { icon: Building2, gradient: 'from-emerald-500 to-emerald-600', badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', bgClass: 'bg-emerald-500/10', emoji: '🏢' },
  TSO: { icon: Network, gradient: 'from-purple-500 to-purple-600', badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', bgClass: 'bg-purple-500/10', emoji: '🌐' },
  EMSP: { icon: Smartphone, gradient: 'from-pink-500 to-pink-600', badgeClass: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20', bgClass: 'bg-pink-500/10', emoji: '📱' },
};

const DEFAULT_TYPE_CONFIG = { icon: Box, gradient: 'from-gray-500 to-gray-600', badgeClass: 'bg-muted text-muted-foreground', bgClass: 'bg-muted', emoji: '📦' };

/* ── Region Combobox ── */
function RegionCombobox({
  regions,
  value,
  onChange,
}: {
  regions: FranceRegion[];
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const sorted = useMemo(
    () => [...regions].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')),
    [regions],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (r) =>
        r.nom.toLowerCase().includes(q) ||
        r.chefLieu.toLowerCase().includes(q) ||
        r.code.includes(q),
    );
  }, [search, sorted]);

  const selected = regions.find((r) => r.code === value);

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Région</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-9"
          >
            {selected ? (
              <span className="flex items-center gap-2 truncate">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selected.color }}
                />
                <span className="truncate">{selected.nom}</span>
                <span className="text-muted-foreground text-xs">— {selected.chefLieu}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">Sélectionner une région…</span>
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
          align="start"
          sideOffset={4}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une région…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="h-4 w-4 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-[280px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucune région trouvée
              </div>
            ) : (
              filtered.map((region) => {
                const isSelected = region.code === value;
                return (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => {
                      onChange(isSelected ? '' : region.code);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent ${
                      isSelected ? 'bg-accent/70' : ''
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full shrink-0 ring-1 ring-black/10"
                      style={{ backgroundColor: region.color }}
                    />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium truncate">{region.nom}</span>
                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                          {region.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Landmark className="h-3 w-3" />
                          {region.chefLieu}
                        </span>
                        <span>·</span>
                        <span>{region.population} hab.</span>
                        <span>·</span>
                        <span>{region.departements} dép.</span>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function getTypeConfig(code: string) {
  return ACTOR_TYPE_CONFIG[code] || DEFAULT_TYPE_CONFIG;
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
    region: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [siteDsoSelection, setSiteDsoSelection] = useState<Record<string, string>>({});
  const [detailsLinkId, setDetailsLinkId] = useState<string | null>(null);
  const [detailsSnapshot, setDetailsSnapshot] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // -----------------------
  // QUERIES (TYPÉES ✅)
  // -----------------------

  const { data: actorTypes = [] } = useQuery<any[]>({
    queryKey: ['actor-types'],
    queryFn: async () => unwrap<any[]>(await actorsApi.getTypes()) ?? [],
  });

  const { data: regions = [] } = useQuery<FranceRegion[]>({
    queryKey: ['france-regions'],
    queryFn: fetchFranceRegions,
    staleTime: 1000 * 60 * 60,
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
        unwrap<PluginMetadata[]>(await actorsApi.getAvailableImplementations()) ?? []
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

  // ✅ FIX: Récupérer les liens depuis TOUTES les connexions DSO (comme SitesPage)
  // L'ancienne version appelait dsoApi.getSiteLinks() sans connectionId → retournait []
  const { data: existingSiteLinks = [] } = useQuery<SiteLink[]>({
    queryKey: ['all-site-links', dsoConnections.map((c) => c.id).join(',')],
    enabled: dsoConnections.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        dsoConnections.map(async (conn) => {
          try {
            const res = await dsoApi.getSiteLinks(conn.id);
            const arr = Array.isArray(res) ? res : unwrap<SiteLink[]>(res);
            return Array.isArray(arr) ? arr : [];
          } catch {
            return [];
          }
        })
      );
      return results.flat() as SiteLink[];
    },
  });

  // -----------------------
  // DERIVED DATA
  // -----------------------

  // Preload all DSO sites from all connections for the single dropdown
  const { data: allDsoSiteOptions = [], isLoading: dsoSitesLoading } = useQuery<
    { connectionId: string; connectionLabel: string; dsoSiteId: string; dsoSiteName: string }[]
  >({
    queryKey: ['all-dso-site-options', dsoConnections.map((c) => c.id).join(',')],
    enabled: dsoConnections.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        dsoConnections.map(async (conn) => {
          try {
            const res = await dsoApi.getDsoSites(conn.id);
            const raw = res as any;
            const sites = Array.isArray(raw)
              ? raw
              : raw && (raw.sites || raw.data)
              ? raw.sites || raw.data
              : [];
            const label = conn.label || conn.baseUrl;
            return sites.map((s: any) => ({
              connectionId: conn.id,
              connectionLabel: label,
              dsoSiteId: String(s.id),
              dsoSiteName: s.name || s.id,
            }));
          } catch {
            return [];
          }
        })
      );
      return results.flat();
    },
  });

  const selectedActorData = useMemo(
    () => actors.find((a) => a.id === selectedActor) ?? null,
    [actors, selectedActor]
  );

  const actorSites = useMemo(
    () => allSites.filter((site) => (site.cpoConnection as any)?.actorId === selectedActor),
    [allSites, selectedActor]
  );

  const enabledCodes = useMemo(
    () => implementations.map((i) => i.implementation?.code).filter(Boolean) as string[],
    [implementations]
  );

  const filteredAvailableImplementations = useMemo(
    () =>
      availableImplementations.filter((plugin: PluginMetadata) => {
        return !enabledCodes.includes(plugin.id);
      }),
    [availableImplementations, enabledCodes]
  );

  // -----------------------
  // MUTATIONS
  // -----------------------

  const resetForm = () => {
    setFormData({ actorTypeId: '', code: '', name: '', region: '' });
    setEditingActor(null);
  };

  const createActorMutation = useMutation({
    mutationFn: async (data: { actorTypeId: string; code: string; name: string; region: string }) => {
      const result = await actorsApi.create(data);
      const actor = unwrap<Actor>(result);
      if (data.region && actor?.id) {
        await actorsApi.update(actor.id, { config: { region: data.region } } as Partial<Actor>);
      }
      return actor;
    },
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
      // ✅ FIX: invalider avec le bon queryKey (celui qui inclut les IDs des connexions)
      queryClient.invalidateQueries({ queryKey: ['all-site-links'] });
      queryClient.invalidateQueries({ queryKey: ['all-sites'] });
      setSiteDsoSelection({});
    },
  });

  const updateActorConfigMutation = useMutation({
    mutationFn: ({ id, config }: { id: string; config: Record<string, unknown> }) =>
      actorsApi.update(id, { config } as Partial<Actor>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
    },
  });

  // -----------------------
  // UI HELPERS
  // -----------------------

  const getActorTypeIcon = (code: string) => {
    const cfg = getTypeConfig(code);
    const Icon = cfg.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getActorTypeBadgeColor = (code: string) => getTypeConfig(code).badgeClass;

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

  // Stats
  const totalActors = actors.length;
  const activeActorsCount = actors.filter((a) => a.isActive).length;
  const inactiveActorsCount = totalActors - activeActorsCount;
  const actorTypesCount = new Set(actors.map((a) => a.actorType?.code)).size;

  const handleEditActor = (actor: Actor | null) => {
    if (!actor) return;
    setEditingActor(actor.id);
    setFormData({
      actorTypeId: actor.actorType?.id || '',
      code: actor.code,
      name: actor.name,
      region: (actor as any).region || '',
    });
  };

  const handleOpenDetails = async (linkId: string) => {
    setDetailsLinkId(linkId);
    setDetailsSnapshot(null);
    setDetailsLoading(true);
    try {
      const full = await dsoApi.getSiteLinkById(linkId);
      const snapshots = (full as any)?.energySnapshots ?? [];
      const sorted = [...snapshots].sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setDetailsSnapshot(sorted[0] ?? null);
    } catch (err) {
      console.error('Failed to load liaison details:', err);
    } finally {
      setDetailsLoading(false);
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

        {/* ── Top Stats Row ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Acteurs</p>
                  <p className="text-3xl font-bold mt-1">{totalActors}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Actifs</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{activeActorsCount}</p>
                    {totalActors > 0 && (
                      <span className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        {((activeActorsCount / totalActors) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Inactifs</p>
                  <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{inactiveActorsCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Types</p>
                  <p className="text-3xl font-bold mt-1">{actorTypesCount}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Layers className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Action Row ──────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Liste des Acteurs
            </h2>
            <p className="text-sm text-muted-foreground">{actors.length} acteur(s) configuré(s)</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Acteur
          </Button>
        </div>

        {/* ── Create Actor Form ──────────────────────────── */}
        {showForm && (
          <Card className="max-w-lg animate-in slide-in-from-top-2 duration-300 border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                Nouvel Acteur
              </CardTitle>
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
              <RegionCombobox
                regions={regions}
                value={formData.region}
                onChange={(code) => setFormData({ ...formData, region: code })}
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

        {/* ── Actors Grid ─────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-muted" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-20 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-8 rounded-lg bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : actors.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-primary/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Aucun acteur configuré</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Les acteurs représentent les entités qui interagissent avec le système. Créez votre premier acteur pour commencer.
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer un acteur
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {actorsByType.map((group, groupIndex) => {
              const typeCode = group.type?.code || 'UNKNOWN';
              const typeConfig = getTypeConfig(typeCode);

              return (
                <div key={typeCode} style={{ animationDelay: `${groupIndex * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Type Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${typeConfig.badgeClass}`}>
                      <span className="text-lg">{typeConfig.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{group.type?.name || typeCode}</h3>
                      <p className="text-xs text-muted-foreground">{group.type?.description || ''}</p>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                      {group.actors.length} acteur{group.actors.length > 1 ? 's' : ''}
                    </Badge>
                  </div>

                  {/* Actor Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.actors.map((actor, actorIndex) => {
                      const implCount = actor.actorImplementations?.length || 0;
                      const activeImpls = actor.actorImplementations?.filter((i) => i.isEnabled).length || 0;
                      const hasEdfSignal = Boolean((actor.config as Record<string, unknown>)?.edfSignalEnabled);
                      const actorRegionCode = (actor.config as Record<string, unknown>)?.region as string | undefined;
                      const actorRegion = actorRegionCode ? regions.find((r) => r.code === actorRegionCode) : null;

                      return (
                        <Card
                          key={actor.id}
                          className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:ring-1 hover:ring-primary/30"
                          style={{ animationDelay: `${(groupIndex * 100) + (actorIndex * 50)}ms` }}
                          onClick={() => {
                            setSelectedActor(actor.id);
                            setShowActorModal(true);
                          }}
                        >
                          {/* Top gradient bar */}
                          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${typeConfig.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                          <CardContent className="pt-6 pb-5">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                  actor.isActive ? typeConfig.badgeClass : 'bg-muted text-muted-foreground'
                                }`}>
                                  {getActorTypeIcon(typeCode)}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                    {actor.name}
                                  </h4>
                                  <code className="text-xs text-muted-foreground font-mono">{actor.code}</code>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                            </div>

                            {/* Status badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <Badge variant={actor.isActive ? 'success' : 'warning'} className="text-xs">
                                {actor.isActive ? 'Actif' : 'Inactif'}
                              </Badge>
                              {actorRegion && (
                                <Badge
                                  variant="outline"
                                  className="text-xs gap-1.5 pr-2.5"
                                  style={{ borderColor: `${actorRegion.color}40`, backgroundColor: `${actorRegion.color}08` }}
                                >
                                  <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ backgroundColor: actorRegion.color }}
                                  />
                                  <span style={{ color: actorRegion.color }}>{actorRegion.nom}</span>
                                </Badge>
                              )}
                              {hasEdfSignal && (
                                <Badge className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                                  <Radio className="h-3 w-3 mr-1" />
                                  EDF
                                </Badge>
                              )}
                              {implCount > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {activeImpls}/{implCount} plugin{implCount > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>

                            {/* Progress bar for plugins */}
                            {implCount > 0 && (
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                  <span className="text-muted-foreground">Plugins activés</span>
                                  <span className="font-medium">{activeImpls}/{implCount}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${typeConfig.gradient} transition-all duration-700`}
                                    style={{ width: `${implCount > 0 ? (activeImpls / implCount) * 100 : 0}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Creation date */}
                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {(actor as any).createdAt
                                  ? new Date((actor as any).createdAt).toLocaleDateString('fr-FR')
                                  : '—'}
                              </span>
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium">
                                Voir détails →
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Actor Detail Modal ────────────────────────── */}
      <Dialog open={showActorModal} onOpenChange={setShowActorModal}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedActorData && (() => {
                const cfg = getTypeConfig(selectedActorData.actorType?.code);
                return (
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {getActorTypeIcon(selectedActorData.actorType?.code)}
                  </div>
                );
              })()}
              <div>
                <span className="text-lg">{selectedActorData?.name}</span>
                <p className="text-sm font-normal text-muted-foreground">
                  {selectedActorData?.actorType?.name} • <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{selectedActorData?.code}</code>
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedActorData && (
            <div className="space-y-6">
              {/* Status + Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedActorData.isActive ? 'success' : 'warning'} className="gap-1">
                    {selectedActorData.isActive ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {selectedActorData.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                  {Boolean((selectedActorData.config as Record<string, unknown>)?.edfSignalEnabled) && (
                    <Badge className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 gap-1">
                      <Radio className="h-3 w-3" /> Signal EDF
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditActor(selectedActorData)}
                    className="gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </div>
              </div>

              {/* Edition Formulaire dans le modal */}
              {editingActor === selectedActorData.id ? (
                <Card className="max-w-lg mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Modifier l'acteur</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select
                      label="Type d'acteur"
                      options={actorTypes.map((t: any) => ({ value: t.id, label: t.name }))}
                      value={formData.actorTypeId}
                      onChange={(e) => setFormData({ ...formData, actorTypeId: e.target.value })}
                      placeholder="Sélectionner..."
                      disabled
                    />
                    <Input
                      label="Code"
                      placeholder="WATTZHUB_PROD"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value.toUpperCase() })
                      }
                      disabled
                    />
                    <Input
                      label="Nom"
                      placeholder="WattzHub Production"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingActor(null)}>
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        updateActorMutation.mutate({
                          id: selectedActorData.id,
                          data: { name: formData.name },
                        });
                        setEditingActor(null);
                        setShowActorModal(false);
                      }}
                      isLoading={updateActorMutation.isPending}
                      disabled={!formData.name}
                    >
                      Enregistrer
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <>
                  <div className="border-t pt-6 space-y-4">
                    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                      <button
                        onClick={() => setActiveTab('config')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center ${
                          activeTab === 'config'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Settings className="h-4 w-4" />
                        Configuration
                      </button>
                      <button
                        onClick={() => setActiveTab('sites')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex-1 justify-center ${
                          activeTab === 'sites'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                        Sites
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div className="pt-4">
                      {activeTab === 'config' && (
                        <div className="space-y-4">
                          {/* EDF Signal Activation */}
                          <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4 transition-all hover:shadow-md">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-700 flex items-center justify-center">
                                  <Radio className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-sm text-purple-900 dark:text-purple-200">Activation Signal EDF</p>
                                  <p className="text-xs text-purple-600 dark:text-purple-400">
                                    Réception et traitement des signaux EDF Tempo
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (!selectedActor || !selectedActorData) return;
                                  const currentConfig = (selectedActorData.config || {}) as Record<string, unknown>;
                                  const newValue = !currentConfig.edfSignalEnabled;
                                  updateActorConfigMutation.mutate({
                                    id: selectedActor,
                                    config: { ...currentConfig, edfSignalEnabled: newValue },
                                  });
                                }}
                                disabled={updateActorConfigMutation.isPending}
                                className="transition-transform hover:scale-105"
                              >
                                {(selectedActorData?.config as Record<string, unknown>)?.edfSignalEnabled ? (
                                  <ToggleRight className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                                )}
                              </Button>
                            </div>
                            {Boolean((selectedActorData?.config as Record<string, unknown>)?.edfSignalEnabled) && (
                              <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                                <Badge variant="success" className="text-xs gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Signal EDF activé
                                </Badge>
                              </div>
                            )}
                          </div>

                          {/* Enabled Implementations */}
                          {implementations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plugins activés</p>
                              {implementations.map((impl) => (
                                <div
                                  key={impl.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 transition-all hover:shadow-sm hover:bg-primary/10"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Shield className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{impl.implementation?.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        v{impl.implementation?.version}
                                      </p>
                                    </div>
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
                                    className="transition-transform hover:scale-105"
                                  >
                                    <ToggleRight className="h-6 w-6 text-primary" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Available Implementations */}
                          {filteredAvailableImplementations.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plugins disponibles</p>
                              {filteredAvailableImplementations.map((plugin) => (
                                <div
                                  key={plugin.id}
                                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border transition-all hover:shadow-sm hover:bg-muted/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                                      <Box className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{plugin.name}</p>
                                      <p className="text-xs text-muted-foreground">v{plugin.version}</p>
                                    </div>
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
                                    className="transition-transform hover:scale-105"
                                  >
                                    <ToggleLeft className="h-6 w-6 text-muted-foreground" />
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
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                              {actorSites.map((site, idx) => {
                                const existingLink = existingSiteLinks.find(
                                  (l) => l.siteId === site.id
                                );

                                return (
                                  <div
                                    key={site.id}
                                    className="rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-md"
                                    style={{ animationDelay: `${idx * 60}ms`, animation: 'fadeInUp 0.4s ease-out both' }}
                                  >
                                    <div className="flex items-center justify-between p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 flex items-center justify-center">
                                          <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                          <p className="font-semibold text-sm">{site.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {site.address || "Pas d'adresse"}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {existingLink && (
                                          <Badge variant="success" className="text-xs gap-1">
                                            <CheckCircle className="h-3 w-3" />
                                            DSO Lié
                                          </Badge>
                                        )}
                                        <Link href={`/sites/${site.id}`}>
                                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 transition-transform hover:scale-110">
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                          </Button>
                                        </Link>
                                      </div>
                                    </div>

                                    {/* Liaison details when DSO is linked */}
                                    {existingLink && (() => {
                                      const dsoConn = dsoConnections.find(
                                        (c) => c.id === existingLink.dsoConnectionId
                                      );
                                      return (
                                        <div className="border-t border-border bg-muted/30 p-3 space-y-2">
                                          <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-lg bg-background border border-border p-2.5">
                                              <p className="text-[10px] uppercase font-semibold text-indigo-500 dark:text-indigo-400 mb-1">CPO Site</p>
                                              <p className="text-sm font-bold truncate">{site.name}</p>
                                              <p className="text-xs text-muted-foreground truncate">{site.externalId}</p>
                                            </div>
                                            <div className="rounded-lg bg-background border border-border p-2.5">
                                              <p className="text-[10px] uppercase font-semibold text-purple-500 dark:text-purple-400 mb-1">DSO Lié</p>
                                              <p className="text-sm font-bold truncate">
                                                {dsoConn?.label || dsoConn?.baseUrl || 'DSO Inconnu'}
                                              </p>
                                              <p className="text-xs text-muted-foreground truncate">Ref: {existingLink.dsoSiteRef}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center justify-between pt-2 border-t border-border">
                                            <Badge
                                              variant={existingLink.enabled ? 'success' : 'warning'}
                                              className="text-[10px] gap-1"
                                            >
                                              {existingLink.enabled ? <><CheckCircle className="h-2.5 w-2.5" /> Actif</> : <><AlertCircle className="h-2.5 w-2.5" /> Inactif</>}
                                            </Badge>
                                            <div className="flex items-center gap-1.5">
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs h-7 gap-1 transition-transform hover:scale-105"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleOpenDetails(existingLink.id);
                                                }}
                                              >
                                                <Eye className="h-3 w-3" />
                                                Détails
                                              </Button>
                                              <Link href={`/sites/${site.id}`}>
                                                <Button variant="outline" size="sm" className="text-xs h-7 gap-1 transition-transform hover:scale-105">
                                                  <Zap className="h-3 w-3" />
                                                  Voir site
                                                </Button>
                                              </Link>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Liaison form when not linked */}
                                    {!existingLink && (
                                      <div className="border-t border-border bg-muted/20 p-3">
                                        <div className="flex items-center gap-2">
                                          {dsoSitesLoading ? (
                                            <div className="flex-1 px-3 py-2 text-sm text-muted-foreground italic">
                                              Chargement des sites DSO...
                                            </div>
                                          ) : (
                                            <select
                                              value={siteDsoSelection[site.id] || ''}
                                              onChange={(e) => {
                                                setSiteDsoSelection((prev) => ({
                                                  ...prev,
                                                  [site.id]: e.target.value,
                                                }));
                                              }}
                                              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm font-medium bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                            >
                                              <option value="">Sélectionner un site DSO...</option>
                                              {allDsoSiteOptions.map((opt) => (
                                                <option
                                                  key={`${opt.connectionId}::${opt.dsoSiteId}`}
                                                  value={`${opt.connectionId}::${opt.dsoSiteId}`}
                                                >
                                                  {opt.connectionLabel} : {opt.dsoSiteName}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                          <Button
                                            size="sm"
                                            disabled={!siteDsoSelection[site.id] || createSiteLinkMutation.isPending}
                                            onClick={() => {
                                              const val = siteDsoSelection[site.id];
                                              if (!val) return;
                                              const [connId, siteRef] = val.split('::');
                                              createSiteLinkMutation.mutate({
                                                siteId: site.id,
                                                dsoConnectionId: connId,
                                                dsoSiteRef: siteRef,
                                              });
                                            }}
                                            isLoading={createSiteLinkMutation.isPending}
                                          >
                                            Lier
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <div className="h-12 w-12 rounded-xl bg-muted/50 border border-border flex items-center justify-center mx-auto mb-3">
                                <MapPin className="h-6 w-6 opacity-50" />
                              </div>
                              <p className="text-sm font-medium">Aucun site lié</p>
                              <p className="text-xs mt-1">Cet acteur n&apos;a pas encore de sites associés</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
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

      {/* Liaison Details Dialog */}
      <Dialog open={!!detailsLinkId} onOpenChange={(open) => { if (!open) setDetailsLinkId(null); }}>
        <DialogContent className="max-w-lg w-full rounded-2xl shadow-xl border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Détails de la Liaison
            </DialogTitle>
            <DialogDescription>Informations complètes sur la liaison CPO ↔ DSO</DialogDescription>
          </DialogHeader>

          {(() => {
            const link = existingSiteLinks.find((l) => l.id === detailsLinkId);
            if (!link) return <p className="text-sm text-muted-foreground py-4 text-center">Liaison introuvable</p>;
            const site = allSites.find((s) => s.id === link.siteId);
            const dsoConn = dsoConnections.find((c) => c.id === link.dsoConnectionId);

            return (
              <div className="space-y-4">
                {/* CPO ↔ DSO cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Plug className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">CPO Lié</span>
                    </div>
                    <p className="text-base font-bold">{site?.name ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{site?.externalId ?? '—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {site?.address || "Pas d'adresse"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-4 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">DSO Lié</span>
                    </div>
                    <p className="text-base font-bold">
                      {dsoConn?.label || dsoConn?.baseUrl || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Ref: {link.dsoSiteRef}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dsoConn?.baseUrl ?? ''}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between px-1">
                  <Badge variant={link.enabled ? 'success' : 'warning'} className="gap-1">
                    {link.enabled ? <><CheckCircle className="h-3 w-3" /> Liaison Active</> : <><AlertCircle className="h-3 w-3" /> Liaison Inactive</>}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Créée le {new Date(link.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>

                {/* Energy & Tarif data */}
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                    Données Énergétiques
                  </p>
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
                    </div>
                  ) : detailsSnapshot ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-center transition-all hover:shadow-sm">
                        <Zap className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Énergie disponible</p>
                        <p className="text-xl font-bold text-green-700 dark:text-green-300">
                          {detailsSnapshot.energieKw?.toFixed(1) ?? 'N/A'} <span className="text-xs font-normal">kW</span>
                        </p>
                      </div>
                      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 text-center transition-all hover:shadow-sm">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Tarification</p>
                        <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                          {detailsSnapshot.tarif?.toFixed(4) ?? 'N/A'} <span className="text-xs font-normal">€/kWh</span>
                        </p>
                      </div>
                      <div className="rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-3 text-center transition-all hover:shadow-sm">
                        <p className="text-xs text-muted-foreground">Signal DSO</p>
                        <p className={`text-lg font-bold ${detailsSnapshot.signal === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {detailsSnapshot.signal === 1 ? '✓ Favorable' : detailsSnapshot.signal === 0 ? '✗ Défavorable' : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 p-3 text-center transition-all hover:shadow-sm">
                        <p className="text-xs text-muted-foreground">Congestion</p>
                        <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                          {detailsSnapshot.congestionLevel ?? 'N/A'} <span className="text-xs font-normal">%</span>
                        </p>
                      </div>
                      <div className="col-span-2 text-center text-xs text-muted-foreground pt-1">
                        Dernière synchro: {new Date(detailsSnapshot.timestamp).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Aucune donnée énergétique disponible</p>
                      <p className="text-xs mt-1">Synchronisez l&apos;énergie pour obtenir les données</p>
                    </div>
                  )}
                </div>

                {/* Link to full site page */}
                <div className="border-t border-border pt-3 flex justify-end">
                  <Link href={`/sites/${link.siteId}`}>
                    <Button size="sm" className="gap-1 transition-transform hover:scale-105">
                      <Zap className="h-4 w-4" />
                      Voir le site complet
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}