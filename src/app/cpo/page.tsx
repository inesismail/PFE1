'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Input,
  Select,
  StatusDot,
} from '@/components/ui';
import {
  Clock,
  Edit2,
  Plug,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { actorsApi, cpoApi, type CpoConnection } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/layout';
import { formatRelativeTime } from '@/lib/utils';
import { useState } from 'react';

const FETCH_INTERVAL_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 heure' },
];

export default function CpoPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<CpoConnection | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<CpoConnection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    actorName: '',
    baseUrl: 'https://beta.cpo.server.wattzhub.com/v1/api',
    authUrl: 'https://beta.cpo.server.wattzhub.com/v1/api/auth',
    tenant: '',
    authType: 'credentials' as 'credentials' | 'token',
    email: '',
    password: '',
    accessToken: '',
    fetchIntervalMinutes: 15,
  });

  // Queries
  const { data: connections, isLoading } = useQuery({
    queryKey: ['cpo-connections'],
    queryFn: cpoApi.getAll,
  });

  const { data: actors } = useQuery({
    queryKey: ['actors', 'CPO'],
    queryFn: () => actorsApi.getAll('CPO'),
  });

  // Mutations
  const connectMutation = useMutation({
    mutationFn: async () => {
      setErrorMessage(null);

      // Find the selected actor
      const selectedActor = actors?.find((a) => a.id === formData.actorName);
      
      if (!selectedActor) {
        throw new Error('Veuillez sélectionner un acteur CPO');
      }
      
      const actorId = selectedActor.id;

      // Validate required fields
      if (formData.authType === 'credentials') {
        if (!formData.email || !formData.password) {
          throw new Error('Email et mot de passe sont requis pour l\'authentification par identifiants');
        }
      } else {
        if (!formData.accessToken) {
          throw new Error('Token d\'accès requis pour l\'authentification par token');
        }
      }

      // Connect to CPO
      const connectData: any = {
        actorId,
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        fetchIntervalMinutes: formData.fetchIntervalMinutes,
      };

      // Only add optional fields if they have values
      if (formData.authType === 'credentials') {
        connectData.email = formData.email;
        connectData.password = formData.password;
        if (formData.authUrl) connectData.authUrl = formData.authUrl;
        if (formData.tenant) connectData.tenant = formData.tenant;
      } else {
        connectData.accessToken = formData.accessToken;
      }

      return cpoApi.connect(connectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cpo-connections'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setShowForm(false);
      resetForm();
      setErrorMessage(null);
    },
    onError: (error: any) => {
      let message = 'Erreur inconnue';
      
      if (error instanceof Error) {
        message = error.message;
      } else if (error?.response?.status === 409) {
        message = `Conflit: Un acteur existe déjà avec ce nom ou code.`;
        if (error?.response?.data?.message) {
          message += ` (${error.response.data.message})`;
        }
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
      console.error('Connection error:', error);
    },
  });

  const syncSitesMutation = useMutation({
    mutationFn: (connectionId: string) => cpoApi.syncSites(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cpo-connections'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  const updateIntervalMutation = useMutation({
    mutationFn: ({ id, interval }: { id: string; interval: number }) =>
      cpoApi.updateFetchInterval(id, interval),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cpo-connections'] }),
  });

  const toggleFetchMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      cpoApi.updateFetchEnabled(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cpo-connections'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cpoApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cpo-connections'] }),
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { baseUrl?: string; authUrl?: string; tenant?: string } }) =>
      cpoApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cpo-connections'] });
      setEditingConnection(null);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      actorName: '',
      baseUrl: 'https://api.wattzhub.com/v1/api',
      authUrl: 'https://api.wattzhub.com/v1/auth',
      tenant: '',
      authType: 'credentials',
      email: '',
      password: '',
      accessToken: '',
      fetchIntervalMinutes: 15,
    });
    setEditingConnection(null);
  };

  const handleEditConnection = (connection: CpoConnection) => {
    setEditingConnection(connection);
    setFormData({
      actorName: connection.actor?.name || '',
      baseUrl: connection.baseUrl,
      authUrl: connection.authUrl || 'https://api.wattzhub.com/v1/auth',
      tenant: '',
      authType: connection.authType,
      email: connection.email || '',
      password: '',
      accessToken: '',
      fetchIntervalMinutes: connection.fetchIntervalMinutes,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Connexions CPO"
        description="Gérez vos connexions avec les opérateurs de bornes de recharge"
      />

      <div className="p-6 space-y-6">
        {/* Add Connection Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Connexion
          </Button>
        )}

        {/* Connection Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Connexion CPO</CardTitle>
              <CardDescription>
                Connectez-vous à WattzHub pour synchroniser vos sites de recharge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-red-700 font-medium">Erreur lors de la connexion:</p>
                      <p className="text-sm text-red-600 mt-1 font-mono">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(errorMessage);
                      }}
                      className="text-red-600 hover:text-red-700 text-xs whitespace-nowrap"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              )}
              <Select
                label="Acteur CPO"
                placeholder="Sélectionner un acteur..."
                value={formData.actorName}
                onChange={(e) => setFormData({ ...formData, actorName: e.target.value })}
                options={
                  actors?.map((actor) => ({
                    value: actor.id,
                    label: actor.name,
                  })) || []
                }
                helperText={!actors || actors.length === 0 ? '❌ Créez d\'abord un acteur CPO dans la page Acteurs' : undefined}
              />

              <Input
                label="URL de l'API"
                placeholder="https://beta.cpo.server.wattzhub.com/v1"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                helperText="URL de base pour les appels API (ex: https://beta.cpo.server.wattzhub.com/v1)"
              />

              <Select
                label="Type d'authentification"
                options={[
                  { value: 'credentials', label: 'Email / Mot de passe' },
                  { value: 'token', label: 'Token d\'accès' },
                ]}
                value={formData.authType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    authType: e.target.value as 'credentials' | 'token',
                  })
                }
              />

              {formData.authType === 'credentials' ? (
                <>
                  <Input
                    label="URL d'authentification"
                    placeholder="https://beta.cpo.server.wattzhub.com/v1/api/auth"
                    value={formData.authUrl}
                    onChange={(e) => setFormData({ ...formData, authUrl: e.target.value })}
                    helperText="URL pour l'authentification (ex: https://beta.cpo.server.wattzhub.com/v1/api/auth)"
                  />
                  <Input
                    label="Tenant"
                    placeholder="ex: mon-tenant"
                    value={formData.tenant}
                    onChange={(e) => setFormData({ ...formData, tenant: e.target.value })}
                    helperText="Identifiant du tenant WattzHub"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    label="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </>
              ) : (
                <Input
                  label="Token d'accès"
                  type="password"
                  placeholder="Votre token API"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                />
              )}

              <Select
                label="Intervalle de récupération des signaux"
                options={FETCH_INTERVAL_OPTIONS}
                value={formData.fetchIntervalMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, fetchIntervalMinutes: parseInt(e.target.value) })
                }
                helperText="Fréquence de vérification des signaux EDF et mise à jour des limites"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={() => connectMutation.mutate()}
                isLoading={connectMutation.isPending}
                disabled={!formData.actorName || !actors || actors.length === 0}
              >
                <Plug className="h-4 w-4 mr-2" />
                Connecter
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Connections List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Chargement...</CardContent>
            </Card>
          ) : connections && connections.length > 0 ? (
            connections.map((connection) => (
              <Card key={connection.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                          connection.isConnected ? 'bg-green-500/20' : 'bg-muted'
                        }`}
                      >
                        <Plug
                          className={`h-6 w-6 ${
                            connection.isConnected ? 'text-green-500' : 'text-muted-foreground'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {connection.actor?.name || 'Connexion CPO'}
                          </h3>
                          <StatusDot status={connection.isConnected ? 'online' : 'offline'} />
                        </div>
                        <p className="text-sm text-muted-foreground">{connection.baseUrl}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>
                            <Clock className="h-4 w-4 inline mr-1" />
                            Intervalle: {connection.fetchIntervalMinutes} min
                          </span>
                          {connection.lastSyncAt && (
                            <span>Dernier sync: {formatRelativeTime(connection.lastSyncAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={connection.fetchEnabled ? 'success' : 'warning'}>
                        {connection.fetchEnabled ? 'Actif' : 'Pause'}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditConnection(connection)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncSitesMutation.mutate(connection.id)}
                      isLoading={syncSitesMutation.isPending}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sync Sites
                    </Button>

                    <Select
                      options={FETCH_INTERVAL_OPTIONS}
                      value={connection.fetchIntervalMinutes}
                      onChange={(e) =>
                        updateIntervalMutation.mutate({
                          id: connection.id,
                          interval: parseInt(e.target.value),
                        })
                      }
                      className="w-36"
                    />

                    <Button
                      variant={connection.fetchEnabled ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() =>
                        toggleFetchMutation.mutate({
                          id: connection.id,
                          enabled: !connection.fetchEnabled,
                        })
                      }
                    >
                      {connection.fetchEnabled ? (
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

                  {/* Edit Form */}
                  {editingConnection?.id === connection.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      <h4 className="font-medium text-foreground">Modifier la connexion</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="URL de l'API"
                          value={formData.baseUrl}
                          onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                        />
                        <Input
                          label="URL d'authentification"
                          value={formData.authUrl}
                          onChange={(e) => setFormData({ ...formData, authUrl: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingConnection(null);
                            resetForm();
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            updateConnectionMutation.mutate({
                              id: connection.id,
                              data: {
                                baseUrl: formData.baseUrl,
                                authUrl: formData.authUrl,
                              },
                            })
                          }
                          isLoading={updateConnectionMutation.isPending}
                        >
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Plug className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucune connexion CPO
                </h3>
                <p className="text-muted-foreground mb-4">
                  Connectez-vous à WattzHub pour commencer à synchroniser vos sites
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une connexion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Delete Connection Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Supprimer la connexion"
          description={`Êtes-vous sûr de vouloir supprimer la connexion "${connectionToDelete?.actor?.name || 'CPO'}" ? Tous les sites synchronisés seront également supprimés.`}
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
    </div>
  );
}
