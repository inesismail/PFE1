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
  { name: 'Connexion CPO', href: '/cpo', icon: Plug },
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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Flexee</h1>
          <p className="text-xs text-sidebar-foreground/60">Energy Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer with User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-sidebar-foreground/70">Thème</span>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-sidebar-foreground/70" />
              )}
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 text-sm font-bold hover:ring-2 hover:ring-amber-400/50 transition-all"
            title="Mon profil"
          >
            {userInitials}
          </Link>
          <div className="flex-1 min-w-0">
            <Link href="/profile" className="hover:underline">
              <p className="text-sm font-medium truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </p>
            </Link>
            <div className="flex items-center gap-2">
              {user && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded border flex items-center gap-1',
                  roleBadgeColor[user.role]
                )}>
                  <Shield className="w-3 h-3" />
                  {user.role}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
            title="Déconnexion"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
