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

  const [formData, setFormData] = useState<FormData>({
    label: '',
    baseUrl: '',
    authEmail: 'dso@platform.local',
    authPassword: '',
    tariffUrl: '',
    energyUrl: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<{ isValid: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

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
    setIsTesting(false);
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
      setTestResult({ isValid: true, message: msg });
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
        label: data.label,
        baseUrl: data.baseUrl,
        authEmail: data.authEmail,
        authPassword: data.authPassword,
        tariffUrl: data.tariffUrl || null,
        energyUrl: data.energyUrl || null,
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

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editConnection ? 'Modifier Connexion DSO' : 'Nouvelle Connexion DSO'}</DialogTitle>
              <DialogDescription>Configurez les paramètres de connexion à votre DSO</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Nom du DSO</label>
                <input
                  type="text"
                  placeholder="Ex: Enedis, GEG, UEM Metz..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">URL de connexion au DSO</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">URL pour les tarifs</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999/tariff"
                  value={formData.tariffUrl}
                  onChange={(e) => setFormData({ ...formData, tariffUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">URL de l&apos;énergie</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999/energy"
                  value={formData.energyUrl}
                  onChange={(e) => setFormData({ ...formData, energyUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Token d&apos;authentification</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre token API"
                    value={formData.authPassword}
                    onChange={(e) => setFormData({ ...formData, authPassword: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg flex items-start gap-2 ${
                    testResult.isValid
                      ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                  }`}
                >
                  {testResult.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm font-medium ${
                      testResult.isValid ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
                    }`}
                  >
                    {testResult.message}
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={runTestConnection}
                disabled={isTesting || !formData.baseUrl || !formData.authPassword}
                isLoading={isTesting}
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                {isTesting ? 'Test en cours...' : 'Tester la connexion'}
              </Button>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
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
                  disabled={createMutation.isPending || updateMutation.isPending || !testResult?.isValid}
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
                      onClick={() => {
                        window.location.href = `/dso-connections/${connection.id}/site-links`;
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync Sites
                    </Button>

                    <Button
                      variant={isActive ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => {
                        updateMutation.mutate({
                          id: connection.id,
                          data: { isActive: !isActive },
                        });
                      }}
                      disabled={updateMutation.isPending}
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
