'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { sitesApi, dsoApi, LocalSite, SiteLink, EnergySnapshot, DsoConnection } from '@/lib/api';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { ArrowLeft, Zap, TrendingUp, DollarSign, AlertCircle, Building2, Link2, MapPin } from 'lucide-react';
import { Header } from '@/components/layout';
import Link from 'next/link';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart,
} from 'recharts';

// ─── JWT ─────────────────────────────────────────────────────────────────────
function getJwt(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('flexee_access_token') ?? null;
}

function fetchWithAuth(url: string): Promise<Response> {
  const jwt = getJwt();
  return fetch(url, {
    headers: {
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    cache: 'no-store',
  });
}

// ─── Types données horaires DSO ───────────────────────────────────────────────
interface HourlyEnergyPoint {
  hour: number;
  value: number;
}
interface HourlyTariffPoint {
  hour: number;
  price: number;
}
interface HourlyDsoData {
  energy: HourlyEnergyPoint[];
  tariffs: HourlyTariffPoint[];
}

// ─── Tooltip personnalisé ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 mb-1">🕒 {label}</p>
      <p className="text-indigo-700 font-bold text-base">
        {val == null ? 'N/A' : `${typeof val === 'number' ? val.toFixed(unit === '€/kWh' ? 4 : 2) : val} ${unit ?? ''}`}
      </p>
    </div>
  );
}

function SignalTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-semibold text-gray-700 mb-1">🕒 {label}</p>
      <p className={`font-bold text-base ${val === 1 ? 'text-green-600' : 'text-red-600'}`}>
        {val === 1 ? '✓ Favorable' : val === 0 ? '✗ Défavorable' : 'N/A'}
      </p>
    </div>
  );
}

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params?.id as string;

  const { data: site, isLoading: siteLoading } = useQuery<LocalSite | null>({
    queryKey: ['site', siteId],
    queryFn: async () => (await sitesApi.getById(siteId)) as any,
    enabled: !!siteId,
  });

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

  const { data: dsoConnections = [] } = useQuery<DsoConnection[]>({
    queryKey: ['dso-connections'],
    queryFn: async () => (await dsoApi.getConnections()) || [],
  });

  const latestSnapshot = energySnapshots[0];

  // ─── Données horaires DSO (courbes 24h) ───────────────────────────────────
  const [hourlyDsoData, setHourlyDsoData] = useState<HourlyDsoData | null>(null);
  const [hourlyLoading, setHourlyLoading] = useState(false);
  const currentHour = new Date().getHours();

  useEffect(() => {
    if (!siteLinks.length) return;
    const link = siteLinks[0];
    let cancelled = false;

    const fetchHourly = async () => {
      setHourlyLoading(true);
      try {
        const [energyRes, tariffRes] = await Promise.all([
          fetchWithAuth(
            `/api/dso?endpoint=energy&site_id=${link.dsoSiteRef}&connection_id=${link.dsoConnectionId}`
          ),
          fetchWithAuth(
            `/api/dso?endpoint=tariff&site_id=${link.dsoSiteRef}&connection_id=${link.dsoConnectionId}`
          ),
        ]);

        const energyData = energyRes.ok ? await energyRes.json() : null;
        const tariffData = tariffRes.ok ? await tariffRes.json() : null;

        if (!cancelled) {
          setHourlyDsoData({
            energy: energyData?.energy ?? [],
            tariffs: tariffData?.tariffs ?? [],
          });
        }
      } catch (e) {
        console.error('Erreur fetch hourly DSO:', e);
      } finally {
        if (!cancelled) setHourlyLoading(false);
      }
    };

    fetchHourly();
    return () => { cancelled = true; };
  }, [siteLinks]);

  // ─── Construction des séries de graphiques ────────────────────────────────

  // Courbe énergie 24h depuis DSO API
  const energyCurveData = useMemo(() => {
    if (!hourlyDsoData?.energy?.length) return [];
    return hourlyDsoData.energy.map((p) => ({
      label: `${String(p.hour).padStart(2, '0')}:00`,
      value: p.value,
      isCurrent: p.hour === currentHour,
    }));
  }, [hourlyDsoData, currentHour]);

  // Courbe tarif 24h depuis DSO API
  const tariffCurveData = useMemo(() => {
    if (!hourlyDsoData?.tariffs?.length) return [];
    return hourlyDsoData.tariffs.map((p) => ({
      label: `${String(p.hour).padStart(2, '0')}:00`,
      value: p.price,
      isCurrent: p.hour === currentHour,
    }));
  }, [hourlyDsoData, currentHour]);

  // Courbe signal depuis snapshots historiques
  const signalCurveData = useMemo(() => {
    if (!energySnapshots?.length) return [];
    return [...energySnapshots]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((s) => ({
        label: new Date(s.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        value: typeof s.signal === 'number' ? s.signal : null,
      }));
  }, [energySnapshots]);

  // Courbe congestion depuis snapshots historiques
  const congestionCurveData = useMemo(() => {
    if (!energySnapshots?.length) return [];
    return [...energySnapshots]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((s) => ({
        label: new Date(s.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
        value: s.congestionLevel ?? null,
      }));
  }, [energySnapshots]);

  // Valeurs actuelles depuis les données horaires
  const currentEnergyEntry = hourlyDsoData?.energy?.find(p => p.hour === currentHour)
    ?? hourlyDsoData?.energy?.[hourlyDsoData.energy.length - 1];
  const currentTariffEntry = hourlyDsoData?.tariffs?.find(p => p.hour === currentHour)
    ?? hourlyDsoData?.tariffs?.[hourlyDsoData.tariffs.length - 1];

  const dsoConnectionsForSite = useMemo(() => {
    const ids = new Set(siteLinks.map((l) => l.dsoConnectionId));
    return dsoConnections.filter((c) => ids.has(c.id));
  }, [dsoConnections, siteLinks]);

  // ─── Composant ChartCard générique ───────────────────────────────────────
  function ChartCard({
    title,
    description,
    data,
    dataKey = 'value',
    unit,
    color,
    gradientFrom,
    gradientTo,
    isStep = false,
    isSignal = false,
    loading = false,
    currentHourLabel,
  }: {
    title: string;
    description?: string;
    data: any[];
    dataKey?: string;
    unit?: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
    isStep?: boolean;
    isSignal?: boolean;
    loading?: boolean;
    currentHourLabel?: string;
  }) {
    const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`;
    return (
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-3" style={{ background: `linear-gradient(135deg, ${gradientFrom}22, ${gradientTo}11)` }}>
          <CardTitle className="flex items-center justify-between">
            <span className="text-base font-bold text-gray-800">{title}</span>
            {unit ? (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
                style={{ background: color }}
              >
                {unit}
              </span>
            ) : null}
          </CardTitle>
          {description ? <CardDescription className="text-xs text-gray-500 mt-0.5">{description}</CardDescription> : null}
        </CardHeader>
        <CardContent className="h-[260px] pt-4 px-2">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: color }} />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 10 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  minTickGap={isSignal ? 30 : 20}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  domain={isSignal ? [-0.05, 1.15] : ['auto', 'auto']}
                  ticks={isSignal ? [0, 1] : undefined}
                />
                {currentHourLabel && (
                  <ReferenceLine
                    x={currentHourLabel}
                    stroke={color}
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{ value: 'Maintenant', position: 'insideTopRight', fill: color, fontSize: 10 }}
                  />
                )}
                {isSignal ? (
                  <Tooltip content={<SignalTooltip />} />
                ) : (
                  <Tooltip content={<CustomTooltip unit={unit} />} />
                )}
                <Area
                  type={isStep ? 'stepAfter' : 'monotone'}
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#${gradientId})`}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (payload.isCurrent) {
                      return (
                        <circle key={cx} cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
                      );
                    }
                    return <circle key={cx} cx={cx} cy={cy} r={0} />;
                  }}
                  activeDot={{ r: 5, fill: color, stroke: 'white', strokeWidth: 2 }}
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  }

  // ─── Loading / Not found ──────────────────────────────────────────────────
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

  const currentHourLabel = `${String(currentHour).padStart(2, '0')}:00`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header title={site.name} description="Détails du site" />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{site.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                ID: {site.externalId}
              </span>
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

        {/* Grid CPO + DSO Links */}
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

          {/* DSO Links */}
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
                          {dsoConn?.baseUrl || 'DSO Inconnu'}
                        </div>
                        <div className="text-xs text-indigo-700 mt-1">Site DSO: {link.dsoSiteRef}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {link.enabled ? '✓ Actif' : '✗ Inactif'}
                        </div>
                        {hourlyLoading ? (
                          <div className="flex gap-3 mt-2 pt-2 border-t border-indigo-200">
                            <span className="text-xs text-indigo-400">⚡ Chargement...</span>
                          </div>
                        ) : currentEnergyEntry || currentTariffEntry ? (
                          <div className="flex gap-3 mt-2 pt-2 border-t border-indigo-200">
                            {currentEnergyEntry && (
                              <span className="text-xs text-indigo-800">
                                ⚡ {currentEnergyEntry.value.toFixed(1)} kW
                              </span>
                            )}
                            {currentTariffEntry && (
                              <span className="text-xs text-indigo-800">
                                💶 {currentTariffEntry.price.toFixed(4)} €/kWh
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dernier Snapshot */}
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
                    {latestSnapshot.signal === 1
                      ? 'Favorable'
                      : latestSnapshot.signal === 0
                      ? 'Défavorable'
                      : 'Inconnu'}
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

        {/* ── Graphiques DSO 24h ─────────────────────────────────────────────── */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            Courbes DSO — Journée en cours
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Données horaires récupérées en temps réel depuis le DSO · Ligne pointillée = heure actuelle
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Énergie 24h */}
          <ChartCard
            title="Énergie disponible"
            description="Consommation (kW) heure par heure — journée en cours"
            data={energyCurveData}
            dataKey="value"
            unit="kW"
            color="#6366f1"
            gradientFrom="#6366f1"
            gradientTo="#818cf8"
            loading={hourlyLoading}
            currentHourLabel={currentHourLabel}
          />

          {/* Tarif 24h */}
          <ChartCard
            title="Tarif électrique"
            description="Prix (€/kWh) heure par heure — journée en cours"
            data={tariffCurveData}
            dataKey="value"
            unit="€/kWh"
            color="#0ea5e9"
            gradientFrom="#0ea5e9"
            gradientTo="#38bdf8"
            loading={hourlyLoading}
            currentHourLabel={currentHourLabel}
          />

          {/* Signal — depuis snapshots */}
         

          {/* Congestion — depuis snapshots */}
          
        </div>
      </div>
    </div>
  );
}