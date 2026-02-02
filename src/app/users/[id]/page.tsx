'use client';

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  Lock,
  LockOpen,
  Plus,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserCog,
  X,
} from 'lucide-react';
import { Role, useAuth } from '@/lib/auth';
import { UserActorAssignment, UserDetail, usersApi } from '@/lib/users';
import { use, useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PageParams {
  id: string;
}

// Role badge colors
const roleBadgeColors = {
  [Role.ADMIN]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  [Role.OPERATOR]: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  [Role.VIEWER]: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export default function UserDetailPage({ params }: { params: Promise<PageParams> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAuth();
  
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<Role>(Role.VIEWER);
  const [isActive, setIsActive] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Actor assignment
  const [showActorModal, setShowActorModal] = useState(false);
  const [newActorId, setNewActorId] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getById(id);
      setUser(data);
      setEmail(data.email);
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setRole(data.role);
      setIsActive(data.isActive);
      setIsEmailVerified(data.isEmailVerified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      await usersApi.update(id, {
        email,
        firstName,
        lastName,
        role,
        isActive,
        isEmailVerified,
      });
      
      setSuccess('Utilisateur mis à jour avec succès');
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignActor = async () => {
    if (!newActorId.trim()) return;
    
    try {
      setError(null);
      await usersApi.assignActor(id, {
        actorId: newActorId.trim(),
        canEdit,
        canDelete,
      });
      setShowActorModal(false);
      setNewActorId('');
      setCanEdit(false);
      setCanDelete(false);
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign actor');
    }
  };

  const handleRemoveActor = async (actorId: string) => {
    try {
      setError(null);
      await usersApi.removeActor(id, actorId);
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove actor');
    }
  };

  const handleLockAccount = async () => {
    try {
      await usersApi.lockAccount(id);
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock account');
    }
  };

  const handleUnlockAccount = async () => {
    try {
      await usersApi.unlockAccount(id);
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock account');
    }
  };

  const handleRevokeTokens = async () => {
    try {
      const result = await usersApi.revokeAllTokens(id);
      setSuccess(result.message);
      await loadUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke tokens');
    }
  };

  const isLocked = user?.lockedUntil && new Date(user.lockedUntil) > new Date();

  if (!isAdmin) return null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-4">
          Utilisateur non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/users')}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-7 w-7" />
            Modifier l&apos;utilisateur
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
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
        {/* User Details */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informations du compte</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Rôle</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={Role.ADMIN}>Admin</option>
                <option value={Role.OPERATOR}>Opérateur</option>
                <option value={Role.VIEWER}>Viewer</option>
              </select>
            </div>
            
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
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Compte actif</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmailVerified}
                onChange={(e) => setIsEmailVerified(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm">Email vérifié</span>
            </label>
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer
            </button>
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Statut du compte</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Rôle</p>
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium',
                roleBadgeColors[user.role]
              )}>
                <Shield className="h-3 w-3" />
                {user.role}
              </span>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">2FA</p>
              <span className={cn(
                'text-sm font-medium',
                user.twoFactorEnabled ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {user.twoFactorEnabled ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Sessions actives</p>
              <span className="text-sm font-medium">{user._count.refreshTokens}</span>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Tentatives échouées</p>
              <span className="text-sm font-medium">{user.failedLoginAttempts}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-6">
            {isLocked || !user.isActive ? (
              <button
                onClick={handleUnlockAccount}
                className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-500/10"
              >
                <LockOpen className="h-4 w-4" />
                Déverrouiller le compte
              </button>
            ) : (
              <button
                onClick={handleLockAccount}
                className="inline-flex items-center gap-2 px-4 py-2 border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-500/10"
              >
                <Lock className="h-4 w-4" />
                Verrouiller le compte
              </button>
            )}
            
            <button
              onClick={handleRevokeTokens}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent"
            >
              <RefreshCw className="h-4 w-4" />
              Révoquer toutes les sessions
            </button>
          </div>
        </div>

        {/* Assigned Actors */}
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Acteurs assignés</h2>
            <button
              onClick={() => setShowActorModal(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Assigner un acteur
            </button>
          </div>
          
          {user.userActors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun acteur assigné
            </p>
          ) : (
            <div className="divide-y">
              {user.userActors.map((ua: UserActorAssignment) => (
                <div key={ua.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {ua.actor?.name || ua.actorId}
                    </p>
                    {ua.actor?.code && (
                      <p className="text-sm text-muted-foreground">
                        Code: {ua.actor.code}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2 text-sm">
                      {ua.canEdit && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
                          Édition
                        </span>
                      )}
                      {ua.canDelete && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-600 dark:text-red-400 rounded">
                          Suppression
                        </span>
                      )}
                      {!ua.canEdit && !ua.canDelete && (
                        <span className="px-2 py-0.5 bg-slate-500/20 text-slate-600 dark:text-slate-400 rounded">
                          Lecture seule
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveActor(ua.actorId)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded"
                      title="Retirer l'acteur"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Informations supplémentaires</h2>
          
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Créé le</span>
              <span>{new Date(user.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Dernière modification</span>
              <span>{new Date(user.updatedAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Dernière connexion</span>
              <span>
                {user.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('fr-FR')
                  : 'Jamais'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Mot de passe modifié</span>
              <span>
                {user.passwordChangedAt
                  ? new Date(user.passwordChangedAt).toLocaleString('fr-FR')
                  : 'Jamais'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actor Assignment Modal */}
      {showActorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Assigner un acteur</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID de l&apos;acteur</label>
                <input
                  type="text"
                  value={newActorId}
                  onChange={(e) => setNewActorId(e.target.value)}
                  placeholder="UUID de l'acteur"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canEdit}
                    onChange={(e) => setCanEdit(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Permission d&apos;édition</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDelete}
                    onChange={(e) => setCanDelete(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">Permission de suppression</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowActorModal(false);
                  setNewActorId('');
                  setCanEdit(false);
                  setCanDelete(false);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent"
              >
                Annuler
              </button>
              <button
                onClick={handleAssignActor}
                disabled={!newActorId.trim()}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
