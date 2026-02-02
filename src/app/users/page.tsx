'use client';

import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Key,
  Loader2,
  Lock,
  LockOpen,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { Role, useAuth } from '@/lib/auth';
import { UserListItem, UsersQueryParams, usersApi } from '@/lib/users';
import { useCallback, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Role badge colors
const roleBadgeColors = {
  [Role.ADMIN]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
  [Role.OPERATOR]: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30',
  [Role.VIEWER]: 'bg-slate-500/20 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

// Status badge colors
const statusColors = {
  active: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
  inactive: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
  locked: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30',
};

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser, isAdmin } = useAuth();
  
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<{ userId: string; password: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: UsersQueryParams = {
        page,
        limit: 20,
      };
      
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;
      
      const response = await usersApi.list(params);
      setUsers(response.users);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset page on search change (triggers loadUsers via first useEffect)
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleLockAccount = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.lockAccount(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock account');
    } finally {
      setActionLoading(null);
      setShowDropdown(null);
    }
  };

  const handleUnlockAccount = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.unlockAccount(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock account');
    } finally {
      setActionLoading(null);
      setShowDropdown(null);
    }
  };

  const handleRevokeTokens = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.revokeAllTokens(userId);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke tokens');
    } finally {
      setActionLoading(null);
      setShowDropdown(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await usersApi.resetPassword(userId);
      setTempPassword({ userId, password: response.temporaryPassword });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setActionLoading(null);
      setShowDropdown(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await usersApi.delete(userId);
      setDeleteConfirm(null);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getUserStatus = (user: UserListItem) => {
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return 'locked';
    }
    return user.isActive ? 'active' : 'inactive';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-7 w-7" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les comptes utilisateurs, les rôles et les permissions
          </p>
        </div>
        <button
          onClick={() => router.push('/users/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | '');
              setPage(1);
            }}
            className="px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les rôles</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.OPERATOR}>Opérateur</option>
            <option value={Role.VIEWER}>Viewer</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <button
            onClick={loadUsers}
            className="px-3 py-2 border rounded-lg hover:bg-accent transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Mot de passe temporaire</h3>
            <p className="text-muted-foreground mb-4">
              Le mot de passe a été réinitialisé. Communiquez ce mot de passe temporaire à l&apos;utilisateur:
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
              <span className="flex-1 break-all">{tempPassword.password}</span>
              <button
                onClick={() => copyToClipboard(tempPassword.password)}
                className="p-2 hover:bg-accent rounded"
                title="Copier"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-amber-500 mt-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Ce mot de passe ne sera plus affiché
            </p>
            <button
              onClick={() => setTempPassword(null)}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression
            </h3>
            <p className="text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-accent"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {actionLoading === deleteConfirm ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Supprimer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Utilisateur</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Rôle</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Acteurs</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sessions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Dernière connexion</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const status = getUserStatus(user);
                  const isCurrentUser = user.id === currentUser?.id;
                  
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-bold text-slate-900">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.firstName} {user.lastName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-muted-foreground">(Vous)</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium',
                          roleBadgeColors[user.role]
                        )}>
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium',
                          statusColors[status]
                        )}>
                          {status === 'active' && <Check className="h-3 w-3" />}
                          {status === 'inactive' && <X className="h-3 w-3" />}
                          {status === 'locked' && <Lock className="h-3 w-3" />}
                          {status === 'active' ? 'Actif' : status === 'locked' ? 'Verrouillé' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{user._count.actorAssignments}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{user._count.refreshTokens}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-muted-foreground">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString('fr-FR')
                            : 'Jamais'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex justify-end">
                          <button
                            onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            disabled={actionLoading === user.id}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </button>
                          
                          {showDropdown === user.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-lg shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    router.push(`/users/${user.id}`);
                                    setShowDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                                >
                                  <UserCog className="h-4 w-4" />
                                  Modifier
                                </button>
                                
                                {!isCurrentUser && (
                                  <>
                                    <button
                                      onClick={() => handleResetPassword(user.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                                    >
                                      <Key className="h-4 w-4" />
                                      Réinitialiser MDP
                                    </button>
                                    
                                    <button
                                      onClick={() => handleRevokeTokens(user.id)}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                      Révoquer sessions
                                    </button>
                                    
                                    <div className="border-t my-1" />
                                    
                                    {status === 'locked' || !user.isActive ? (
                                      <button
                                        onClick={() => handleUnlockAccount(user.id)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-green-600"
                                      >
                                        <LockOpen className="h-4 w-4" />
                                        Déverrouiller
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleLockAccount(user.id)}
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-orange-600"
                                      >
                                        <Lock className="h-4 w-4" />
                                        Verrouiller
                                      </button>
                                    )}
                                    
                                    <button
                                      onClick={() => {
                                        setDeleteConfirm(user.id);
                                        setShowDropdown(null);
                                      }}
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Supprimer
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              {total} utilisateur{total > 1 ? 's' : ''} au total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm">
                Page {page} sur {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
}
