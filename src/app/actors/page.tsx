'use client';

import { ActorImplementation, PluginMetadata, actorsApi } from '@/lib/api';
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
} from '@/components/ui';
import {
  Box,
  ChevronRight,
  Edit2,
  Plug,
  Plus,
  Settings,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Header } from '@/components/layout';
import Link from 'next/link';
import { useState } from 'react';

export default function ActorsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingActor, setEditingActor] = useState<string | null>(null);
  const [selectedActor, setSelectedActor] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    actorTypeId: '',
    code: '',
    name: '',
  });

  // Queries
  const { data: actorTypes } = useQuery({
    queryKey: ['actor-types'],
    queryFn: actorsApi.getTypes,
  });

  const { data: actors, isLoading } = useQuery({
    queryKey: ['actors'],
    queryFn: () => actorsApi.getAll(),
  });

  const { data: implementations } = useQuery({
    queryKey: ['actor-implementations', selectedActor],
    queryFn: () => actorsApi.getImplementations(selectedActor!),
    enabled: !!selectedActor,
  });

  const { data: availableImplementations } = useQuery({
    queryKey: ['available-implementations', selectedActor],
    queryFn: () => actorsApi.getAvailableImplementations(selectedActor!),
    enabled: !!selectedActor,
  });

  // Mutations
  const createActorMutation = useMutation({
    mutationFn: actorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateActorMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      actorsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setEditingActor(null);
      resetForm();
    },
  });

  const deleteActorMutation = useMutation({
    mutationFn: actorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actors'] });
      setSelectedActor(null);
    },
  });

  const enableImplMutation = useMutation({
    mutationFn: ({ actorId, code }: { actorId: string; code: string }) =>
      actorsApi.enableImplementation(actorId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actor-implementations'] });
      queryClient.invalidateQueries({ queryKey: ['available-implementations'] });
    },
    onError: (error: Error) => {
      console.error('Enable implementation error:', error);
      alert(`Erreur: ${error.message}`);
    },
  });

  const disableImplMutation = useMutation({
    mutationFn: ({ actorId, code }: { actorId: string; code: string }) =>
      actorsApi.disableImplementation(actorId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actor-implementations'] });
      queryClient.invalidateQueries({ queryKey: ['available-implementations'] });
    },
    onError: (error: Error) => {
      console.error('Disable implementation error:', error);
      alert(`Erreur: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({ actorTypeId: '', code: '', name: '' });
    setEditingActor(null);
  };

  const handleEditActor = (actor: typeof selectedActorData) => {
    if (actor) {
      setEditingActor(actor.id);
      setFormData({
        actorTypeId: actor.actorType?.id || '',
        code: actor.code,
        name: actor.name,
      });
    }
  };

  const getActorTypeIcon = (code: string) => {
    switch (code) {
      case 'CPO':
        return <Plug className="h-5 w-5" />;
      case 'PROVIDER':
        return <Zap className="h-5 w-5" />;
      default:
        return <Box className="h-5 w-5" />;
    }
  };

  const selectedActorData = actors?.find((a) => a.id === selectedActor);

  // Filter available implementations to exclude already enabled ones
  const enabledCodes = implementations?.map(i => i.implementation?.code) || [];
  const filteredAvailableImplementations = (availableImplementations as PluginMetadata[] | undefined)?.filter(
    (plugin) => !enabledCodes.includes(plugin.id)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header
        title="Acteurs"
        description="Gérez les acteurs et leurs implémentations (plugins)"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actors List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Liste des Acteurs</h2>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Nouveau
              </Button>
            </div>

            {/* Create Actor Form */}
            {showForm && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Nouvel Acteur</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Select
                    label="Type d'acteur"
                    options={
                      actorTypes?.map((t) => ({ value: t.id, label: t.name })) || []
                    }
                    value={formData.actorTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, actorTypeId: e.target.value })
                    }
                    placeholder="Sélectionner..."
                  />
                  <Input
                    label="Code"
                    placeholder="WATTZHUB_PROD"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                  />
                  <Input
                    label="Nom"
                    placeholder="WattzHub Production"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => createActorMutation.mutate(formData)}
                    isLoading={createActorMutation.isPending}
                    disabled={!formData.actorTypeId || !formData.code || !formData.name}
                  >
                    Créer
                  </Button>
                </CardFooter>
              </Card>
            )}

            {/* Actors List */}
            <div className="space-y-2">
              {isLoading ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    Chargement...
                  </CardContent>
                </Card>
              ) : actors && actors.length > 0 ? (
                actors.map((actor) => (
                  <Card
                    key={actor.id}
                    className={`transition-all cursor-pointer hover:border-primary/50 ${
                      selectedActor === actor.id
                        ? 'border-primary ring-1 ring-primary'
                        : ''
                    }`}
                    onClick={() => setSelectedActor(actor.id)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              actor.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {getActorTypeIcon(actor.actorType?.code)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{actor.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {actor.actorType?.name} • {actor.code}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">Aucun acteur configuré</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setShowForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Créer un acteur
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Actor Details & Implementations */}
          <div className="lg:col-span-2">
            {selectedActor && selectedActorData ? (
              <div className="space-y-6">
                {/* Actor Header */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground">
                          {getActorTypeIcon(selectedActorData.actorType?.code)}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            {selectedActorData.name}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {selectedActorData.actorType?.name} • {selectedActorData.code}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={selectedActorData.isActive ? 'success' : 'default'}>
                              {selectedActorData.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                            {selectedActorData.cpoConnection && (
                              <Badge variant="info">Connecté à WattzHub</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditActor(selectedActorData)}
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        {selectedActorData.actorType?.code === 'CPO' &&
                          !selectedActorData.cpoConnection && (
                            <Link href="/cpo">
                              <Button variant="outline" size="sm">
                                <Plug className="h-4 w-4 mr-1" />
                                Connecter CPO
                              </Button>
                            </Link>
                          )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialogOpen(true)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delete Actor Confirmation Dialog */}
                <ConfirmDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                  title="Supprimer l'acteur"
                  description={`Êtes-vous sûr de vouloir supprimer l'acteur "${selectedActorData.name}" ? Cette action est irréversible et supprimera également toutes les données associées.`}
                  confirmText="Supprimer"
                  cancelText="Annuler"
                  variant="danger"
                  onConfirm={() => {
                    deleteActorMutation.mutate(selectedActorData.id);
                    setDeleteDialogOpen(false);
                  }}
                  isLoading={deleteActorMutation.isPending}
                />

                {/* Edit Actor Form */}
                {editingActor === selectedActorData.id && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Modifier l&apos;acteur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        label="Code"
                        value={formData.code}
                        disabled
                        helperText="Le code ne peut pas être modifié"
                      />
                      <Input
                        label="Nom"
                        placeholder="WattzHub Production"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingActor(null);
                          resetForm();
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          updateActorMutation.mutate({
                            id: selectedActorData.id,
                            data: { name: formData.name },
                          })
                        }
                        isLoading={updateActorMutation.isPending}
                        disabled={!formData.name}
                      >
                        Enregistrer
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {/* Implementations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Implémentations (Plugins)
                    </CardTitle>
                    <CardDescription>
                      Activez ou désactivez les plugins pour cet acteur
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Active Implementations */}
                      {implementations && implementations.length > 0 ? (
                        implementations.map((impl: ActorImplementation) => (
                          <div
                            key={impl.id}
                            className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <Zap className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {impl.implementation?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  v{impl.implementation?.version} •{' '}
                                  {impl.implementation?.implementationType?.name}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (selectedActor && impl.implementation?.code) {
                                  disableImplMutation.mutate({
                                    actorId: selectedActor,
                                    code: impl.implementation.code,
                                  });
                                }
                              }}
                              className="text-green-500 hover:text-green-600"
                            >
                              <ToggleRight className="h-6 w-6" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Aucune implémentation active
                        </p>
                      )}

                      {/* Available Implementations */}
                      {filteredAvailableImplementations.length > 0 && (
                          <>
                            <div className="border-t border-border my-4" />
                            <p className="text-sm font-medium text-foreground mb-2">
                              Disponibles
                            </p>
                            {filteredAvailableImplementations.map((impl: PluginMetadata) => (
                              <div
                                key={impl.id}
                                className="flex items-center justify-between p-4 bg-muted border border-border rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{impl.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      v{impl.version} • {impl.type}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    enableImplMutation.mutate({
                                      actorId: selectedActor,
                                      code: impl.id,
                                    })
                                  }
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <ToggleLeft className="h-6 w-6" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Sélectionnez un acteur
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Cliquez sur un acteur dans la liste pour voir ses détails et gérer ses
                    implémentations
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
