'use client';

import {
  Activity,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Plug,
  Settings,
  Shield,
  Sun,
  User,
  UserCog,
  Users,
  Zap,
  Zap as Power,
} from 'lucide-react';
import { Role, useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Acteurs', href: '/actors', icon: Users },
  
  { name: 'Connexions', href: '/connections', icon: Plug },
  { name: 'Sites', href: '/sites', icon: Building2 },
  { name: 'Régions EDF', href: '/regions', icon: MapPin },
  { name: 'Signaux', href: '/signals', icon: Activity },
  { name: 'Logs', href: '/logs', icon: FileText, adminOnly: true },
  { name: 'Utilisateurs', href: '/users', icon: UserCog, adminOnly: true },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Get user initials
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : 'FL';

  // Role badge color
  const roleBadgeColor = {
    [Role.ADMIN]: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    [Role.OPERATOR]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [Role.VIEWER]: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  // Filter navigation based on role
  const visibleNavigation = navigation.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 text-sidebar-foreground border-r border-sidebar-foreground/10 flex flex-col shadow-2xl overflow-hidden">
      {/* Logo Section - Gradient Background */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-sidebar-foreground/10 bg-gradient-to-r from-primary/20 via-secondary/10 to-transparent flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-secondary to-accent animate-pulse hover:animate-none transition-all">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Flexee</h1>
          <p className="text-xs text-sidebar-foreground/50">Energy Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 px-3 py-6 overflow-y-auto scrollbar-hide">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-primary/30 to-accent/20 text-primary border border-primary/40 shadow-lg shadow-primary/20'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10'
              )}
            >
              <div className={cn(
                'absolute inset-0 bg-gradient-to-r from-primary/0 to-accent/0 transition-all duration-300',
                isActive && 'from-primary/10 to-accent/10'
              )} />
              <item.icon className="h-5 w-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 relative z-10" />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent animate-pulse relative z-10" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 flex-shrink-0">
        <div className="h-px bg-gradient-to-r from-sidebar-foreground/0 via-sidebar-foreground/20 to-sidebar-foreground/0" />
      </div>

      {/* Footer with User Info */}
      <div className="p-4 space-y-4 flex-shrink-0">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-widest">Thème</span>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-sidebar-foreground/10 transition-all duration-200 transform hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-300 drop-shadow-md" />
              ) : (
                <Moon className="h-5 w-5 text-sidebar-foreground/70" />
              )}
            </button>
          )}
        </div>

        {/* User Info Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border border-sidebar-foreground/20 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group">
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent via-primary to-secondary text-sidebar-foreground text-sm font-bold hover:ring-2 hover:ring-primary/50 transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105"
              title="Mon profil"
            >
              {userInitials}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href="/profile" className="block group hover:opacity-80 transition-opacity">
                <p className="text-sm font-semibold truncate">
                  {user ? `${user.firstName}` : 'Loading...'}
                </p>
              </Link>
              {user && (
                <span className={cn(
                  'text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full border font-medium mt-1 transition-all duration-200',
                  user.role === Role.ADMIN ? 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/40 group-hover:bg-red-500/25' :
                  user.role === Role.OPERATOR ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 group-hover:bg-blue-500/25' :
                  'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/40 group-hover:bg-slate-500/25'
                )}>
                  <Shield className="w-3 h-3" />
                  {user.role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-destructive/20 text-destructive/70 hover:text-destructive transition-all duration-200 flex-shrink-0 hover:scale-110 transform"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
