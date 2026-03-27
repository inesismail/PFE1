'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
import { fetchFranceRegions, type FranceRegion } from '@/lib/france-regions';
import { Search, Globe, MapPin, Building2, Users, Landmark, X, BarChart3, PieChartIcon, TrendingUp, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Treemap,
} from 'recharts';

/* ── Territory constants ── */
const OUTREMER_CODES = new Set(['01', '02', '03', '04', '06']);

type Territory = 'all' | 'metropole' | 'outremer';

const TERRITORY_TABS: { key: Territory; label: string; emoji: string }[] = [
  { key: 'all', label: 'Tous les territoires', emoji: '🇫🇷' },
  { key: 'metropole', label: 'Métropole', emoji: '🇪🇺' },
  { key: 'outremer', label: 'Outre-mer', emoji: '🌴' },
];

const TERRITORY_META: Record<Territory, { title: string; desc: string }> = {
  all:       { title: 'Territoires de France', desc: 'Visualisation des 18 régions administratives — métropole et outre-mer' },
  metropole: { title: 'France métropolitaine', desc: 'Les 13 régions du territoire européen' },
  outremer:  { title: 'Outre-mer',             desc: 'Les 5 régions et collectivités ultramarines' },
};

/* ── Animated counter hook ── */
function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

/* ── Staggered fade-in wrapper ── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Custom Treemap content ── */
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, color } = props;
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={color} opacity={0.85} stroke="hsl(var(--background))" strokeWidth={2} />
      {width > 60 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={width > 100 ? 11 : 9} fontWeight={600}>
          {name}
        </text>
      )}
    </g>
  );
};

export default function RegionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [activeTerritory, setActiveTerritory] = useState<Territory>('all');

  useEffect(() => setMounted(true), []);

  /* ── Data ── */
  const { data: allRegions = [], isLoading, isError } = useQuery<FranceRegion[]>({
    queryKey: ['france-regions'],
    queryFn: fetchFranceRegions,
    staleTime: 1000 * 60 * 60,
  });

  /* ── Territory filtering ── */
  const territoryRegions = useMemo(() => {
    if (activeTerritory === 'metropole') return allRegions.filter((r) => !OUTREMER_CODES.has(r.code));
    if (activeTerritory === 'outremer') return allRegions.filter((r) => OUTREMER_CODES.has(r.code));
    return allRegions;
  }, [allRegions, activeTerritory]);

  const metropoleCount = useMemo(() => allRegions.filter((r) => !OUTREMER_CODES.has(r.code)).length, [allRegions]);
  const outremerCount = useMemo(() => allRegions.filter((r) => OUTREMER_CODES.has(r.code)).length, [allRegions]);

  const sortedRegions = useMemo(() => {
    return [...territoryRegions].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }, [territoryRegions]);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return sortedRegions;
    const q = searchQuery.toLowerCase();
    return sortedRegions.filter(
      (r) =>
        r.nom.toLowerCase().includes(q) ||
        r.code.includes(q) ||
        r.chefLieu.toLowerCase().includes(q),
    );
  }, [searchQuery, sortedRegions]);

  /* For the "all" tab, split filtered into two groups */
  const metropoleFiltered = useMemo(() => filteredRegions.filter((r) => !OUTREMER_CODES.has(r.code)), [filteredRegions]);
  const outremerFiltered = useMemo(() => filteredRegions.filter((r) => OUTREMER_CODES.has(r.code)), [filteredRegions]);

  /* ── Stats ── */
  const totalPop = useMemo(() => {
    return territoryRegions.reduce((s, r) => {
      const v = parseFloat(r.population.replace(',', '.'));
      return s + (isNaN(v) ? 0 : v);
    }, 0);
  }, [territoryRegions]);

  const totalDep = territoryRegions.reduce((s, r) => s + r.departements, 0);
  const animRegions = useAnimatedCount(territoryRegions.length);
  const animDep = useAnimatedCount(totalDep);

  /* ── Chart data ── */
  const popBarData = useMemo(() =>
    [...territoryRegions]
      .map((r) => ({
        name: r.nom.length > 14 ? r.nom.slice(0, 12) + '…' : r.nom,
        fullName: r.nom,
        pop: parseFloat(r.population.replace(',', '.')),
        fill: r.color,
      }))
      .filter((d) => !isNaN(d.pop))
      .sort((a, b) => b.pop - a.pop),
  [territoryRegions]);

  const depPieData = useMemo(() =>
    [...territoryRegions]
      .filter((r) => r.departements >= (activeTerritory === 'outremer' ? 1 : 4))
      .map((r) => ({ name: r.nom, value: r.departements, color: r.color }))
      .sort((a, b) => b.value - a.value),
  [territoryRegions, activeTerritory]);

  const treemapData = useMemo(() =>
    territoryRegions
      .filter((r) => parseFloat(r.population.replace(',', '.')) > 0)
      .map((r) => ({
        name: r.nom.length > 16 ? r.nom.slice(0, 14) + '…' : r.nom,
        size: parseFloat(r.population.replace(',', '.')),
        color: r.color,
      })),
  [territoryRegions]);

  const top5 = popBarData.slice(0, 5);
  const meta = TERRITORY_META[activeTerritory];

  return (
    <div className="min-h-screen">
      <Header
        title={meta.title}
        description={meta.desc}
      />

      <div className="p-6 space-y-8">
        {/* ══════════ LOADING / ERROR ══════════ */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des régions…</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <X className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-sm text-muted-foreground">Impossible de charger les régions depuis l'API.</p>
          </div>
        )}

        {!isLoading && !isError && (<>

        {/* ══════════ TERRITORY TABS ══════════ */}
        <FadeIn delay={50}>
          <div className="flex flex-wrap items-center gap-2">
            {TERRITORY_TABS.map((tab) => {
              const count = tab.key === 'all' ? allRegions.length : tab.key === 'metropole' ? metropoleCount : outremerCount;
              const isActive = activeTerritory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTerritory(tab.key); setSearchQuery(''); }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  <span className="text-base">{tab.emoji}</span>
                  {tab.label}
                  <Badge variant={isActive ? 'secondary' : 'outline'} className={`text-[10px] px-1.5 ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : ''}`}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* ══════════ TERRITORY INFO CARD ══════════ */}
        <FadeIn delay={100}>
          <Card className="border-l-4 border-l-primary/60 bg-gradient-to-r from-primary/[0.03] to-transparent">
            <CardContent className="pt-5 pb-4">
              {activeTerritory === 'all' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">🇫🇷 La France est composée de plusieurs territoires</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      On distingue la <strong>France métropolitaine</strong> ({metropoleCount} régions en Europe)
                      {' '}et les territoires d&apos;<strong>outre-mer</strong> ({outremerCount} régions ultramarines : Guadeloupe, Martinique, Guyane, La Réunion, Mayotte).
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button onClick={() => setActiveTerritory('metropole')} className="text-center px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors cursor-pointer">
                      <p className="text-lg font-bold text-blue-600">{metropoleCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Métropole</p>
                    </button>
                    <button onClick={() => setActiveTerritory('outremer')} className="text-center px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                      <p className="text-lg font-bold text-emerald-600">{outremerCount}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Outre-mer</p>
                    </button>
                  </div>
                </div>
              )}
              {activeTerritory === 'metropole' && (
                <div>
                  <p className="text-sm font-semibold text-foreground">🇪🇺 France métropolitaine</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Le territoire principal situé en Europe, composé de {metropoleCount} régions administratives.
                  </p>
                </div>
              )}
              {activeTerritory === 'outremer' && (
                <div>
                  <p className="text-sm font-semibold text-foreground">🌴 Territoires d&apos;outre-mer</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {outremerCount} régions ultramarines : Guadeloupe, Martinique, Guyane, La Réunion et Mayotte.
                    Ces territoires appartiennent à la France mais sont situés hors de l&apos;Europe.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </FadeIn>

        {/* ══════════ HERO STATS ══════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Régions', value: animRegions, icon: Globe, color: 'blue', gradient: 'from-blue-600 to-blue-400' },
            { label: 'Départements', value: animDep, icon: Building2, color: 'emerald', gradient: 'from-emerald-600 to-emerald-400' },
            { label: 'Population', value: `${totalPop.toFixed(1).replace('.', ',')}M`, icon: Users, color: 'violet', gradient: 'from-violet-600 to-violet-400', isText: true },
            { label: 'Chefs-lieux', value: animRegions, icon: Landmark, color: 'amber', gradient: 'from-amber-600 to-amber-400' },
          ].map((stat, i) => (
            <FadeIn key={stat.label} delay={150 + i * 100}>
              <Card className={`group hover:shadow-lg transition-all duration-300 border-l-4 border-l-${stat.color}-500`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                      <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.isText ? stat.value : stat.value}
                      </p>
                    </div>
                    <div className={`h-12 w-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        {/* ══════════ CHARTS ROW ══════════ */}
        <FadeIn delay={550}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Population Bar Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Population par région
                  <span className="text-xs text-muted-foreground font-normal ml-auto">en millions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popBarData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/50" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}M`} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: any) => [`${value}M habitants`, 'Population']}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        contentStyle={{
                          borderRadius: '10px',
                          border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--card))',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="pop" radius={[0, 6, 6, 0]} animationDuration={1400} animationEasing="ease-out">
                        {popBarData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Départements Pie Chart */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-primary" />
                  Départements par région
                  <span className="text-xs text-muted-foreground font-normal ml-auto">{activeTerritory === 'outremer' ? 'toutes les régions' : '4+ départements'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[340px] flex items-center">
                  <div className="w-full h-full flex items-center gap-4">
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={depPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            {depPieData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} opacity={0.85} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-xl text-sm">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                                    <span className="font-semibold text-foreground">{data.name}</span>
                                  </div>
                                  <p className="text-muted-foreground">
                                    <span className="font-bold text-foreground">{data.value}</span> départements
                                  </p>
                                </div>
                              );
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-44 space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                      {depPieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="text-[11px] text-muted-foreground truncate flex-1">{entry.name}</span>
                          <span className="text-[11px] font-bold text-foreground">{entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* ══════════ TREEMAP + TOP 5 ══════════ */}
        <FadeIn delay={700}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Treemap */}
            <Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Répartition de la population
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap
                      data={treemapData}
                      dataKey="size"
                      aspectRatio={4 / 3}
                      animationDuration={1000}
                      content={<TreemapContent />}
                    />
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 regions */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Top {Math.min(5, top5.length)} — Population
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {top5.map((r, i) => (
                  <div key={r.fullName} className="flex items-center gap-3">
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{r.fullName}</p>
                      <div className="h-1.5 w-full bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: mounted ? `${(r.pop / top5[0].pop) * 100}%` : '0%',
                            backgroundColor: r.fill,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">{r.pop}M</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* ══════════ SEARCH ══════════ */}
        <FadeIn delay={800}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Rechercher par nom, code ou chef-lieu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 rounded-xl border border-border bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredRegions.length} / {territoryRegions.length} région(s)
            </span>
          </div>
        </FadeIn>

        {/* ══════════ REGIONS GRID ══════════ */}
        {activeTerritory === 'all' ? (
          /* Grouped view: Métropole then Outre-mer */
          <>
            {metropoleFiltered.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇪🇺</span>
                  <h2 className="text-lg font-bold text-foreground">France métropolitaine</h2>
                  <Badge variant="secondary">{metropoleFiltered.length}</Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {metropoleFiltered.map((region, i) => (
                    <RegionCard key={region.code} region={region} index={i} mounted={mounted} baseDelay={900} />
                  ))}
                </div>
              </div>
            )}
            {outremerFiltered.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🌴</span>
                  <h2 className="text-lg font-bold text-foreground">Outre-mer</h2>
                  <Badge variant="secondary">{outremerFiltered.length}</Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {outremerFiltered.map((region, i) => (
                    <RegionCard key={region.code} region={region} index={i} mounted={mounted} baseDelay={900 + metropoleFiltered.length * 60} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Single territory view */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRegions.map((region, i) => (
              <RegionCard key={region.code} region={region} index={i} mounted={mounted} baseDelay={900} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredRegions.length === 0 && (
          <FadeIn delay={0}>
            <div className="py-20 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <Search className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-lg font-semibold text-foreground">Aucune région trouvée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Modifiez votre recherche ou{' '}
                <button onClick={() => setSearchQuery('')} className="text-primary hover:underline font-medium">
                  réinitialisez le filtre
                </button>
              </p>
            </div>
          </FadeIn>
        )}

        </>)}
      </div>
    </div>
  );
}

/* ══════════ REGION CARD COMPONENT ══════════ */
function RegionCard({ region, index, mounted, baseDelay }: { region: FranceRegion; index: number; mounted: boolean; baseDelay: number }) {
  const isOutremer = OUTREMER_CODES.has(region.code);
  return (
    <FadeIn delay={baseDelay + index * 60} className="h-full">
      <Card className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border-0 shadow-md h-full">
        {/* Gradient top bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${region.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

        {/* Corner glow */}
        <div
          className="absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-[0.06] group-hover:opacity-[0.14] transition-opacity duration-500 blur-xl"
          style={{ background: region.color }}
        />

        <CardContent className="pt-6 pb-5 relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3.5">
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                style={{ backgroundColor: `${region.color}15` }}
              >
                <MapPin className="h-5 w-5" style={{ color: region.color }} />
              </div>
              <div>
                <h3 className="font-bold text-[15px] text-foreground leading-tight">{region.nom}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <Landmark className="h-3 w-3" />
                  {region.chefLieu}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {isOutremer ? '🌴 Outre-mer' : '🇪🇺 Métropole'}
              </Badge>
              <Badge variant="secondary" className="font-mono text-[10px] font-bold px-2 py-0.5 shrink-0">
                {region.code}
              </Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/30 px-3 py-3 text-center group-hover:bg-muted/50 transition-colors">
              <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Population</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{region.population}</p>
            </div>
            <div className="rounded-xl bg-muted/30 px-3 py-3 text-center group-hover:bg-muted/50 transition-colors">
              <Building2 className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Départements</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{region.departements}</p>
            </div>
          </div>

          {/* Population bar */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>Part de la population nationale</span>
              <span className="font-semibold" style={{ color: region.color }}>
                {((parseFloat(region.population.replace(',', '.')) / 67.8) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: mounted ? `${(parseFloat(region.population.replace(',', '.')) / 67.8) * 100}%` : '0%',
                  backgroundColor: region.color,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}
