// app/dso-connections/[id]/site-links/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsoApi, SiteLink, EnergySnapshot } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Plus, Zap, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function SiteLinksPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = typeof params?.id === 'string' ? params.id : '';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ siteId: '', dsoSiteRef: '' });

  const queryClient = useQueryClient();

  // (optionnel) si jamais l'URL n'a pas d'id
  if (!connectionId) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl p-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          <div className="mt-6 rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              ID de connexion manquant dans l’URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get DSO connection details
  const { data: connection } = useQuery({
    queryKey: ['dso-connections', connectionId],
    queryFn: async () => dsoApi.getConnectionById(connectionId),
    enabled: !!connectionId,
  });

  // Get DSO sites from backend proxy
  const {
    data: dsoSitesRaw,
    isLoading: loadingDsoSites,
    error: dsoSitesError,
  } = useQuery({
    queryKey: ['dso-sites', connectionId],
    queryFn: () => dsoApi.getDsoSites(connectionId),
    enabled: !!connectionId,
  });

  const dsoSites = (dsoSitesRaw as any)?.sites ?? [];
  console.log('DSO SITES RAW =', dsoSites);

  // Get site links for this connection
  const { data: siteLinks = [] } = useQuery({
    queryKey: ['dso-site-links', connectionId],
    queryFn: async () => (await dsoApi.getSiteLinks(connectionId)) || [],
    enabled: !!connectionId,
  });

  const getDsoSiteByRef = (dsoSiteRef: string) =>
    dsoSites.find((s: any) => s.id === dsoSiteRef);

  // Create site link
  const createMutation = useMutation({
    mutationFn: (data: { siteId: string; dsoConnectionId: string; dsoSiteRef: string }) =>
      dsoApi.createSiteLink(data),
    onSuccess: () => {
      toast.success('Site lié avec succès');
      queryClient.invalidateQueries({ queryKey: ['dso-site-links', connectionId] });
      setFormData({ siteId: '', dsoSiteRef: '' });
      setIsFormOpen(false);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Erreur lors de la création'),
  });

  // Delete site link
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteSiteLink(id),
    onSuccess: () => {
      toast.success('Lien supprimé');
      queryClient.invalidateQueries({ queryKey: ['dso-site-links', connectionId] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Erreur lors de la suppression'),
  });

  // Sync energy
  const syncMutation = useMutation({
    mutationFn: (siteLinkId: string) => dsoApi.syncEnergy(siteLinkId),
    onSuccess: (snapshot: EnergySnapshot) => {
      toast.success('Synchronisation réussie');
      queryClient.invalidateQueries({ queryKey: ['dso-site-links', connectionId] });

      toast.success(
        `Énergie: ${snapshot.energieKw}kW, Tarif: ${snapshot.tarif}€/kWh, Signal: ${snapshot.signal}`
      );
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || 'Erreur lors de la synchronisation'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siteId || !formData.dsoSiteRef) {
      toast.error('Tous les champs sont requis');
      return;
    }
    createMutation.mutate({
      siteId: formData.siteId,
      dsoConnectionId: connectionId,
      dsoSiteRef: formData.dsoSiteRef,
    });
  };

  const getSiteName = (siteId: string) => siteId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                Gestion des Liens de Sites
              </h1>
              {connection && (
                <p className="truncate text-sm text-muted-foreground">{connection.baseUrl}</p>
              )}
            </div>
          </div>

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition">
                <Plus className="h-4 w-4" />
                Nouveau lien
              </button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl">
              <div className="space-y-5">
                <div>
                  <DialogTitle className="text-2xl">Lier un site</DialogTitle>
                  <DialogDescription className="mt-1 text-base">
                    Associez un site CPO à un site DSO
                  </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    {/* CPO */}
                    <div className="rounded-xl border bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          CPO
                        </span>
                        <p className="text-sm font-medium text-foreground">
                          Identifiant du site
                        </p>
                      </div>

                      <label className="block text-xs font-medium text-muted-foreground">
                        ID du Site CPO
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: site-001"
                        value={formData.siteId}
                        onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                        className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                        required
                      />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Utilise l’ID interne du site côté CPO.
                      </p>
                    </div>

                    {/* DSO */}
                    <div className="rounded-xl border bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          DSO
                        </span>
                        <p className="text-sm font-medium text-foreground">Référence du site</p>
                      </div>

                      <label className="block text-xs font-medium text-muted-foreground">
                        Référence DSO
                      </label>

                      {dsoSites.length > 0 ? (
                        <select
                          value={formData.dsoSiteRef}
                          onChange={(e) =>
                            setFormData({ ...formData, dsoSiteRef: e.target.value })
                          }
                          className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                          required
                          disabled={loadingDsoSites}
                        >
                          <option value="">Sélectionner un site…</option>
                          {dsoSites.map((site: any) => (
                            <option key={site.id} value={site.id}>
                              {site.name} {site.city && `• ${site.city}`}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={loadingDsoSites ? 'Chargement…' : "Saisir l'ID du site DSO"}
                          value={formData.dsoSiteRef}
                          onChange={(e) =>
                            setFormData({ ...formData, dsoSiteRef: e.target.value })
                          }
                          required
                          className="mt-2 w-full rounded-lg border bg-background px-4 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition"
                          disabled={loadingDsoSites}
                        />
                      )}

                      {dsoSitesError && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                          {String(dsoSitesError)}
                        </div>
                      )}

                      <p className="mt-2 text-xs text-muted-foreground">
                        Choisis un site DSO existant ou saisis sa référence.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="inline-flex items-center justify-center rounded-lg border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createMutation.isPending ? 'Création en cours…' : 'Créer le lien'}
                    </button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Empty state */}
        {!siteLinks || siteLinks.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted">
              <Zap className="h-5 w-5 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold">Aucun lien pour le moment</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crée ton premier lien CPO ⇄ DSO pour commencer la synchronisation.
            </p>
            <div className="mt-5">
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 transition"
              >
                <Plus className="h-4 w-4" />
                Nouveau lien
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {siteLinks.map((link: SiteLink) => {
              const dsoSite = getDsoSiteByRef(link.dsoSiteRef);
              const snapshot = link.energySnapshots?.[0];

              return (
                <div
                  key={link.id}
                  className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    {/* Left */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold">
                          {getSiteName(link.siteId)}
                        </h3>

                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          CPO
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            link.enabled
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                        >
                          {link.enabled ? 'Actif' : 'Inactif'}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 rounded-xl border bg-background p-4">
                        <p className="text-sm text-foreground">
                          <span className="text-muted-foreground">Site DSO :</span>{' '}
                          <span className="font-medium">
                            {dsoSite ? dsoSite.name : link.dsoSiteRef}
                          </span>
                        </p>

                        {dsoSite && (
                          <div className="grid gap-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium text-foreground/80">Ville :</span>{' '}
                              {dsoSite.city}
                            </p>
                            <p className="truncate">
                              <span className="font-medium text-foreground/80">Adresse :</span>{' '}
                              {dsoSite.address}
                            </p>
                          </div>
                        )}
                      </div>

                      {snapshot && (
                        <div className="mt-3 rounded-xl border bg-blue-50 p-4 dark:bg-blue-950/30">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                              Dernier snapshot énergétique
                            </p>
                            <span className="text-xs text-blue-700/80 dark:text-blue-300/80">
                              (dernier reçu)
                            </span>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-background/70 p-3">
                              <p className="text-xs text-muted-foreground">Énergie</p>
                              <p className="font-mono font-semibold">
                                {snapshot.energieKw}kW
                              </p>
                            </div>

                            <div className="rounded-lg bg-background/70 p-3">
                              <p className="text-xs text-muted-foreground">Tarif</p>
                              <p className="font-mono font-semibold">
                                {snapshot.tarif}€/kWh
                              </p>
                            </div>

                            <div className="rounded-lg bg-background/70 p-3">
                              <p className="text-xs text-muted-foreground">Signal</p>
                              <p className="font-mono font-semibold">
                                {snapshot.signal === 0 ? 'Vert' : 'Orange'}
                              </p>
                            </div>

                            <div className="rounded-lg bg-background/70 p-3">
                              <p className="text-xs text-muted-foreground">Congestion</p>
                              <p className="font-mono font-semibold">
                                {snapshot.congestionLevel || 'N/A'}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-2 md:flex-col md:items-end">
                      <button
                        onClick={() => syncMutation.mutate(link.id)}
                        disabled={syncMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Zap className="h-4 w-4" />
                        Synchro
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?'))
                            deleteMutation.mutate(link.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="md:hidden">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}