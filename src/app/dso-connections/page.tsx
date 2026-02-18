'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dsoApi, DsoConnection } from '@/lib/api';
import { toast } from 'sonner';
import { Trash2, Plus, RefreshCw, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type FormData = {
  baseUrl: string;
  authEmail: string;
  authPassword: string;
  tariffUrl: string;
  energyUrl: string;
};

export default function DsoConnectionsPage() {
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editConnection, setEditConnection] = useState<DsoConnection | null>(null);

  const [formData, setFormData] = useState<FormData>({
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
        baseUrl: data.baseUrl,
        authEmail: data.authEmail,
        authPassword: data.authPassword,
        // ⚠️ IMPORTANT: ton dsoApi.createConnection doit accepter ces champs (patch lib/api.ts)
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

  // Update DSO connection (edit / toggle active)
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">DSO Connections</h1>

        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Nouvelle Connexion DSO
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editConnection ? 'Modifier Connexion DSO' : 'Nouvelle Connexion DSO'}</DialogTitle>
              <DialogDescription>Configurez les paramètres de connexion à votre DSO</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">URL de connexion au DSO</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL pour les tarifs</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999/tariff"
                  value={formData.tariffUrl}
                  onChange={(e) => setFormData({ ...formData, tariffUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de l'énergie</label>
                <input
                  type="url"
                  placeholder="http://localhost:9999/energy"
                  value={formData.energyUrl}
                  onChange={(e) => setFormData({ ...formData, energyUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Token d'authentification</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre token API"
                    value={formData.authPassword}
                    onChange={(e) => setFormData({ ...formData, authPassword: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-md flex items-start gap-2 ${
                    testResult.isValid
                      ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700'
                      : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700'
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

              <button
                type="button"
                onClick={runTestConnection}
                disabled={isTesting || !formData.baseUrl || !formData.authPassword}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
              >
                {isTesting ? 'Test en cours...' : 'Tester la connexion'}
              </button>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending || !testResult?.isValid}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Sauvegarde...'
                    : editConnection
                    ? 'Mettre à jour'
                    : 'Créer'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          Erreur lors du chargement des connexions
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      ) : connections.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Aucune connexion DSO configurée. Cliquez sur "Nouvelle Connexion DSO" pour en ajouter une.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="rounded-lg border p-4 hover:shadow-md transition-shadow dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{connection.baseUrl}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email: {connection.authEmail}</p>

                  {connection.lastSyncAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dernière synchronisation: {new Date(connection.lastSyncAt).toLocaleString('fr-FR')}
                    </p>
                  )}

                  {connection.siteLinks && connection.siteLinks.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {connection.siteLinks.length} site(s) lié(s)
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                    onClick={() => {
                      window.location.href = `/dso-connections/${connection.id}/site-links`;
                    }}
                  >
                    <RefreshCw className="h-4 w-4 inline-block mr-1" />
                    Sync Sites
                  </button>

                  <button
                    className="px-3 py-2 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    onClick={() => {
                      setEditConnection(connection);
                      setFormData({
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
                    Modifier
                  </button>

                  <button
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      (connection as any).isActive
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => {
                      updateMutation.mutate({
                        id: connection.id,
                        data: { isActive: !(connection as any).isActive },
                      });
                    }}
                    disabled={updateMutation.isPending}
                  >
                    {(connection as any).isActive ? 'Actif' : 'Pause'}
                  </button>

                  <button
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette connexion ?')) {
                        deleteMutation.mutate(connection.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
