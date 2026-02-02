'use client';

import {
  AlertCircle,
  Check,
  Key,
  Loader2,
  Lock,
  Monitor,
  Save,
  Shield,
  Smartphone,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { ProfileData, Session, profileApi } from '@/lib/users';
import { Role, useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

// Role badge colors
const roleBadgeColors = {
  [Role.ADMIN]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  [Role.OPERATOR]: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  [Role.VIEWER]: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export default function ProfilePage() {
  const { refreshTokens } = useAuth();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Profile form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password form
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
    loadSessions();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileApi.getProfile();
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await profileApi.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Le prénom et le nom sont obligatoires');
      return;
    }

    try {
      setSavingProfile(true);
      setError(null);
      setSuccess(null);
      
      await profileApi.updateProfile({ firstName, lastName });
      setSuccess('Profil mis à jour avec succès');
      await refreshTokens(); // Refresh to get updated user data
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      setSavingPassword(true);
      setError(null);
      setSuccess(null);
      
      await profileApi.changePassword({
        currentPassword,
        newPassword,
        logoutOtherSessions: logoutOthers,
      });
      
      setSuccess('Mot de passe modifié avec succès');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      if (logoutOthers) {
        await loadSessions();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setError(null);
      await profileApi.revokeSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    }
  };

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return Monitor;
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return Smartphone;
    }
    return Monitor;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-7 w-7" />
          Mon Profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-slate-900">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-muted-foreground">{profile?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                {profile && (
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium',
                    roleBadgeColors[profile.role]
                  )}>
                    <Shield className="h-3 w-3" />
                    {profile.role}
                  </span>
                )}
                {profile?.twoFactorEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                    <Lock className="h-3 w-3" />
                    2FA Activé
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informations personnelles</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile?.email || ''}
                disabled
                className="w-full px-3 py-2 bg-muted border rounded-lg text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">
                L&apos;email ne peut pas être modifié. Contactez un administrateur si nécessaire.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Sécurité</h2>
              <p className="text-sm text-muted-foreground">
                {profile?.passwordChangedAt
                  ? `Dernier changement: ${new Date(profile.passwordChangedAt).toLocaleDateString('fr-FR')}`
                  : 'Mot de passe jamais modifié'}
              </p>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent"
              >
                <Key className="h-4 w-4" />
                Changer le mot de passe
              </button>
            )}
          </div>
          
          {showPasswordForm && (
            <div className="border-t pt-4 mt-4">
              <div className="grid gap-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 8 caractères, avec majuscule, minuscule, chiffre et caractère spécial
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logoutOthers}
                    onChange={(e) => setLogoutOthers(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Déconnecter toutes les autres sessions</span>
                </label>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-accent"
                >
                  Annuler
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={savingPassword}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Changer le mot de passe
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Sessions actives</h2>
          
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucune session active
            </p>
          ) : (
            <div className="divide-y">
              {sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.deviceInfo);
                return (
                  <div key={session.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {session.deviceInfo || 'Appareil inconnu'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.ipAddress || 'IP inconnue'} • 
                          Connecté le {new Date(session.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeSession(session.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Révoquer cette session"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assigned Actors */}
        {profile?.assignedActors && profile.assignedActors.length > 0 && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Acteurs assignés</h2>
            
            <div className="divide-y">
              {profile.assignedActors.map((actor) => (
                <div key={actor.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{actor.name}</p>
                    <p className="text-sm text-muted-foreground">Code: {actor.code}</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {actor.canEdit && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
                        Édition
                      </span>
                    )}
                    {actor.canDelete && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded">
                        Suppression
                      </span>
                    )}
                    {!actor.canEdit && !actor.canDelete && (
                      <span className="px-2 py-0.5 bg-slate-500/20 text-slate-600 dark:text-slate-400 rounded">
                        Lecture seule
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informations du compte</h2>
          
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Compte créé le</span>
              <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleString('fr-FR') : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Dernière connexion</span>
              <span>
                {profile?.lastLoginAt
                  ? new Date(profile.lastLoginAt).toLocaleString('fr-FR')
                  : 'Jamais'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Email vérifié</span>
              <span className={profile?.isEmailVerified ? 'text-green-600' : 'text-amber-500'}>
                {profile?.isEmailVerified ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
