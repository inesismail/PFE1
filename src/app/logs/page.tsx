'use client';

import {
  AlertCircle,
  AlertTriangle,
  Bug,
  Calendar,
  Info,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { LogLevel, LogSource, SystemLog, logsApi } from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/layout';

// Log level configuration
const LOG_LEVELS: { level: LogLevel; label: string; color: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { level: 'ERROR', label: 'Erreur', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30', icon: AlertCircle },
  { level: 'WARN', label: 'Warning', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: AlertTriangle },
  { level: 'INFO', label: 'Info', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', icon: Info },
  { level: 'DEBUG', label: 'Debug', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30', icon: Bug },
];

// Log source configuration
const LOG_SOURCES: { source: LogSource; label: string }[] = [
  { source: 'CpoConnection', label: 'CPO Connection' },
  { source: 'SignalProcessor', label: 'Signal Processor' },
  { source: 'EdfSignal', label: 'EDF Signal' },
  { source: 'SiteLimit', label: 'Site Limit' },
  { source: 'System', label: 'Système' },
  { source: 'Plugin', label: 'Plugin' },
];

// Time range options
const TIME_RANGES = [
  { value: '1h', label: 'Dernière heure', hours: 1 },
  { value: '6h', label: '6 heures', hours: 6 },
  { value: '24h', label: '24 heures', hours: 24 },
  { value: '7d', label: '7 jours', hours: 168 },
  { value: 'all', label: 'Tout', hours: null },
];

export default function LogsPage() {
  const queryClient = useQueryClient();
  
  // Filter state
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | null>(null);
  const [selectedSource, setSelectedSource] = useState<LogSource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  // Calculate time range - use callback to avoid impure function warning
  const getFromDate = useCallback(() => {
    const timeRangeHours = TIME_RANGES.find(t => t.value === timeRange)?.hours;
    return timeRangeHours 
      ? new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString()
      : undefined;
  }, [timeRange]);

  const timeRangeHours = TIME_RANGES.find(t => t.value === timeRange)?.hours;

  // Query params
  const queryParams = useMemo(() => ({
    level: selectedLevel || undefined,
    source: selectedSource || undefined,
    search: searchQuery || undefined,
    from: getFromDate(),
    limit: 500,
  }), [selectedLevel, selectedSource, searchQuery, getFromDate]);

  // Fetch logs
  const { data: logsResponse, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['logs', queryParams],
    queryFn: () => logsApi.getAll(queryParams),
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });

  // Extract logs array from response
  const logs = logsResponse?.logs ?? [];
  const totalLogs = logsResponse?.total ?? 0;

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['logs-stats', timeRangeHours],
    queryFn: () => logsApi.getStats(timeRangeHours || undefined),
    refetchInterval: 30000,
  });

  // Cleanup mutation
  const cleanupMutation = useMutation({
    mutationFn: () => logsApi.cleanup(7),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['logs-stats'] });
    },
  });

  // Filter functions
  const clearFilters = () => {
    setSelectedLevel(null);
    setSelectedSource(null);
    setSearchQuery('');
    setTimeRange('24h');
  };

  const hasActiveFilters = selectedLevel || selectedSource || searchQuery || timeRange !== '24h';

  // Get level config
  const getLevelConfig = (level: LogLevel) => LOG_LEVELS.find(l => l.level === level) || LOG_LEVELS[2];

  return (
    <div className="space-y-6">
      <Header
        title="Logs Système"
        description="Journal des événements et opérations du système"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Nettoyer
            </button>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              Actualiser
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {LOG_LEVELS.map(({ level, label, color, icon: Icon }) => (
          <Card 
            key={level}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedLevel === level && "ring-2 ring-primary"
            )}
            onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">
                    {stats?.byLevel?.[level] || 0}
                  </p>
                </div>
                <div className={cn("p-2 rounded-lg border", color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-background border">
                <Info className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Source Filter */}
            <select
              value={selectedSource || ''}
              onChange={(e) => setSelectedSource(e.target.value as LogSource || null)}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Toutes les sources</option>
              {LOG_SOURCES.map(({ source, label }) => (
                <option key={source} value={source}>{label}</option>
              ))}
            </select>

            {/* Time Range */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {TIME_RANGES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
                Effacer
              </button>
            )}
          </div>

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedLevel && (
                <Badge variant="secondary" className="gap-1">
                  Niveau: {LOG_LEVELS.find(l => l.level === selectedLevel)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedLevel(null)} 
                  />
                </Badge>
              )}
              {selectedSource && (
                <Badge variant="secondary" className="gap-1">
                  Source: {LOG_SOURCES.find(s => s.source === selectedSource)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedSource(null)} 
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Recherche: &quot;{searchQuery}&quot;
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')} 
                  />
                </Badge>
              )}
              {timeRange !== '24h' && (
                <Badge variant="secondary" className="gap-1">
                  Période: {TIME_RANGES.find(t => t.value === timeRange)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => setTimeRange('24h')} 
                  />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Journal des événements
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({logs.length} / {totalLogs} entrées)
              </span>
            </CardTitle>
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Chargement des logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Info className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Aucun log trouvé</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <LogEntry key={log.id} log={log} getLevelConfig={getLevelConfig} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Log Entry Component
function LogEntry({ 
  log, 
  getLevelConfig 
}: { 
  log: SystemLog; 
  getLevelConfig: (level: LogLevel) => typeof LOG_LEVELS[number];
}) {
  const [expanded, setExpanded] = useState(false);
  const levelConfig = getLevelConfig(log.level);
  const Icon = levelConfig.icon;

  return (
    <div 
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
        expanded && "bg-muted/30"
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        {/* Level Icon */}
        <div className={cn("p-2 rounded-lg border shrink-0", levelConfig.color)}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {log.source}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {log.action}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeTime(log.timestamp)}
            </span>
          </div>
          <p className={cn(
            "mt-1 text-sm",
            !expanded && "truncate"
          )}>
            {log.message}
          </p>

          {/* Expanded Details */}
          {expanded && (
            <div className="mt-3 space-y-2 text-xs">
              {log.actorName && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Acteur:</span>
                  <span className="font-medium">{log.actorName}</span>
                </div>
              )}
              {log.siteName && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Site:</span>
                  <span className="font-medium">{log.siteName}</span>
                </div>
              )}
              {log.connectionId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Connection ID:</span>
                  <code className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{log.connectionId}</code>
                </div>
              )}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2">
                  <span className="text-muted-foreground">Metadata:</span>
                  <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground pt-2">
                <span>Timestamp:</span>
                <code className="text-[10px]">{new Date(log.timestamp).toLocaleString('fr-FR')}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
