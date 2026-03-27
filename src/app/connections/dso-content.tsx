'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsoApi, DsoConnection } from '@/lib/api';
import { toast } from 'sonner';
import {
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Clock,
  Edit2,
  Power,
  PowerOff,
  Link2,
  ShieldCheck,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  StatusDot,
  ConfirmDialog,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type DsoTypeOption = {
  token: string | null;
  label: string;
  type: 'MOCK' | 'REAL';
  regions: string[];
  endpoints?: { tariffUrl?: string; energyUrl?: string };
  fields: Record<string, { required?: boolean; default?: string; hidden?: boolean; readOnly?: boolean }>;
};

type FormData = {
  label: string;
  baseUrl: string;
  authEmail: string;
  authPassword: string;
  tariffUrl: string;
  energyUrl: string;
};

export default function DsoPageContent() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editConnection, setEditConnection] = useState<DsoConnection | null>(null);
  const [selectedDsoType, setSelectedDsoType] = useState<DsoTypeOption | null>(null);

  const [formData, setFormData] = useState<FormData>({
    label: '',
    baseUrl: '',
    authEmail: 'dso@platform.local',
    authPassword: '',
    tariffUrl: '',
    energyUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string; dsoLabel?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Get available DSO types for the dropdown
  const { data: dsoTypesData } = useQuery({
    queryKey: ['dso-types'],
    queryFn: async () => (await dsoApi.getAvailableDsoTypes()) || { dsoTypes: [], allRegions: [] },
  });
  const dsoTypes: DsoTypeOption[] = dsoTypesData?.dsoTypes || [];

  // Get all DSO connections
  const { data: connections = [], isLoading, error } = useQuery({
    queryKey: ['dso-connections'],
    queryFn: async () => (await dsoApi.getConnections()) || [],
  });

  const resetForm = () => {
    setFormData({
      label: '',
      baseUrl: '',
      authEmail: 'dso@platform.local',
      authPassword: '',
      tariffUrl: '',
      energyUrl: '',
    });
    setTestResult(null);
    setEditConnection(null);
    setSelectedDsoType(null);
    setSelectedRegions([]);
    setIsTesting(false);
  };

  const handleDsoTypeChange = (token: string) => {
    const selected = dsoTypes.find(d => (d.token || '__real__') === token) || null;
    setSelectedDsoType(selected);
    setTestResult(null);

    if (selected && selected.type === 'MOCK') {
      setFormData({
        label: selected.label,
        baseUrl: selected.fields.baseUrl?.default || 'http://mock',
        authEmail: formData.authEmail || 'dso@platform.local',
        authPassword: selected.fields.authPassword?.default || selected.token || '',
        tariffUrl: selected.fields.tariffUrl?.default || '',
        energyUrl: selected.fields.energyUrl?.default || '',
      });
      setSelectedRegions(selected.regions || []);
    } else {
      setFormData({
        label: '',
        baseUrl: '',
        authEmail: formData.authEmail || 'dso@platform.local',
        authPassword: '',
        tariffUrl: '',
        energyUrl: '',
      });
      setSelectedRegions([]);
    }
  };

  const runTestConnection = async () => {
    if (!formData.baseUrl || !formData.authPassword) {
      toast.error('URL de connexion et token sont requis');
      setTestResult({ isValid: false, message: 'Champs requis manquants' });
      return false;
    }

    setIsTesting(true);
    try {
      const response = await fetch('/api/dso-connection/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: formData.baseUrl,
          token: formData.authPassword,
          tariffUrl: formData.tariffUrl,
          energyUrl: formData.energyUrl,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.isValid) {
        const msg = data?.message || 'Connexion invalide';
        setTestResult({ isValid: false, message: msg });
        toast.error(msg);
        return false;
      }

      const msg = data?.message || 'Connexion valide';
      setTestResult({ isValid: true, message: msg, dsoLabel: data?.dsoLabel });
      toast.success('Connexion testée avec succès');
      return true;
    } catch {
      setTestResult({ isValid: false, message: 'Erreur de connexion' });
      toast.error('Erreur lors du test de connexion');
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  // Create DSO connection
  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      dsoApi.createConnection({
        label: data.label || testResult?.dsoLabel || '',
        baseUrl: data.baseUrl,
        authEmail: data.authEmail,
        authPassword: data.authPassword,
        tariffUrl: data.tariffUrl || null,
        energyUrl: data.energyUrl || null,
        regions: selectedRegions,
      } as any),
    onSuccess: () => {
      toast.success('DSO Connection créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
    },
  });

  // Delete DSO connection
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dsoApi.deleteConnection(id),
    onSuccess: () => {
      toast.success('DSO Connection supprimée');
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la suppression');
    },
  });

  // Update DSO connection
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DsoConnection> }) =>
      dsoApi.updateConnection(id, data),
    onSuccess: () => {
      toast.success('Connexion mise à jour');
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
      resetForm();
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    },
  });

  // Toggle DSO connection active/pause
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      dsoApi.toggleConnection(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors du changement de statut');
    },
  });

  // Sync sites from DSO
  const syncMutation = useMutation({
    mutationFn: (id: string) => dsoApi.syncSites(id),
    onSuccess: (data: any) => {
      toast.success(`Sync terminée : ${data?.createdCount ?? 0}/${data?.sitesCount ?? 0} sites créés`);
      queryClient.invalidateQueries({ queryKey: ['dso-connections'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Erreur lors de la synchronisation des sites');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.baseUrl || !formData.authEmail || !formData.authPassword) {
      toast.error('Tous les champs sont requis');
      return;
    }

    const ok = await runTestConnection();
    if (!ok) return;

    if (editConnection) {
      updateMutation.mutate({
        id: editConnection.id,
        data: {
          label: formData.label,
          baseUrl: formData.baseUrl,
          authEmail: formData.authEmail,
          tariffUrl: formData.tariffUrl || null,
          energyUrl: formData.energyUrl || null,
          authPassword: formData.authPassword,
        } as any,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<DsoConnection | null>(null);

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div />
        <Dialog
  open={isFormOpen}
  onOpenChange={(open) => {
    setIsFormOpen(open);
    if (!open) resetForm();
  }}
>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nouvelle Connexion DSO
    </Button>
  </DialogTrigger>

  <DialogContent className="w-[95vw] max-w-[520px] max-h-[90vh] p-0 overflow-hidden flex flex-col">

    {/* HEADER */}
    <div className="px-6 pt-6 pb-2 border-b shrink-0">
      <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
        {editConnection ? 'Modifier Connexion DSO' : 'Nouvelle Connexion DSO'}
      </DialogTitle>
      <DialogDescription className="text-sm text-gray-500">
        {editConnection
          ? 'Modifiez les paramètres de connexion'
          : 'Sélectionnez un DSO puis configurez la connexion'}
      </DialogDescription>
    </div>

    {/* FORM */}
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">

      {/* BODY SCROLL */}
      <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-5">

        {/* DSO TYPE DROPDOWN */}
        {!editConnection && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Type de DSO
            </label>
            <div className="relative">
              <select
                value={selectedDsoType ? (selectedDsoType.token || '__real__') : ''}
                onChange={(e) => handleDsoTypeChange(e.target.value)}
                className="w-full h-11 px-4 pr-10 border rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white appearance-none cursor-pointer"
              >
                <option value="">— Choisir un DSO —</option>
                <optgroup label="DSO disponibles">
                  {dsoTypes.filter(d => d.type === 'MOCK').map(d => (
                    <option key={d.token} value={d.token || ''}>
                      {d.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Autre">
                  {dsoTypes.filter(d => d.type === 'REAL').map((d, i) => (
                    <option key={`real-${i}`} value="__real__">
                      {d.label}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* REGIONS — sélection manuelle */}
        {selectedDsoType && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Régions couvertes
            </label>
            <div className="flex flex-wrap gap-2">
              {(dsoTypesData?.allRegions || []).map((region: string) => {
                const isSelected = selectedRegions.includes(region);
                const isSuggested = selectedDsoType.regions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => {
                      setSelectedRegions(prev =>
                        isSelected ? prev.filter(r => r !== region) : [...prev, region]
                      );
                    }}
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-200 dark:border-blue-600'
                        : isSuggested
                          ? 'bg-blue-50/50 text-blue-500 border-blue-200 border-dashed dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800'
                          : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:text-gray-400 dark:border-zinc-700'
                    }`}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                    {isSelected && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedRegions.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Sélectionnez au moins une région
              </p>
            )}
          </div>
        )}

        {/* LABEL */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Nom du DSO
          </label>
          <input
            type="text"
            placeholder="Ex: Enedis, GEG, UEM Metz..."
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            className="w-full h-11 px-4 border rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
            readOnly={!!selectedDsoType && selectedDsoType.type === 'MOCK'}
          />
        </div>

        {/* BASE URL — visible si REAL ou pas de sélection */}
        {(!selectedDsoType || selectedDsoType.type === 'REAL' || !selectedDsoType.fields.baseUrl?.hidden) && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            URL de connexion au DSO
          </label>
          <input
            type="url"
            placeholder="http://localhost:9999"
            value={formData.baseUrl}
            onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
            required
            className="w-full h-11 px-4 border rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
          />
        </div>
        )}

        {/* GRID URLs — toujours visible, readOnly si MOCK */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Tariff URL</label>
            <input
              type="url"
              placeholder="http://localhost:9999/tariff"
              value={formData.tariffUrl}
              onChange={(e) => setFormData({ ...formData, tariffUrl: e.target.value })}
              readOnly={!!selectedDsoType?.fields.tariffUrl?.readOnly}
              className={`h-11 w-full px-4 border rounded-xl text-gray-900 dark:text-white ${
                selectedDsoType?.fields.tariffUrl?.readOnly
                  ? 'bg-gray-100 dark:bg-zinc-800 cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-900'
              }`}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Energy URL</label>
            <input
              type="url"
              placeholder="http://localhost:9999/energy"
              value={formData.energyUrl}
              onChange={(e) => setFormData({ ...formData, energyUrl: e.target.value })}
              readOnly={!!selectedDsoType?.fields.energyUrl?.readOnly}
              className={`h-11 w-full px-4 border rounded-xl text-gray-900 dark:text-white ${
                selectedDsoType?.fields.energyUrl?.readOnly
                  ? 'bg-gray-100 dark:bg-zinc-800 cursor-not-allowed'
                  : 'bg-white dark:bg-zinc-900'
              }`}
            />
          </div>
        </div>

        {/* TOKEN — visible si REAL */}
        {(!selectedDsoType || selectedDsoType.type === 'REAL' || !selectedDsoType.fields.authPassword?.hidden) && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Token d’authentification
          </label>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre token API"
              value={formData.authPassword}
              onChange={(e) => setFormData({ ...formData, authPassword: e.target.value })}
              required
              className="w-full h-11 px-4 pr-12 border rounded-xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-white"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        )}

        {/* TEST */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={runTestConnection}
          disabled={isTesting || !formData.baseUrl || !formData.authPassword}
          isLoading={isTesting}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Tester la connexion
        </Button>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white dark:bg-zinc-950 shrink-0">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsFormOpen(false);
            resetForm();
          }}
        >
          Annuler
        </Button>

        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          isLoading={createMutation.isPending || updateMutation.isPending}
        >
          <Zap className="h-4 w-4 mr-2" />
          {editConnection ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>

    </form>
  </DialogContent>
</Dialog>
      </div>

      {/* Error Banner */}
      {error && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">Erreur lors du chargement des connexions DSO</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Cards */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" />
            <p>Chargement des connexions...</p>
          </CardContent>
        </Card>
      ) : connections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucune connexion DSO
            </h3>
            <p className="text-muted-foreground mb-4">
              Connectez-vous à un distributeur d&apos;énergie pour synchroniser vos données
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une connexion
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {connections.map((connection) => {
            const isActive = (connection as any).isActive;
            return (
              <Card key={connection.id} className="overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    {/* Left: Icon + Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
                            : 'bg-muted'
                        }`}
                      >
                        <Zap
                          className={`h-6 w-6 ${
                            isActive ? 'text-amber-500' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {connection.label || 'Connexion DSO'}
                          </h3>
                          <StatusDot status={isActive ? 'online' : 'offline'} />
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Globe className="h-3.5 w-3.5" />
                          <span>{connection.baseUrl}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {connection.lastSyncAt && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              Sync: {new Date(connection.lastSyncAt).toLocaleString('fr-FR')}
                            </span>
                          )}
                          {connection.siteLinks && connection.siteLinks.length > 0 && (
                            <span className="flex items-center gap-1.5">
                              <Link2 className="h-3.5 w-3.5" />
                              {connection.siteLinks.length} site(s) lié(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status Badge */}
                    <Badge variant={isActive ? 'success' : 'warning'}>
                      {isActive ? 'Actif' : 'Pause'}
                    </Badge>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditConnection(connection);
                        setFormData({
                          label: connection.label || '',
                          baseUrl: connection.baseUrl || '',
                          authEmail: connection.authEmail || '',
                          authPassword: '',
                          tariffUrl: (connection as any).tariffUrl || '',
                          energyUrl: (connection as any).energyUrl || '',
                        });
                        setTestResult(null);
                        setIsFormOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncMutation.mutate(connection.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                      {syncMutation.isPending ? 'Sync...' : 'Sync Sites'}
                    </Button>

                    <Button
                      variant={isActive ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => {
                        toggleMutation.mutate({
                          id: connection.id,
                          isActive: !isActive,
                        });
                      }}
                      disabled={toggleMutation.isPending}
                    >
                      {isActive ? (
                        <>
                          <PowerOff className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Power className="h-4 w-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConnectionToDelete(connection);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la connexion DSO"
        description={`Êtes-vous sûr de vouloir supprimer la connexion "${connectionToDelete?.label || connectionToDelete?.baseUrl || 'DSO'}" ? Les liaisons de sites associées seront également supprimées.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
        onConfirm={() => {
          if (connectionToDelete) {
            deleteMutation.mutate(connectionToDelete.id);
            setDeleteDialogOpen(false);
            setConnectionToDelete(null);
          }
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
