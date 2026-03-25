'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusDot,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  ArrowLeft,
  BatteryCharging,
  FileText,
  Info,
  Plug,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Header } from '@/components/layout';
import {
  chargingStationsApi,
  type Transaction,
} from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function connectorStatusColor(
  status?: string,
): 'online' | 'offline' | 'warning' | 'error' | 'pending' {
  if (!status) return 'offline';
  const s = status.toLowerCase();
  if (s === 'available') return 'online';
  if (s === 'charging' || s === 'occupied') return 'pending';
  if (s === 'preparing' || s === 'finishing') return 'warning';
  if (s === 'faulted') return 'error';
  return 'offline';
}

function connectorStatusLabel(status?: string): string {
  if (!status) return 'Inconnu';
  const map: Record<string, string> = {
    available: 'Disponible',
    charging: 'En charge',
    occupied: 'Occupé',
    preparing: 'Préparation',
    finishing: 'Finalisation',
    suspendedev: 'Suspendu (EV)',
    suspendedevse: 'Suspendu (EVSE)',
    faulted: 'En panne',
    unavailable: 'Indisponible',
  };
  return map[status.toLowerCase()] || status;
}

function overallStatus(connectors: any[]): string {
  if (!connectors?.length) return 'offline';
  if (connectors.some((c) => c.status?.toLowerCase() === 'faulted')) return 'faulted';
  if (connectors.some((c) => c.status?.toLowerCase() === 'charging')) return 'charging';
  if (connectors.every((c) => c.status?.toLowerCase() === 'available')) return 'available';
  return 'unavailable';
}

function normalizeArray(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.result && Array.isArray(raw.result)) return raw.result;
  return [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChargingStationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id as string;
  const stationId = rawId ? decodeURIComponent(rawId) : '';


  // Queries — use getAll + find (WattzHub returns 404 on /charging-stations/:id)
  const { data: stationRaw, isLoading, refetch } = useQuery({
    queryKey: ['charging-station', stationId],
    queryFn: async () => {
      console.log('[ChargingStation] stationId:', JSON.stringify(stationId));
      const all = await chargingStationsApi.getAll(0, 500);
      const list = normalizeArray(all);
      console.log('[ChargingStation] List length:', list.length, 'IDs:', list.map((s: any) => s.id));
      let found = list.find((s: any) => s.id === stationId);
      if (!found) {
        found = list.find((s: any) => s.id?.toLowerCase() === stationId?.toLowerCase());
      }
      console.log('[ChargingStation] Match:', found?.id ?? 'NOT FOUND');
      return found || null;
    },
    enabled: !!stationId,
    retry: 1,
    refetchInterval: 30_000,
  });

  const station = stationRaw as any;

  const { data: transactionsRaw } = useQuery({
    queryKey: ['station-transactions', stationId],
    queryFn: async () => {
      try {
        console.log('[Transactions] Fetching for station:', stationId);
        const result = await chargingStationsApi.getTransactions(stationId);
        console.log('[Transactions] Result:', result);
        return result;
      } catch (err) {
        console.warn('[Transactions] Error (silenced):', err);
        return [];
      }
    },
    enabled: !!stationId,
  });

  const transactions: Transaction[] = useMemo(() => {
    const raw = transactionsRaw as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw?.data && Array.isArray(raw.data)) return raw.data;
    if (raw?.result && Array.isArray(raw.result)) return raw.result;
    return [];
  }, [transactionsRaw]);

  // Loading / Not Found
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-96 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Button variant="ghost" size="sm" onClick={() => router.push('/charging-stations')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
            <Plug className="h-12 w-12 mb-4 opacity-50" />
            <p>Borne introuvable</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const connectors: any[] = station.connectors || [];
  const vendor = station.chargePointVendor || station.vendor || '—';
  const model = station.chargePointModel || station.model || '—';
  const protocol = station.ocppProtocol || station.ocppVersion || '—';
  const firmware = station.firmwareVersion || '—';
  const serial = station.chargeBoxSerialNumber || '—';
  const siteAreaName = station.siteArea?.name || '—';
  const siteAreaId = station.siteArea?.id || station.siteAreaID || '—';
  const lastSeen = station.lastSeen;
  const status = overallStatus(connectors);
  const coords = station.coordinates;

  const totalMaxPowerKw = connectors.reduce((sum: number, c: any) => sum + (c.power || c.maxElectricPower || 0) / 1000, 0);
  const currentPowerKw = connectors.reduce((sum: number, c: any) => sum + (c.currentInstantWatt || 0) / 1000, 0);
  const powerPercentage = totalMaxPowerKw ? Math.min(100, (currentPowerKw / totalMaxPowerKw) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Breadcrumb */}
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => router.push('/charging-stations')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux bornes
      </Button>

      {/* Title bar */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{station.id}</h1>
            <Badge variant={status === 'available' ? 'success' : status === 'charging' ? 'warning' : status === 'faulted' ? 'error' : 'outline'}>
              {status === 'available' ? '🟢 En ligne' : status === 'charging' ? '🟡 En charge' : status === 'faulted' ? '🔴 Erreur' : '⚪ Hors ligne'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {siteAreaName} · {vendor} {model} · {protocol} · Firmware {firmware}
            {lastSeen && <> · Dernière connexion: {formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: fr })}</>}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
        </Button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* LEFT: Real-time status */}
        <div className="space-y-6">
          {/* Power gauge */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Statut temps réel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Puissance actuelle</span>
                  <span className="font-bold">{currentPowerKw.toFixed(1)} kW / {totalMaxPowerKw.toFixed(0)} kW</span>
                </div>
                <div className="w-full h-4 bg-muted/30 border border-border rounded-full overflow-hidden">
                  {powerPercentage > 0 && (
                    <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${powerPercentage}%` }} />
                  )}
                </div>
              </div>

              {/* Connectors */}
              <div className="space-y-2">
                {connectors.map((c: any) => (
                  <div key={c.connectorId} className="flex items-center justify-between rounded-lg border px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StatusDot status={connectorStatusColor(c.status)} size="md" pulse={c.status?.toLowerCase() === 'charging'} />
                      <div>
                        <p className="text-sm font-medium">
                          Connecteur #{c.connectorId}{' '}
                          {c.type && <span className="text-muted-foreground font-normal">({c.type})</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {connectorStatusLabel(c.status)}
                          {c.power > 0 && ` · ${(c.power / 1000).toFixed(0)} kW max`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status?.toLowerCase() === 'charging' && (
                        <>
                          {c.currentInstantWatt > 0 && (
                            <Badge variant="warning"><Zap className="h-3 w-3 mr-1" />{(c.currentInstantWatt / 1000).toFixed(1)} kW</Badge>
                          )}
                          {c.currentStateOfCharge > 0 && (
                            <Badge variant="info"><BatteryCharging className="h-3 w-3 mr-1" />{c.currentStateOfCharge}%</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {status === 'charging' ? (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">⚡ Session de charge active</p>
              ) : (
                <p className="text-xs text-muted-foreground">Session active: Aucune</p>
              )}
            </CardContent>
          </Card>

          {/* Technical info */}
          <Card id="config">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" /> Informations techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                <InfoRow label="ID" value={station.id} />
                <InfoRow label="Site Area" value={siteAreaId} />
                <InfoRow label="Fabricant" value={vendor} />
                <InfoRow label="Modèle" value={model} />
                <InfoRow label="N° Série" value={serial} />
                <InfoRow label="Protocole" value={protocol} />
                <InfoRow label="Firmware" value={firmware} />
                {coords && <InfoRow label="Coordonnées" value={`${coords.latitude}, ${coords.longitude}`} />}
              </div>
            </CardContent>
          </Card>
        </div>

       
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" /> Transactions récentes ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune transaction</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Connecteur</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Début</TableHead>
                  <TableHead>Fin</TableHead>
                  <TableHead>Énergie</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 20).map((tx) => {
                  const energy = tx.stopValue && tx.startValue ? ((tx.stopValue - tx.startValue) / 1000).toFixed(2) : '—';
                  const isActive = !tx.stopTimestamp;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">{tx.id}</TableCell>
                      <TableCell>#{tx.connectorId || '—'}</TableCell>
                      <TableCell><Badge variant="outline">{tx.tagID || tx.idTag || tx.tag?.visualID || '—'}</Badge></TableCell>
                      <TableCell className="text-xs">
                        {tx.startTimestamp ? format(new Date(tx.startTimestamp), 'dd/MM HH:mm', { locale: fr }) : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {tx.stopTimestamp ? format(new Date(tx.stopTimestamp), 'dd/MM HH:mm', { locale: fr }) : '—'}
                      </TableCell>
                      <TableCell>{energy} kWh</TableCell>
                      <TableCell><Badge variant={isActive ? 'warning' : 'success'}>{isActive ? 'Active' : 'Terminée'}</Badge></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </>
  );
}
