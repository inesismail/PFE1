'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header } from '@/components/layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
  ConfirmDialog,
} from '@/components/ui';
import { regionsApi, signalsApi, type EdfRegion, type Signal } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database,
} from 'lucide-react';

export default function RegionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState<EdfRegion | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<EdfRegion | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    apiEndpoint: 'https://opendata-edf-sei.opendatasoft.com/api/records/1.0/search/',
    datasetId: '',
  });

  // Queries
  const { data: regions, isLoading } = useQuery({
    queryKey: ['edf-regions'],
    queryFn: regionsApi.getAll,
  });

  const { data: latestSignals } = useQuery({
    queryKey: ['latest-signals'],
    queryFn: signalsApi.getLatest,
  });

  // Mutations
  const seedMutation = useMutation({
    mutationFn: regionsApi.seed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edf-regions'] }),
  });

  const createMutation = useMutation({
    mutationFn: regionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edf-regions'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EdfRegion> }) =>
      regionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edf-regions'] });
      setEditingRegion(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: regionsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['edf-regions'] }),
  });

  const fetchSignalsMutation = useMutation({
    mutationFn: signalsApi.fetchAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['latest-signals'] }),
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      apiEndpoint: 'https://opendata-edf-sei.opendatasoft.com/api/records/1.0/search/',
      datasetId: '',
    });
  };

  const handleEdit = (region: EdfRegion) => {
    setEditingRegion(region);
    setFormData({
      code: region.code,
      name: region.name,
      apiEndpoint: region.apiEndpoint,
      datasetId: region.datasetId,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingRegion) {
      updateMutation.mutate({ id: editingRegion.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getSignalForRegion = (code: string): Signal | undefined => {
    return latestSignals?.[code.toUpperCase()];
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Régions EDF"
        description="Gérez les régions EDF SEI pour les signaux réseau"
      />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {(!regions || regions.length === 0) && (
            <Button
              onClick={() => seedMutation.mutate()}
              isLoading={seedMutation.isPending}
            >
              <Database className="h-4 w-4 mr-2" />
              Initialiser les régions
            </Button>
          )}

          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une région
          </Button>

          <Button
            variant="secondary"
            onClick={() => fetchSignalsMutation.mutate()}
            isLoading={fetchSignalsMutation.isPending}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir les signaux
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingRegion ? 'Modifier la région' : 'Nouvelle région EDF'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Code"
                  placeholder="CORSE"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  disabled={!!editingRegion}
                />
                <Input
                  label="Nom"
                  placeholder="Corse"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <Input
                label="Endpoint API"
                placeholder="https://opendata-edf-sei.opendatasoft.com/api/records/1.0/search/"
                value={formData.apiEndpoint}
                onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
              />
              <Input
                label="Dataset ID"
                placeholder="signal-corse, signal-martinique, etc."
                value={formData.datasetId}
                onChange={(e) => setFormData({ ...formData, datasetId: e.target.value })}
                helperText="Identifiant du dataset sur l'API Open Data EDF SEI"
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingRegion(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
                disabled={!formData.code || !formData.name}
              >
                {editingRegion ? 'Mettre à jour' : 'Créer'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <Card className="col-span-full">
              <CardContent className="py-8 text-center text-muted-foreground">
                Chargement...
              </CardContent>
            </Card>
          ) : regions && regions.length > 0 ? (
            regions.map((region) => {
              const signal = getSignalForRegion(region.code);
              const isFavorable = signal?.value === 1;

              return (
                <Card key={region.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            signal
                              ? isFavorable
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-muted'
                          }`}
                        >
                          <MapPin
                            className={`h-6 w-6 ${
                              signal
                                ? isFavorable
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">{region.name}</h3>
                          <p className="text-sm text-muted-foreground">{region.code}</p>
                        </div>
                      </div>

                      <Badge variant={region.isActive ? 'success' : 'default'}>
                        {region.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>

                    {/* Signal Status */}
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        signal
                          ? isFavorable
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-muted border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {signal ? (
                            isFavorable ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )
                          ) : (
                            <AlertCircle className="h-5 w-5 text-gray-400" />
                          )}
                          <span
                            className={`font-medium ${
                              signal
                                ? isFavorable
                                  ? 'text-green-700 dark:text-green-300'
                                  : 'text-red-700 dark:text-red-300'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {signal
                              ? isFavorable
                                ? 'Signal Favorable'
                                : 'Signal Défavorable'
                              : 'Pas de signal'}
                          </span>
                        </div>
                        {signal && (
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(signal.time)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sites Count */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>Sites assignés</span>
                      <span className="font-medium text-foreground">{region._count?.sites || 0}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(region)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRegionToDelete(region);
                          setDeleteDialogOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucune région configurée
                </h3>
                <p className="text-muted-foreground mb-4">
                  Initialisez les régions EDF SEI pour commencer
                </p>
                <Button onClick={() => seedMutation.mutate()} isLoading={seedMutation.isPending}>
                  <Database className="h-4 w-4 mr-2" />
                  Initialiser les régions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-medium mb-3 text-foreground">À propos des signaux EDF</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">Signal = 1 (Favorable)</p>
                  <p className="text-green-700 dark:text-green-400">
                    Le réseau peut supporter la charge maximale. Les limites des sites sont
                    restaurées à leur capacité maximale.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">Signal = 0 (Défavorable)</p>
                  <p className="text-red-700 dark:text-red-400">
                    Le réseau est sous tension. Les limites des sites sont réduites selon leur
                    configuration pour alléger la charge.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Region Confirmation Dialog */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Supprimer la région"
          description={`Êtes-vous sûr de vouloir supprimer la région "${regionToDelete?.name}" ? Les sites assignés à cette région seront désassignés.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={() => {
            if (regionToDelete) {
              deleteMutation.mutate(regionToDelete.id);
              setDeleteDialogOpen(false);
              setRegionToDelete(null);
            }
          }}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
