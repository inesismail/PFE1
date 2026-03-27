'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Plug,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
  Zap,
  Shield,
  Signal,
} from 'lucide-react';
import { Actor, actorsApi, cpoApi, processorApi, signalsApi, sitesApi } from '@/lib/api';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  StatusDot,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  RadialBarChart,
  RadialBar,
} from 'recharts';

import { Header } from '@/components/layout';
import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

// Signal Regions configuration with colors
const SIGNAL_REGIONS: Record<string, { name: string; emoji: string; color: string; chartColor: string }> = {
  CORSE: { name: 'Corse', emoji: '🏝️', color: 'blue', chartColor: '#3b82f6' },
  GUADELOUPE: { name: 'Guadeloupe', emoji: '🌴', color: 'emerald', chartColor: '#10b981' },
  MARTINIQUE: { name: 'Martinique', emoji: '🌺', color: 'purple', chartColor: '#a855f7' },
  GUYANE: { name: 'Guyane', emoji: '🌿', color: 'amber', chartColor: '#f59e0b' },
  REUNION: { name: 'La Réunion', emoji: '🌋', color: 'rose', chartColor: '#f43f5e' },
};

const PIE_COLORS = ['#22c55e', '#ef4444', '#94a3b8'];

// Signal Region Card Component
function SignalCard({
  region,
  signal,
  isLoading,
}: {
  region: { name: string; emoji: string; color: string };
  signal: { value: number; time: string } | null | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-5">
          <div className="space-y-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = signal !== undefined && signal !== null;
  const isFavorable = hasData && signal?.value === 1;

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default ${
        !hasData
          ? 'bg-muted/30'
          : isFavorable
          ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{region.emoji}</span>
          {hasData && (
            <StatusDot
              status={isFavorable ? 'online' : 'error'}
              size="lg"
              pulse={isFavorable}
            />
          )}
        </div>
        <h3 className="font-semibold">{region.name}</h3>
        <div className="mt-2">
          {hasData ? (
            <div className="flex items-center gap-1.5">
              {isFavorable ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Favorable
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    Défavorable
                  </span>
                </>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Pas de données</span>
          )}
        </div>
        {hasData && signal?.time && (
          <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(signal.time)}
          </p>
        )}
      </CardContent>
      <div
        className={`h-1 ${
          !hasData ? 'bg-muted' : isFavorable ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />
    </Card>
  );
}

// Quick Action Link Component
function QuickActionLink({
  href,
  icon: Icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50',
  };

  const hoverBorder: Record<string, string> = {
    blue: 'hover:border-blue-300 dark:hover:border-blue-700',
    purple: 'hover:border-purple-300 dark:hover:border-purple-700',
    emerald: 'hover:border-emerald-300 dark:hover:border-emerald-700',
    amber: 'hover:border-amber-300 dark:hover:border-amber-700',
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 rounded-xl border border-border ${hoverBorder[color]} hover:bg-accent/50 transition-all duration-200 group`}
    >
      <div
        className={`h-11 w-11 rounded-xl flex items-center justify-center transition-colors shrink-0 ${colorClasses[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}

export default function DashboardPage() {
  const { data: connections, isLoading: loadingConnections } = useQuery({
    queryKey: ['cpo-connections'],
    queryFn: cpoApi.getAll,
  });

  const { data: sites, isLoading: loadingSites } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.getAll(),
  });

  const { data: latestSignals, isLoading: loadingSignals } = useQuery({
    queryKey: ['latest-signals'],
    queryFn: signalsApi.getLatest,
    refetchInterval: 60000,
  });

  const { data: processorStatus } = useQuery({
    queryKey: ['processor-status'],
    queryFn: processorApi.getStatus,
  });

  const { data: actors } = useQuery({
    queryKey: ['actors'],
    queryFn: () => actorsApi.getAll(),
  });

  // Computed stats
  const totalConnections = connections?.length || 0;
  const activeConnections = connections?.filter((c) => c.isConnected && c.fetchEnabled)?.length || 0;
  const totalSites = sites?.length || 0;
  const assignedSites = sites?.filter((s) => s.region)?.length || 0;
  const totalActors = actors?.length || 0;
  const activeActors = actors?.filter((a: Actor) => a.actorImplementations?.some((i) => i.isEnabled))?.length || 0;

  const signalValues = latestSignals ? Object.values(latestSignals).filter((s) => s !== null) : [];
  const favorableSignals = signalValues.filter((s) => s?.value === 1).length;
  const totalRegions = Object.keys(SIGNAL_REGIONS).length;
  const unfavorableSignals = signalValues.length - favorableSignals;
  const noDataSignals = totalRegions - signalValues.length;

  // System health score
  const healthScore = Math.round(
    ((activeConnections / Math.max(totalConnections, 1)) * 40 +
      (assignedSites / Math.max(totalSites, 1)) * 30 +
      (favorableSignals / totalRegions) * 30)
  );

  // Chart data
  const signalPieData = useMemo(() => [
    { name: 'Favorable', value: favorableSignals },
    { name: 'Défavorable', value: unfavorableSignals },
    ...(noDataSignals > 0 ? [{ name: 'Pas de données', value: noDataSignals }] : []),
  ].filter(d => d.value > 0), [favorableSignals, unfavorableSignals, noDataSignals]);

  const regionSignalBarData = useMemo(() =>
    Object.entries(SIGNAL_REGIONS).map(([key, region]) => {
      const signal = latestSignals?.[key];
      return {
        name: region.name,
        emoji: region.emoji,
        value: signal ? (signal.value === 1 ? 1 : -1) : 0,
        fill: signal ? (signal.value === 1 ? '#22c55e' : '#ef4444') : '#94a3b8',
        status: signal ? (signal.value === 1 ? 'Favorable' : 'Défavorable') : 'N/A',
      };
    }),
  [latestSignals]);

  const healthRadialData = useMemo(() => [
    { name: 'Santé', value: healthScore, fill: healthScore >= 70 ? '#22c55e' : healthScore >= 40 ? '#f59e0b' : '#ef4444' },
  ], [healthScore]);

  const systemMetrics = useMemo(() => [
    { name: 'Connexions', active: activeConnections, total: totalConnections, color: '#3b82f6' },
    { name: 'Sites', active: assignedSites, total: totalSites, color: '#a855f7' },
    { name: 'Acteurs', active: activeActors, total: totalActors, color: '#10b981' },
    { name: 'Signaux', active: favorableSignals, total: totalRegions, color: '#f59e0b' },
  ], [activeConnections, totalConnections, assignedSites, totalSites, activeActors, totalActors, favorableSignals, totalRegions]);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header
          title="Tableau de Bord"
          description="Vue d'ensemble du système Flexee — Gestion intelligente des signaux EDF"
        />

        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

          {/* ── Top Row: Health + 4 KPIs ────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Health Score — Radial Gauge */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden relative group md:row-span-1">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
              <CardContent className="pt-5 pb-4 relative">
                <div className="flex flex-col items-center text-center">
                  <div className="h-28 w-28">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        startAngle={180}
                        endAngle={0}
                        data={healthRadialData}
                        barSize={10}
                      >
                        <RadialBar
                          dataKey="value"
                          cornerRadius={5}
                          background={{ fill: 'rgba(255,255,255,0.15)' }}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="-mt-10">
                    <span className="text-3xl font-bold">{healthScore}</span>
                    <span className="text-lg">%</span>
                  </div>
                  <p className="text-sm font-semibold opacity-90 mt-2">Santé Système</p>
                  <p className="text-xs opacity-70">
                    {healthScore >= 70 ? 'Excellent' : healthScore >= 40 ? 'Attention requise' : 'Action nécessaire'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* KPI Cards */}
            <Link href="/connections" className="block group">
              <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Connexions CPO</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-bold">{activeConnections}</span>
                        <span className="text-sm text-muted-foreground">/ {totalConnections}</span>
                      </div>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${activeConnections === totalConnections && totalConnections > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {activeConnections === totalConnections && totalConnections > 0 ? (
                          <><CheckCircle2 className="h-3 w-3" /> Toutes actives</>
                        ) : totalConnections === 0 ? 'Aucune connexion' : (
                          <><AlertTriangle className="h-3 w-3 text-amber-500" /> {totalConnections - activeConnections} en attente</>
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Plug className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sites" className="block group">
              <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sites Configurés</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-bold">{assignedSites}</span>
                        <span className="text-sm text-muted-foreground">/ {totalSites}</span>
                      </div>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${assignedSites === totalSites && totalSites > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {assignedSites === totalSites && totalSites > 0 ? (
                          <><CheckCircle2 className="h-3 w-3" /> Tous assignés</>
                        ) : totalSites === 0 ? 'Aucun site' : (
                          <><AlertTriangle className="h-3 w-3 text-amber-500" /> {totalSites - assignedSites} sans région</>
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/actors" className="block group">
              <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Acteurs Actifs</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-bold">{activeActors}</span>
                        <span className="text-sm text-muted-foreground">/ {totalActors}</span>
                      </div>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${activeActors === totalActors && totalActors > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {activeActors === totalActors && totalActors > 0 ? (
                          <><CheckCircle2 className="h-3 w-3" /> Tous opérationnels</>
                        ) : totalActors === 0 ? 'Aucun acteur' : (
                          <><AlertTriangle className="h-3 w-3 text-amber-500" /> {totalActors - activeActors} en veille</>
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/signals" className="block group">
              <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Signaux Favorables</p>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-3xl font-bold">{favorableSignals}</span>
                        <span className="text-sm text-muted-foreground">/ {totalRegions}</span>
                      </div>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${favorableSignals === totalRegions ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {favorableSignals === totalRegions ? (
                          <><CheckCircle2 className="h-3 w-3" /> Tout favorable</>
                        ) : (
                          <><AlertTriangle className="h-3 w-3 text-amber-500" /> {totalRegions - favorableSignals} défavorable(s)</>
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* ── Charts Row: Signal Distribution + System Metrics ─ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie chart - Signal distribution */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Signal className="h-4 w-4 text-primary" />
                  Distribution des Signaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                {signalPieData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={signalPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {signalPieData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value, name) => [`${value} région(s)`, name as string]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-1">
                      {signalPieData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs text-muted-foreground">{entry.name} ({entry.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    Aucune donnée
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart - System metrics overview */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Vue System — Actifs vs Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={systemMetrics} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <RechartsTooltip
                        formatter={(value, name) => [value, name === 'active' ? 'Actifs' : 'Total']}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Total" />
                      <Bar dataKey="active" radius={[4, 4, 0, 0]} name="Actifs">
                        {systemMetrics.map((entry, index) => (
                          <Cell key={`active-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Signal Map ──────────────────────────────────────── */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Signaux EDF en Temps Réel</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      État actuel des 5 régions insulaires
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                      <StatusDot status="online" pulse />
                      <span className="text-muted-foreground">
                        {favorableSignals} Favorable{favorableSignals > 1 ? 's' : ''}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusDot status="error" />
                      <span className="text-muted-foreground">
                        {totalRegions - favorableSignals} Défavorable{totalRegions - favorableSignals > 1 ? 's' : ''}
                      </span>
                    </span>
                  </div>
                  <Badge variant="secondary" className="gap-1.5">
                    <RefreshCw className="h-3 w-3" />
                    Auto-refresh 1min
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {Object.entries(SIGNAL_REGIONS).map(([key, region]) => (
                  <SignalCard
                    key={key}
                    region={region}
                    signal={latestSignals?.[key]}
                    isLoading={loadingSignals}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── Active Processes & Quick Actions ──────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Active Processing Jobs */}
            <Card className="xl:col-span-2 shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle>Cycles de Récupération Actifs</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/connections" className="gap-1.5">
                      Voir tout <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {processorStatus && processorStatus.length > 0 ? (
                  <div className="divide-y divide-border">
                    {processorStatus.slice(0, 4).map((status) => (
                      <div
                        key={status.connectionId}
                        className="p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                                status.jobActive
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                  : 'bg-muted'
                              }`}
                            >
                              <RefreshCw
                                className={`h-5 w-5 ${
                                  status.jobActive
                                    ? 'text-emerald-600 dark:text-emerald-400 animate-spin'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{status.actorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {status.siteCount} site{status.siteCount > 1 ? 's' : ''} •
                                Intervalle: {status.fetchIntervalMinutes} min
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <StatusDot
                              status={status.jobActive ? 'online' : 'offline'}
                              showLabel
                              label={status.jobActive ? 'Actif' : 'Inactif'}
                            />
                            {status.nextFetchAt && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Prochain: {formatRelativeTime(status.nextFetchAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-3">Aucun cycle de récupération actif</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/connections" className="gap-1.5">
                        Configurer une connexion CPO <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <CardTitle>Actions Rapides</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <QuickActionLink
                    href="/actors"
                    icon={Users}
                    title="Gérer les Acteurs"
                    description="Configurer les plugins"
                    color="blue"
                  />
                  <QuickActionLink
                    href="/connections"
                    icon={Plug}
                    title="Connexions"
                    description="CPO & DSO"
                    color="purple"
                  />
                  <QuickActionLink
                    href="/sites"
                    icon={MapPin}
                    title="Gérer les Sites"
                    description="Assigner les régions"
                    color="emerald"
                  />
                  <QuickActionLink
                    href="/regions"
                    icon={Globe}
                    title="Régions EDF"
                    description="Surveiller les signaux"
                    color="amber"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Connections Table ─────────────────────────────── */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>État des Connexions CPO</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Synchronisation avec WattzHub
                    </p>
                  </div>
                </div>
                <Button asChild className="gap-2">
                  <Link href="/connections">
                    <Plug className="h-4 w-4" />
                    Nouvelle Connexion
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Acteur</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Intervalle</TableHead>
                      <TableHead className="font-semibold">Dernière Sync</TableHead>
                      <TableHead className="font-semibold">Prochain Fetch</TableHead>
                      <TableHead className="font-semibold">Sites</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections && connections.length > 0 ? (
                      connections.map((conn) => {
                        const matchingStatus = processorStatus?.find(
                          (s) => s.connectionId === conn.id
                        );
                        const isActive = conn.isConnected && conn.fetchEnabled;
                        return (
                          <TableRow key={conn.id} className="group">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-muted rounded-xl flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span className="font-medium">
                                  {conn.actor?.name || 'N/A'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isActive ? 'default' : 'secondary'}
                                className={
                                  isActive
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                    : 'bg-muted text-muted-foreground'
                                }
                              >
                                {isActive ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Actif
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" /> Inactif
                                  </>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{conn.fetchIntervalMinutes} min</span>
                            </TableCell>
                            <TableCell>
                              <Tooltip>
                                <TooltipTrigger className="text-muted-foreground hover:text-foreground transition-colors">
                                  {formatRelativeTime(conn.lastSyncAt)}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {conn.lastSyncAt
                                    ? new Date(conn.lastSyncAt).toLocaleString('fr-FR')
                                    : 'Jamais'}
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <span className="text-muted-foreground">
                                {formatRelativeTime(conn.nextFetchAt)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {matchingStatus?.siteCount || 0}
                                </span>
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-48">
                          <div className="flex flex-col items-center justify-center">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                              <Plug className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-3">
                              Aucune connexion CPO configurée
                            </p>
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/connections" className="gap-1.5">
                                Créer votre première connexion{' '}
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
