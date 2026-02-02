'use client';

import { Bell, Database, Save, Settings, Shield, Zap } from 'lucide-react';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';

import { Header } from '@/components/layout';
import { useState } from 'react';

interface AppSettings {
  refreshInterval: number;
  notifications: {
    signalChange: boolean;
    cpoError: boolean;
    limitUpdate: boolean;
  };
}

function getInitialSettings(): AppSettings {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('flexee-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to default
      }
    }
  }
  return {
    refreshInterval: 60,
    notifications: {
      signalChange: true,
      cpoError: true,
      limitUpdate: false,
    },
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('flexee-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Paramètres" description="Configuration de la plateforme Flexee" />

      <div className="p-6 space-y-6">
        {saved && (
          <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-600 dark:text-green-400 flex items-center gap-2">
            <Save className="h-5 w-5" />
            Paramètres enregistrés avec succès !
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres Généraux
            </CardTitle>
            <CardDescription>Configuration de base de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="URL de l'API Backend"
              defaultValue={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}
              helperText="Adresse du serveur backend Flexee"
              disabled
            />
            <Input
              label="Intervalle de rafraîchissement (secondes)"
              type="number"
              value={settings.refreshInterval}
              onChange={(e) => setSettings({ ...settings, refreshInterval: parseInt(e.target.value) || 60 })}
              helperText="Fréquence de mise à jour automatique des données"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de Données
            </CardTitle>
            <CardDescription>Informations sur TimescaleDB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium text-foreground">PostgreSQL + TimescaleDB</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Hypertables</p>
                <p className="font-medium text-foreground">signals, site_limit_logs</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Rétention</p>
                <p className="font-medium text-foreground">90 jours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Configuration EDF
            </CardTitle>
            <CardDescription>Paramètres des signaux EDF SEI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="API Open Data EDF"
              defaultValue="https://opendata-edf-sei.opendatasoft.com/api/records/1.0/search/"
              helperText="Endpoint de l'API EDF SEI Open Data"
              disabled
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Signal = 1</p>
                <p className="text-sm text-green-600/80 dark:text-green-400/80">
                  Favorable - Capacité maximale autorisée
                </p>
              </div>
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Signal = 0</p>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">
                  Défavorable - Limite réduite appliquée
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Alertes et notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Changement de signal</p>
                  <p className="text-sm text-muted-foreground">
                    Notifier lors d&apos;un changement d&apos;état du signal
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.signalChange}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, signalChange: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-border accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Erreur de connexion CPO</p>
                  <p className="text-sm text-muted-foreground">
                    Notifier en cas d&apos;échec de synchronisation
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.cpoError}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, cpoError: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-border accent-primary"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition-colors">
                <div>
                  <p className="font-medium text-foreground">Mise à jour des limites</p>
                  <p className="text-sm text-muted-foreground">
                    Notifier après chaque mise à jour de limite
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.notifications.limitUpdate}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, limitUpdate: e.target.checked }
                  })}
                  className="h-5 w-5 rounded border-border accent-primary"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Paramètres de sécurité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Chiffrement des credentials</p>
                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                  Les identifiants CPO sont chiffrés avec AES-256-GCM avant stockage
                </p>
              </div>
              <Input
                label="Clé de chiffrement"
                type="password"
                value="••••••••••••••••••••••••••••••••"
                disabled
                helperText="Définie via la variable d'environnement ENCRYPTION_KEY"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => window.location.reload()}>Annuler</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
