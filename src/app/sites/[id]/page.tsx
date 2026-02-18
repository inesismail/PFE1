'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { sitesApi, dsoApi, LocalSite, SiteLink, EnergySnapshot, DsoConnection } from '@/lib/api';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft, Zap, TrendingUp, DollarSign, AlertCircle, Building2, Link2, MapPin } from 'lucide-react';
import { Header } from '@/components/layout';
import Link from 'next/link';

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.id as string;

  // ✅ Récupère les infos du site
  const { data: site, isLoading: siteLoading } = useQuery<LocalSite | null>({
    queryKey: ['site', siteId],
    queryFn: async () => (await sitesApi.getById(siteId)) as any,
    enabled: !!siteId,
  });

  // ✅ Récupère les liaisons DSO filtrées par siteId
  const { data: siteLinks = [], isLoading: linksLoading } = useQuery<SiteLink[]>({
    queryKey: ['site-links', siteId],
    queryFn: async () => {
      try {
        const links = await dsoApi.getSiteLinks();
        const arr = Array.isArray(links) ? (links as SiteLink[]) : [];
        return arr.filter((l) => l.siteId === siteId);
      } catch (error) {
        console.error('❌ Erreur récupération liaisons DSO:', error);
        return [];
      }
    },
    enabled: !!siteId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // ✅ Snapshots énergétiques (triés desc)
  const { data: energySnapshots = [] } = useQuery<EnergySnapshot[]>({
    queryKey: ['energy-snapshots', siteId, siteLinks.map((l) => l.id).join('|')],
    queryFn: async () => {
      if (!siteLinks.length) return [];
      try {
        const res = await Promise.all(
          siteLinks.map(async (link) => {
            try {
              const full = await dsoApi.getSiteLinkById(link.id);
              return full?.energySnapshots ?? [];
            } catch (e) {
              console.error(`Erreur snapshot pour lien ${link.id}:`, e);
              return [];
            }
          })
        );

        const flat = res.flat();
        flat.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return flat;
      } catch (error) {
        console.error('Erreur récupération snapshots énergétiques:', error);
        return [];
      }
    },
    enabled: siteLinks.length > 0,
  });

  // ✅ Connexions DSO
  const { data: dsoConnections = [] } = useQuery<DsoConnection[]>({
    queryKey: ['dso-connections'],
    queryFn: async () => (await dsoApi.getConnections()) || [],
  });



  const latestSnapshot = energySnapshots[0];

  const dsoConnectionsForSite = useMemo(() => {
    const ids = new Set(siteLinks.map((l) => l.dsoConnectionId));
    return dsoConnections.filter((c) => ids.has(c.id));
  }, [dsoConnections, siteLinks]);

  // Fetch energy & tariff per linked DSO site
  const [dsoMetrics, setDsoMetrics] = useState<Record<string, { energy: number | null; tariff: number | null; loading: boolean }>>({});

  useEffect(() => {
    if (!siteLinks.length) return;

    siteLinks.forEach(async (link) => {
      setDsoMetrics((prev) => ({ ...prev, [link.id]: { energy: null, tariff: null, loading: true } }));
      try {
        const [energyRes, tariffRes] = await Promise.all([
          fetch(`/api/dso?endpoint=energy&site_id=${link.dsoSiteRef}`),
          fetch(`/api/dso?endpoint=tariff&site_id=${link.dsoSiteRef}`),
        ]);

        let energy: number | null = null;
        let tariff: number | null = null;

        if (energyRes.ok) {
          const data = await energyRes.json();
          const hour = new Date().getHours();
          const entries: { hour: number; value: number }[] = data?.energy || [];
          const match = entries.find((e) => e.hour === hour) || entries[entries.length - 1];
          energy = match?.value ?? null;
        }

        if (tariffRes.ok) {
          const data = await tariffRes.json();
          const hour = new Date().getHours();
          const entries: { hour: number; price: number }[] = data?.tariffs || [];
          const match = entries.find((e) => e.hour === hour) || entries[entries.length - 1];
          tariff = match?.price ?? null;
        }

        setDsoMetrics((prev) => ({ ...prev, [link.id]: { energy, tariff, loading: false } }));
      } catch {
        setDsoMetrics((prev) => ({ ...prev, [link.id]: { energy: null, tariff: null, loading: false } }));
      }
    });
  }, [siteLinks]);

  if (siteLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header title="Site" description="Chargement..." />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-muted-foreground">Chargement des informations du site...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header title="Site" description="Détails" />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-8 text-center text-red-600">Site non trouvé</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ✅ FIX: Header nécessite title */}
      <Header title={site.name} description="Détails du site" />

      <div className="container mx-auto px-4 py-8">
        {/* Back */}
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Top */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{site.name}</h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                ID: {site.externalId}
              </span>

              {/* ✅ FIX: edfRegion (pas region) */}
              {site.edfRegion?.name && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {site.edfRegion.name}
                </span>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={
              site.isActive
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-700 border-gray-200'
            }
          >
            {site.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* CPO */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Informations CPO
              </CardTitle>
              <CardDescription>Caractéristiques du site</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-muted-foreground mb-1">Capacité Maximale</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {site.maxCapacityKw ?? 'N/A'} <span className="text-sm">kW</span>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-muted-foreground mb-1">Capacité Réduite</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {site.reducedLimitKw ?? 'N/A'} <span className="text-sm">kW</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-muted-foreground mb-1">Limite Actuelle</div>
                  <div className="text-2xl font-bold text-green-600">
                    {site.currentLimitKw ?? 'N/A'} <span className="text-sm">kW</span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-muted-foreground mb-1">Signal EDF</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {site.lastSignalValue === 1
                      ? '✓ Favorable'
                      : site.lastSignalValue === 0
                      ? '✗ Défavorable'
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dernière limite fixée</span>
                  <span className="font-medium">
                    {site.lastLimitSetAt ? new Date(site.lastLimitSetAt).toLocaleString('fr-FR') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Dernier signal reçu</span>
                  <span className="font-medium">
                    {site.lastSignalAt ? new Date(site.lastSignalAt).toLocaleString('fr-FR') : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-indigo-600" />
                Liaisons DSO
              </CardTitle>
              <CardDescription>
                {linksLoading ? 'Chargement...' : `${siteLinks.length} lien${siteLinks.length !== 1 ? 's' : ''}`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {siteLinks.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-orange-500" />
                  <p className="text-sm text-muted-foreground mb-4">Aucune liaison DSO créée pour ce site</p>
                  <Link href="/connections">
                    <Button size="sm" variant="outline">
                      <Link2 className="w-4 h-4 mr-2" />
                      Créer une liaison
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {siteLinks.map((link) => {
                    const dsoConn = dsoConnections.find((c) => c.id === link.dsoConnectionId);

                    return (
                      <div key={link.id} className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="font-medium text-sm text-indigo-900">
                          {/* ✅ FIX: pas de name → baseUrl */}
                          {dsoConn?.baseUrl || 'DSO Inconnu'}
                        </div>
                        <div className="text-xs text-indigo-700 mt-1">Site DSO: {link.dsoSiteRef}</div>
                        <div className="text-xs text-muted-foreground mt-1">{link.enabled ? '✓ Actif' : '✗ Inactif'}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Snapshot */}
        {latestSnapshot && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Données Énergétiques (Dernier Snapshot)
              </CardTitle>
              <CardDescription>
                Données synchronisées: {new Date(latestSnapshot.timestamp).toLocaleString('fr-FR')}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Consommation</span>
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {latestSnapshot.energieKw ?? 'N/A'} <span className="text-sm">kW</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Tarif</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">
                    {latestSnapshot.tarif ?? 'N/A'} <span className="text-sm">€/kWh</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Signal DSO</span>
                    <AlertCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {latestSnapshot.signal === 1 ? '✓' : latestSnapshot.signal === 0 ? '✗' : '?'}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {latestSnapshot.signal === 1 ? 'Favorable' : latestSnapshot.signal === 0 ? 'Défavorable' : 'Inconnu'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Congestion</span>
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">
                    {latestSnapshot.congestionLevel ?? 'N/A'} <span className="text-sm">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connexions DSO */}
        {dsoConnectionsForSite.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Connexions DSO Liées
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {dsoConnectionsForSite.map((conn) => {
                  const linkedSites = siteLinks.filter((l) => l.dsoConnectionId === conn.id);
                  const isActive = (conn as any).isActive;

                  return (
                    <div key={conn.id} className="border rounded-xl p-5 bg-card border-border">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isActive ? 'bg-amber-500/15' : 'bg-muted'}`}>
                            <Zap className={`h-5 w-5 ${isActive ? 'text-amber-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-foreground">
                              {conn.label || 'Connexion DSO'}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <Link2 className="h-3.5 w-3.5" />
                              {conn.baseUrl}
                            </p>
                          </div>
                        </div>

                        <Badge variant={isActive ? 'success' : 'warning'}>
                          {isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dernière sync</span>
                          <p className="font-medium text-foreground mt-0.5">
                            {conn.lastSyncAt ? new Date(conn.lastSyncAt).toLocaleString('fr-FR') : 'Jamais'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Créée le</span>
                          <p className="font-medium text-foreground mt-0.5">
                            {conn.createdAt ? new Date(conn.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sites liés</span>
                          <p className="font-medium text-foreground mt-0.5">
                            {linkedSites.length} référence(s)
                          </p>
                        </div>
                      </div>

                      {linkedSites.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border space-y-3">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Sites DSO liés — Énergie & Tarifs</span>
                          {linkedSites.map((link) => {
                            const m = dsoMetrics[link.id];
                            return (
                              <div key={link.id} className="rounded-lg border border-border bg-muted/30 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <Badge variant="outline" className="text-xs">{link.dsoSiteRef}</Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-muted-foreground">Énergie</span>
                                      <Zap className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                      {m?.loading ? '...' : m?.energy != null ? m.energy.toFixed(1) : 'N/A'}
                                      <span className="text-xs font-normal text-muted-foreground ml-1">kW</span>
                                    </div>
                                  </div>
                                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs text-muted-foreground">Tarif</span>
                                      <DollarSign className="w-4 h-4 text-blue-500" />
                                    </div>
                                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                      {m?.loading ? '...' : m?.tariff != null ? m.tariff.toFixed(4) : 'N/A'}
                                      <span className="text-xs font-normal text-muted-foreground ml-1">€/kWh</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
