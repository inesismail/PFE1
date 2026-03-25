'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsoApi, type SiteLink, type DsoConnection, type EnergySnapshot } from '@/lib/api';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Zap,
  RefreshCw,
  Shield,
  ShieldOff,
  Trash2,
  Search,
  Link2,
  Activity,
  ChevronDown,
  ChevronRight,
  Power,
  PowerOff,
  TrendingUp,
  Gauge,
  DollarSign,
  Radio,
  Loader2,
  Unplug,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Signal helpers ───
const SIGNAL_CONFIG = {
  0: { label: 'Complet', color: 'success' as const, bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  1: { label: 'Réduit', color: 'warning' as const, bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  2: { label: 'Bloqué', color: 'error' as const, bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
} as const;

function getSignal(signal: number) {
  return SIGNAL_CONFIG[signal as keyof typeof SIGNAL_CONFIG] ?? SIGNAL_CONFIG[2];
}

// ─── Stat Card ───
function StatCard({ icon: Icon, label, value, subtitle, iconBg, iconColor }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-2.5 ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Snapshot Metric ───
function SnapshotMetric({ icon: Icon, label, value, unit, colorClass }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  colorClass?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={`rounded-lg p-1.5 ${colorClass ?? 'bg-muted'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-0.5">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function SiteLinksPage() {
  const { id: connectionId } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSiteId, setNewSiteId] = useState('');
  const [newDsoSiteRef, setNewDsoSiteRef] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Queries ───
  const { data: connection } = useQuery({
    queryKey: ['dso-connection', connectionId],
    queryFn: () => dsoApi.getConnectionById(connectionId),
    enabled: !!connectionId,
  });

  const { data: siteLinks = [], isLoading, refetch } = useQuery({
    queryKey: ['site-links', connectionId],
    queryFn: () => dsoApi.getSiteLinks(connectionId),
    enabled: !!connectionId,
  });

  // ─── Mutations ───
  const createMutation = useMutation({
    mutationFn: () =>
      dsoApi.createSiteLink({ siteId: newSiteId, dsoConnectionId: connectionId, dsoSiteRef: newDsoSiteRef }),
    onSuccess: () => {
      toast.success('Lien créé avec succès');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
      setIsCreateOpen(false);
      setNewSiteId('');
      setNewDsoSiteRef('');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la création'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteSiteLink(id),
    onSuccess: () => {
      toast.success('Lien supprimé');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
      setDeleteConfirm(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Erreur lors de la suppression'),
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => dsoApi.syncEnergy(id),
    onSuccess: () => {
      toast.success('Synchronisation réussie');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
    },
    onError: () => toast.error('Erreur lors de la synchronisation'),
  });

  const syncDsoSiteMutation = useMutation({
    mutationFn: (dsoSiteRef: string) => dsoApi.syncEnergyForDsoSite(connectionId, dsoSiteRef),
    onSuccess: () => {
      toast.success('Synchronisation DSO distribuée');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
    },
    onError: () => toast.error('Erreur lors de la synchronisation DSO'),
  });

  const toggleOptimMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      dsoApi.toggleOptimization(id, enabled),
    onSuccess: () => {
      toast.success('Optimisation mise à jour');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      dsoApi.updateSiteLink(id, { enabled }),
    onSuccess: () => {
      toast.success('Statut du lien mis à jour');
      queryClient.invalidateQueries({ queryKey: ['site-links', connectionId] });
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  // ─── Computed ───
  const grouped = useMemo(() => {
    const map = new Map<string, SiteLink[]>();
    for (const link of siteLinks) {
      const ref = link.dsoSiteRef || 'inconnu';
      if (!map.has(ref)) map.set(ref, []);
      map.get(ref)!.push(link);
    }
    return map;
  }, [siteLinks]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result = new Map<string, SiteLink[]>();
    for (const [ref, links] of grouped) {
      const filtered = links.filter(
        (l) => l.siteId.toLowerCase().includes(q) || ref.toLowerCase().includes(q)
      );
      if (filtered.length > 0) result.set(ref, filtered);
    }
    return result;
  }, [grouped, search]);

  const stats = useMemo(() => {
    const total = siteLinks.length;
    const active = siteLinks.filter((l) => l.enabled).length;
    const optimized = siteLinks.filter((l) => l.optimizationEnabled).length;
    const dsoSites = new Set(siteLinks.map((l) => l.dsoSiteRef)).size;
    return { total, active, optimized, dsoSites };
  }, [siteLinks]);

  const toggleGroup = (ref: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(grouped.keys()));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  const getLatestSnapshot = (link: SiteLink): EnergySnapshot | null => {
    if (!link.energySnapshots || link.energySnapshots.length === 0) return null;
    return link.energySnapshots.reduce((latest, s) =>
      new Date(s.timestamp) > new Date(latest.timestamp) ? s : latest
    );
  };

  // ─── Loading ───
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Render ───
  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/connections?tab=dso')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Gestion des Liens de Sites</h1>
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {connection?.label || connection?.baseUrl || 'Connexion DSO'}
            {connection?.lastSyncAt && (
              <span className="ml-2 text-xs">
                · Dernière sync : {new Date(connection.lastSyncAt).toLocaleString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Nouveau Lien
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un lien de site</DialogTitle>
              <DialogDescription>Associer un site CPO à un site DSO pour la gestion d&apos;énergie.</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newSiteId.trim() || !newDsoSiteRef.trim()) {
                  toast.error('Tous les champs sont requis');
                  return;
                }
                createMutation.mutate();
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">ID du site CPO</label>
                <Input
                  placeholder="ex: site-abc-123"
                  value={newSiteId}
                  onChange={(e) => setNewSiteId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Référence site DSO</label>
                <Input
                  placeholder="ex: site-12345"
                  value={newDsoSiteRef}
                  onChange={(e) => setNewDsoSiteRef(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Créer le lien
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Link2} label="Liens totaux" value={stats.total} subtitle={`${stats.dsoSites} sites DSO`} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatCard icon={Power} label="Liens actifs" value={stats.active} subtitle={`sur ${stats.total}`} iconBg="bg-emerald-500/10" iconColor="text-emerald-500" />
        <StatCard icon={Shield} label="Optimisation active" value={stats.optimized} subtitle={`sur ${stats.total}`} iconBg="bg-violet-500/10" iconColor="text-violet-500" />
        <StatCard icon={Activity} label="Sites DSO" value={stats.dsoSites} subtitle="groupes" iconBg="bg-amber-500/10" iconColor="text-amber-500" />
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par site CPO ou DSO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={expandAll}>
            <ChevronDown className="h-4 w-4" />
            Tout ouvrir
          </Button>
          <Button variant="ghost" size="sm" onClick={collapseAll}>
            <ChevronRight className="h-4 w-4" />
            Tout fermer
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {siteLinks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Unplug className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Aucun lien configuré</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Créez un lien pour associer vos sites CPO aux sites DSO et activer la gestion d&apos;énergie.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Créer un premier lien
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── No Search Results ── */}
      {siteLinks.length > 0 && filteredGroups.size === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold mb-1">Aucun résultat</h3>
            <p className="text-sm text-muted-foreground">
              Aucun lien ne correspond à &quot;{search}&quot;
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── DSO Site Groups ── */}
      <div className="space-y-4">
        {Array.from(filteredGroups.entries()).map(([dsoSiteRef, links]) => {
          const isExpanded = expandedGroups.has(dsoSiteRef);
          const activeLinks = links.filter((l) => l.enabled).length;

          return (
            <Card key={dsoSiteRef} className="overflow-hidden">
              {/* Group Header */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleGroup(dsoSiteRef)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(dsoSiteRef); } }}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-muted/50 transition-colors text-left cursor-pointer select-none"
              >
                <div className="shrink-0 text-muted-foreground">
                  {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Radio className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">{dsoSiteRef}</span>
                    <Badge variant="info" className="text-[11px]">
                      {links.length} lien{links.length > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant={activeLinks === links.length ? 'success' : 'warning'} className="text-[11px]">
                      {activeLinks} actif{activeLinks > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    syncDsoSiteMutation.mutate(dsoSiteRef);
                  }}
                  disabled={syncDsoSiteMutation.isPending}
                  className="shrink-0"
                >
                  {syncDsoSiteMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  Sync & Distribuer
                </Button>
              </div>

              {/* Group Content */}
              {isExpanded && (
                <div className="border-t border-border/50 divide-y divide-border/30">
                  {links.map((link) => {
                    const snapshot = getLatestSnapshot(link);
                    const signal = snapshot ? getSignal(snapshot.signal) : null;

                    return (
                      <div
                        key={link.id}
                        className={`px-6 py-4 transition-colors ${!link.enabled ? 'opacity-60 bg-muted/30' : 'hover:bg-muted/20'}`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Left: Link info */}
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                              <span className="font-medium text-sm truncate">CPO: {link.siteId}</span>
                              <Badge variant={link.enabled ? 'success' : 'outline'} className="text-[11px]">
                                {link.enabled ? 'Actif' : 'Inactif'}
                              </Badge>
                              {link.optimizationEnabled && (
                                <Badge variant="default" className="text-[11px]">
                                  <Shield className="h-3 w-3" />
                                  Optimisé
                                </Badge>
                              )}
                              {signal && (
                                <Badge variant={signal.color} className="text-[11px]">
                                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${signal.dot}`} />
                                  {signal.label}
                                </Badge>
                              )}
                            </div>

                            {/* Snapshot Metrics */}
                            {snapshot ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-muted/40 border border-border/30">
                                <SnapshotMetric
                                  icon={TrendingUp}
                                  label="Énergie"
                                  value={snapshot.energieKw.toFixed(1)}
                                  unit="kW"
                                  colorClass="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                />
                                <SnapshotMetric
                                  icon={DollarSign}
                                  label="Tarif"
                                  value={snapshot.tarif.toFixed(3)}
                                  unit="€/kWh"
                                  colorClass="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                />
                                <SnapshotMetric
                                  icon={Gauge}
                                  label="Congestion"
                                  value={snapshot.congestionLevel != null ? `${snapshot.congestionLevel.toFixed(0)}` : '—'}
                                  unit={snapshot.congestionLevel != null ? '%' : undefined}
                                  colorClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                />
                                <SnapshotMetric
                                  icon={Radio}
                                  label="Signal"
                                  value={signal?.label ?? '—'}
                                  colorClass={`${signal?.bg ?? 'bg-muted'} ${signal?.text ?? ''}`}
                                />
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic pl-6">
                                Aucun snapshot — synchronisez pour obtenir les données énergie.
                              </p>
                            )}
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-1.5 shrink-0 lg:pt-0.5">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title={link.enabled ? 'Désactiver' : 'Activer'}
                              onClick={() => toggleEnabledMutation.mutate({ id: link.id, enabled: !link.enabled })}
                            >
                              {link.enabled ? <Power className="h-3.5 w-3.5 text-emerald-500" /> : <PowerOff className="h-3.5 w-3.5 text-muted-foreground" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title={link.optimizationEnabled ? 'Désactiver optimisation' : 'Activer optimisation'}
                              onClick={() => toggleOptimMutation.mutate({ id: link.id, enabled: !link.optimizationEnabled })}
                            >
                              {link.optimizationEnabled ? (
                                <Shield className="h-3.5 w-3.5 text-violet-500" />
                              ) : (
                                <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="Synchroniser"
                              onClick={() => syncMutation.mutate(link.id)}
                              disabled={syncMutation.isPending}
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                            </Button>

                            {/* Delete with confirmation */}
                            {deleteConfirm === link.id ? (
                              <div className="flex items-center gap-1 ml-1">
                                <Button
                                  variant="destructive"
                                  size="xs"
                                  onClick={() => deleteMutation.mutate(link.id)}
                                  isLoading={deleteMutation.isPending}
                                >
                                  Confirmer
                                </Button>
                                <Button variant="ghost" size="xs" onClick={() => setDeleteConfirm(null)}>
                                  Annuler
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                title="Supprimer"
                                onClick={() => setDeleteConfirm(link.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
