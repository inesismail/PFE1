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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
              <UserCog className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
              <p className="text-sm text-muted-foreground">
                {total} compte{total > 1 ? 's' : ''} enregistré{total > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => router.push('/users/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Rechercher par email ou nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background/80 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value as Role | ''); setPage(1); }}
            className="px-3.5 py-2.5 bg-background/80 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
          >
            <option value="">Tous les rôles</option>
            <option value={Role.ADMIN}>Admin</option>
            <option value={Role.OPERATOR}>Opérateur</option>
            <option value={Role.VIEWER}>Viewer</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-background/80 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <button
            onClick={loadUsers}
            className="p-2.5 border border-border/50 rounded-xl hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-500 transition-all duration-200"
            title="Rafraîchir"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm flex-1">{error}</p>
          <button onClick={() => setError(null)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Mot de passe temporaire</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Le mot de passe a été réinitialisé. Communiquez ce mot de passe temporaire à l&apos;utilisateur :
            </p>
            <div className="flex items-center gap-2 p-3.5 bg-muted/50 rounded-xl font-mono text-sm border border-border/50">
              <span className="flex-1 break-all">{tempPassword.password}</span>
              <button
                onClick={() => copyToClipboard(tempPassword.password)}
                className="p-2 hover:bg-background rounded-lg transition-colors"
                title="Copier"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-amber-500 mt-3 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Ce mot de passe ne sera plus affiché
            </p>
            <button
              onClick={() => setTempPassword(null)}
              className="w-full mt-5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium border border-border/50 rounded-xl hover:bg-muted/50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm)}
                disabled={actionLoading === deleteConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
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

      {/* Users Grid — Cards on mobile, Table on desktop */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_1.2fr_0.5fr] gap-4 px-5 py-3.5 bg-muted/30 border-b border-border/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Utilisateur</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rôle</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acteurs</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessions</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dernière connexion</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50">
              <Users className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {users.map((user) => {
              const status = getUserStatus(user);
              const isCurrentUser = user.id === currentUser?.id;
              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';

              return (
                <div
                  key={user.id}
                  className="group hidden md:grid grid-cols-[2fr_1fr_1fr_0.7fr_0.7fr_1.2fr_0.5fr] gap-4 items-center px-5 py-4 hover:bg-blue-500/[0.03] transition-colors duration-150"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      'h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
                      isCurrentUser
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20'
                        : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200'
                    )}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user.firstName} {user.lastName}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">vous</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide',
                      user.role === Role.ADMIN && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      user.role === Role.OPERATOR && 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                      user.role === Role.VIEWER && 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
                    )}>
                      <Shield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold',
                      status === 'active' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                      status === 'inactive' && 'bg-slate-500/15 text-slate-500',
                      status === 'locked' && 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
                    )}>
                      <div className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        status === 'active' && 'bg-emerald-500',
                        status === 'inactive' && 'bg-slate-400',
                        status === 'locked' && 'bg-orange-500',
                      )} />
                      {status === 'active' ? 'Actif' : status === 'locked' ? 'Verrouillé' : 'Inactif'}
                    </span>
                  </div>

                  {/* Actors count */}
                  <div className="text-sm text-muted-foreground font-medium">{user._count?.actorAssignments ?? 0}</div>

                  {/* Sessions count */}
                  <div className="text-sm text-muted-foreground font-medium">{user._count?.refreshTokens ?? 0}</div>

                  {/* Last login */}
                  <div className="text-xs text-muted-foreground">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : <span className="italic opacity-50">Jamais connecté</span>}
                  </div>

                  {/* Actions */}
                  <div className="relative flex justify-end">
                    <button
                      onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                      className="p-2 rounded-lg hover:bg-muted/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      disabled={actionLoading === user.id}
                    >
                      {actionLoading === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </button>
                    
                    {showDropdown === user.id && (
                      <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border/50 rounded-xl shadow-xl shadow-black/10 z-10 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                        <button
                          onClick={() => { router.push(`/users/${user.id}`); setShowDropdown(null); }}
                          className="w-full px-3.5 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2.5 transition-colors"
                        >
                          <UserCog className="h-4 w-4 text-muted-foreground" />
                          Modifier
                        </button>
                        
                        {!isCurrentUser && (
                          <>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="w-full px-3.5 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2.5 transition-colors"
                            >
                              <Key className="h-4 w-4 text-muted-foreground" />
                              Réinitialiser MDP
                            </button>
                            
                            <button
                              onClick={() => handleRevokeTokens(user.id)}
                              className="w-full px-3.5 py-2 text-left text-sm hover:bg-muted/50 flex items-center gap-2.5 transition-colors"
                            >
                              <RefreshCw className="h-4 w-4 text-muted-foreground" />
                              Révoquer sessions
                            </button>
                            
                            <div className="mx-3 my-1.5 h-px bg-border/50" />
                            
                            {status === 'locked' || !user.isActive ? (
                              <button
                                onClick={() => handleUnlockAccount(user.id)}
                                className="w-full px-3.5 py-2 text-left text-sm hover:bg-emerald-500/10 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 transition-colors"
                              >
                                <LockOpen className="h-4 w-4" />
                                Déverrouiller
                              </button>
                            ) : (
                              <button
                                onClick={() => handleLockAccount(user.id)}
                                className="w-full px-3.5 py-2 text-left text-sm hover:bg-orange-500/10 flex items-center gap-2.5 text-orange-600 dark:text-orange-400 transition-colors"
                              >
                                <Lock className="h-4 w-4" />
                                Verrouiller
                              </button>
                            )}
                            
                            <button
                              onClick={() => { setDeleteConfirm(user.id); setShowDropdown(null); }}
                              className="w-full px-3.5 py-2 text-left text-sm hover:bg-red-500/10 flex items-center gap-2.5 text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Mobile cards */}
            {users.map((user) => {
              const status = getUserStatus(user);
              const isCurrentUser = user.id === currentUser?.id;
              const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || '?';

              return (
                <div key={`mobile-${user.id}`} className="md:hidden p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold',
                        isCurrentUser
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                          : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-200'
                      )}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {user.firstName} {user.lastName}
                          {isCurrentUser && <span className="ml-1.5 text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md">vous</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                      className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase',
                      user.role === Role.ADMIN && 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                      user.role === Role.OPERATOR && 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
                      user.role === Role.VIEWER && 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
                    )}>
                      <Shield className="h-3 w-3" />{user.role}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold',
                      status === 'active' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                      status === 'inactive' && 'bg-slate-500/15 text-slate-500',
                      status === 'locked' && 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
                    )}>
                      <div className={cn('h-1.5 w-1.5 rounded-full', status === 'active' && 'bg-emerald-500', status === 'inactive' && 'bg-slate-400', status === 'locked' && 'bg-orange-500')} />
                      {status === 'active' ? 'Actif' : status === 'locked' ? 'Verrouillé' : 'Inactif'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              {total} utilisateur{total > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-medium px-3">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
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
