'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Select,
  Badge,
} from '@/components/ui';
import { signalsApi, regionsApi, processorApi, type Signal } from '@/lib/api';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import {
  Activity,
  RefreshCw,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function SignalsPage() {
  const queryClient = useQueryClient();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [historyHours, setHistoryHours] = useState<number>(24);

  // Queries
  const { data: regions } = useQuery({
    queryKey: ['edf-regions'],
    queryFn: regionsApi.getAll,
  });

  const { data: latestSignals, isLoading: signalsLoading } = useQuery({
    queryKey: ['latest-signals'],
    queryFn: signalsApi.getLatest,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: processorStatus } = useQuery({
    queryKey: ['processor-status'],
    queryFn: processorApi.getStatus,
    refetchInterval: 30000,
  });

  const { data: signalHistory } = useQuery({
    queryKey: ['signal-history', selectedRegion, historyHours],
    queryFn: () => signalsApi.getHistory(selectedRegion, historyHours),
    enabled: !!selectedRegion,
  });

  interface SignalStatsData {
    favorablePercentage?: number;
    unfavorablePercentage?: number;
    totalReadings?: number;
  }

  const { data: signalStats } = useQuery({
    queryKey: ['signal-stats', selectedRegion, historyHours],
    queryFn: () => signalsApi.getStats(selectedRegion, historyHours) as Promise<SignalStatsData>,
    enabled: !!selectedRegion,
  });

  // Mutations
  const fetchSignalsMutation = useMutation({
    mutationFn: signalsApi.fetchAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-signals'] });
      queryClient.invalidateQueries({ queryKey: ['signal-history'] });
    },
  });

  const triggerProcessorMutation = useMutation({
    mutationFn: (connectionId: string) => processorApi.trigger(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processor-status'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  // Transform signals for display
  const signalsList = latestSignals
    ? Object.entries(latestSignals).map(([code, signal]) => ({
        code,
        ...signal,
        region: regions?.find((r) => r.code === code),
      }))
    : [];

  // Stats
  const favorableCount = signalsList.filter((s) => s.value === 1).length;
  const unfavorableCount = signalsList.filter((s) => s.value === 0).length;

  // Chart data transformation
  const chartData = signalHistory?.map((signal: Signal) => ({
    time: new Date(signal.time).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    fullTime: formatDate(signal.time),
    value: signal.value,
    status: signal.value === 1 ? 'Favorable' : 'Défavorable',
  }));

  return (
    <div className="min-h-screen">
      <Header
        title="Signaux EDF"
        description="Surveillance en temps réel des signaux réseau EDF SEI"
      />

      <div className="p-6 space-y-6">
        {/* Actions & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => fetchSignalsMutation.mutate()}
              isLoading={fetchSignalsMutation.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir les signaux
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-medium text-green-800 dark:text-green-300">{favorableCount} Favorable</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-300">{unfavorableCount} Défavorable</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Signals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {signalsLoading ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                Chargement des signaux...
              </CardContent>
            </Card>
          ) : signalsList.length > 0 ? (
            signalsList.map((signal) => (
              <Card
                key={signal.code}
                className={`cursor-pointer transition-all ${
                  selectedRegion === signal.code ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedRegion(signal.code)}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div
                      className={`h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                        signal.value === 1 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}
                    >
                      {signal.value === 1 ? (
                        <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-foreground">{signal.region?.name || signal.code}</h3>
                    <p
                      className={`text-sm font-medium ${
                        signal.value === 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {signal.value === 1 ? 'Favorable' : 'Défavorable'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(signal.time)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Aucun signal disponible</h3>
                <p className="text-muted-foreground mb-4">
                  Cliquez sur &quot;Rafraîchir&quot; pour récupérer les signaux EDF
                </p>
                <Button onClick={() => fetchSignalsMutation.mutate()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Récupérer les signaux
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Signal History Chart */}
        {selectedRegion && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Historique -{' '}
                  {regions?.find((r) => r.code === selectedRegion)?.name || selectedRegion}
                </CardTitle>
                <Select
                  options={[
                    { value: 6, label: '6 heures' },
                    { value: 12, label: '12 heures' },
                    { value: 24, label: '24 heures' },
                    { value: 48, label: '48 heures' },
                    { value: 72, label: '72 heures' },
                  ]}
                  value={historyHours}
                  onChange={(e) => setHistoryHours(parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </CardHeader>
            <CardContent>
              {chartData && chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 1]} ticks={[0, 1]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [
                          value === 1 ? 'Favorable' : 'Défavorable',
                          'Signal',
                        ]}
                        labelFormatter={(label, payload) =>
                          payload?.[0]?.payload?.fullTime || label
                        }
                      />
                      <Area
                        type="stepAfter"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#93c5fd"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Aucun historique disponible pour cette période
                </div>
              )}

              {/* Stats */}
              {signalStats && (
                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {signalStats.favorablePercentage?.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Temps favorable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {signalStats.unfavorablePercentage?.toFixed(1) || 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Temps défavorable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {signalStats.totalReadings || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Lectures</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processor Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processeurs de Signaux Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processorStatus && processorStatus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processorStatus.map((status) => (
                  <div
                    key={status.connectionId}
                    className="p-4 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">{status.actorName}</h4>
                      <Badge
                        variant={
                          status.jobActive && status.fetchEnabled ? 'success' : 'warning'
                        }
                      >
                        {status.jobActive && status.fetchEnabled ? 'Actif' : 'En pause'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Intervalle:</span>
                        <span className="font-medium">{status.fetchIntervalMinutes} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sites:</span>
                        <span className="font-medium">{status.siteCount}</span>
                      </div>
                      {status.lastFetchAt && (
                        <div className="flex justify-between">
                          <span>Dernier fetch:</span>
                          <span>{formatRelativeTime(status.lastFetchAt)}</span>
                        </div>
                      )}
                      {status.nextFetchAt && (
                        <div className="flex justify-between">
                          <span>Prochain:</span>
                          <span>{formatRelativeTime(status.nextFetchAt)}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => triggerProcessorMutation.mutate(status.connectionId)}
                      isLoading={triggerProcessorMutation.isPending}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Déclencher maintenant
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p>Aucun processeur configuré</p>
                <p className="text-sm">
                  Connectez un CPO et activez le fetch pour démarrer le traitement automatique
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
