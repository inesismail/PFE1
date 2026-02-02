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
  const [formData, setFormData] = useState({
    actorName: '',
    baseUrl: 'https://api.wattzhub.com/v1/api',
    authUrl: 'https://api.wattzhub.com/v1/auth',
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
      // First create the actor if needed
      let actorId: string;
      
      const existingActor = actors?.find((a) => a.name === formData.actorName);
      if (existingActor) {
        actorId = existingActor.id;
      } else {
        // Get CPO actor type
        const types = await actorsApi.getTypes();
        const cpoType = types.find((t) => t.code === 'CPO');
        if (!cpoType) throw new Error('Type CPO non trouvé');

        // Create actor
        const newActor = await actorsApi.create({
          actorTypeId: cpoType.id,
          code: formData.actorName.toUpperCase().replace(/\s+/g, '_'),
          name: formData.actorName,
        });
        actorId = newActor.id;
      }

      // Connect to CPO
      return cpoApi.connect({
        actorId,
        baseUrl: formData.baseUrl,
        authUrl: formData.authType === 'credentials' ? formData.authUrl : undefined,
        tenant: formData.authType === 'credentials' ? formData.tenant : undefined,
        authType: formData.authType,
        email: formData.authType === 'credentials' ? formData.email : undefined,
        password: formData.authType === 'credentials' ? formData.password : undefined,
        accessToken: formData.authType === 'token' ? formData.accessToken : undefined,
        fetchIntervalMinutes: formData.fetchIntervalMinutes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cpo-connections'] });
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setShowForm(false);
      resetForm();
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
              <Input
                label="Nom de l'acteur"
                placeholder="Ex: WattzHub Production"
                value={formData.actorName}
                onChange={(e) => setFormData({ ...formData, actorName: e.target.value })}
              />

              <Input
                label="URL de l'API"
                placeholder="https://api.wattzhub.com/v1/api"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                helperText="URL de base pour les appels API (ex: /v1/api)"
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
                    placeholder="https://api.wattzhub.com/v1/auth"
                    value={formData.authUrl}
                    onChange={(e) => setFormData({ ...formData, authUrl: e.target.value })}
                    helperText="URL pour l'authentification (ex: /v1/auth)"
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
                disabled={!formData.actorName}
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
