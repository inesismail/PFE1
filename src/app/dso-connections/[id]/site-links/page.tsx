// app/dso-connections/[id]/site-links/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsoApi, SiteLink, EnergySnapshot } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Plus, Zap, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function SiteLinksPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.id as string;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ siteId: '', dsoSiteRef: '' });

  const queryClient = useQueryClient();

  // Get DSO connection details
  const { data: connection } = useQuery({
    queryKey: ['dso-connections', connectionId],
    queryFn: async () => dsoApi.getConnectionById(connectionId),
    enabled: !!connectionId,
  });

  // Get DSO sites from backend proxy
  const {
    data: dsoSites = [],
    isLoading: loadingDsoSites,
    error: dsoSitesError,
  } = useQuery({
    queryKey: ['dso-sites', connectionId],
    queryFn: async () => {
      const result = await dsoApi.getDsoSites(connectionId);
      return result ?? [];
    },
    enabled: !!connectionId,
  });

  // Get site links for this connection
  const { data: siteLinks = [] } = useQuery({
    queryKey: ['dso-site-links', connectionId],
    queryFn: async () => (await dsoApi.getSiteLinks(connectionId)) || [],
    enabled: !!connectionId,
  });

  const getDsoSiteByRef = (dsoSiteRef: string) => dsoSites.find((s: any) => s.id === dsoSiteRef);

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
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erreur lors de la création'),
  });

  // Delete site link
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteSiteLink(id),
    onSuccess: () => {
      toast.success('Lien supprimé');
      queryClient.invalidateQueries({ queryKey: ['dso-site-links', connectionId] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erreur lors de la suppression'),
  });

  // Sync energy -> IMPORTANT: dsoApi.syncEnergy must return EnergySnapshot (not AxiosResponse)
  const syncMutation = useMutation({
    mutationFn: (siteLinkId: string) => dsoApi.syncEnergy(siteLinkId), // Promise<EnergySnapshot>
    onSuccess: (snapshot: EnergySnapshot) => {
      toast.success('Synchronisation réussie');
      queryClient.invalidateQueries({ queryKey: ['dso-site-links', connectionId] });

      toast.success(
        `Énergie: ${snapshot.energieKw}kW, Tarif: ${snapshot.tarif}€/kWh, Signal: ${snapshot.signal}`
      );
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erreur lors de la synchronisation'),
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
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div>
          <h1 className="text-3xl font-bold">Gestion des Liens de Sites</h1>
          {connection && <p className="text-gray-600 dark:text-gray-400">{connection.baseUrl}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Nouveau Lien de Site
            </button>
          </DialogTrigger>

          <DialogContent className="max-w-5xl">
            <div className="space-y-4">
              <div>
                <DialogTitle className="text-2xl">Lier un site</DialogTitle>
                <DialogDescription className="text-base mt-1">Associez un site CPO à un site DSO</DialogDescription>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-12 py-6">
                  {/* LEFT */}
                  <div className="space-y-5 border-r border-gray-200 dark:border-gray-700 pr-8">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          ID du Site CPO
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: site-001"
                          value={formData.siteId}
                          onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="space-y-5">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                          Référence DSO
                        </label>

                        {dsoSites.length > 0 ? (
                          <select
                            value={formData.dsoSiteRef}
                            onChange={(e) => setFormData({ ...formData, dsoSiteRef: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            required
                            disabled={loadingDsoSites}
                          >
                            <option value="">Sélectionner un site...</option>
                            {dsoSites.map((site: any) => (
                              <option key={site.id} value={site.id}>
                                {site.name} {site.city && `• ${site.city}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder={loadingDsoSites ? 'Chargement...' : "Saisir l'ID du site DSO"}
                            value={formData.dsoSiteRef}
                            onChange={(e) => setFormData({ ...formData, dsoSiteRef: e.target.value })}
                            required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-all"
                            disabled={loadingDsoSites}
                          />
                        )}

                        {dsoSitesError && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded text-xs text-red-700 dark:text-red-400">
                            {String(dsoSitesError)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? 'Création en cours...' : 'Créer le lien'}
                  </button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!siteLinks || siteLinks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Aucun lien de site. Cliquez sur "Nouveau Lien de Site" pour en ajouter un.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {siteLinks.map((link: SiteLink) => {
            const dsoSite = getDsoSiteByRef(link.dsoSiteRef);
            return (
              <div key={link.id} className="rounded-lg border p-4 hover:shadow-md transition-shadow dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{getSiteName(link.siteId)}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded dark:bg-blue-900/30 dark:text-blue-300">
                        CPO
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                      <p>
                        <span className="font-medium">Site DSO:</span> {dsoSite ? dsoSite.name : link.dsoSiteRef}
                      </p>
                      {dsoSite && (
                        <>
                          <p>
                            <span className="font-medium">Ville:</span> {dsoSite.city}
                          </p>
                          <p>
                            <span className="font-medium">Adresse:</span> {dsoSite.address}
                          </p>
                        </>
                      )}
                      <p>
                        <span className="font-medium">Statut:</span> {link.enabled ? '✓ Actif' : '✗ Inactif'}
                      </p>
                    </div>

                    {link.energySnapshots && link.energySnapshots.length > 0 && (
                      <div className="mt-3 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Dernier snapshot énergétique:</p>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
                          <p>Énergie: <span className="font-mono">{link.energySnapshots[0]?.energieKw}kW</span></p>
                          <p>Tarif: <span className="font-mono">{link.energySnapshots[0]?.tarif}€/kWh</span></p>
                          <p>Signal: <span className="font-mono">{link.energySnapshots[0]?.signal === 0 ? 'Vert' : 'Orange'}</span></p>
                          <p>Congestion: <span className="font-mono">{link.energySnapshots[0]?.congestionLevel || 'N/A'}%</span></p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => syncMutation.mutate(link.id)}
                      disabled={syncMutation.isPending}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Zap className="h-4 w-4" />
                      Synchro
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) deleteMutation.mutate(link.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
