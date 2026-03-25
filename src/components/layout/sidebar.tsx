'use client';

import {
  Activity,
  Building2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  Moon,
  Plug,
  Settings,
  Shield,
  Sun,
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
  { name: 'Connexions', href: '/connections', icon: Plug },
  { name: 'Sites', href: '/sites', icon: Building2 },
  { name: 'Régions', href: '/regions', icon: MapPin },
  { name: 'Signaux', href: '/signals', icon: Activity },
  { name: 'Logs', href: '/logs', icon: FileText, operatorOnly: true },
  { name: 'Utilisateurs', href: '/users', icon: UserCog, adminOnly: true },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, logout, isAdmin, isOperator } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U'
    : 'FL';

  const visibleNavigation = navigation.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.operatorOnly) return isOperator;
    return true;
  });

  return (
    <aside className="h-full w-64 bg-card border-r border-border text-foreground flex flex-col overflow-hidden relative">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/3 to-transparent pointer-events-none" />

      {/* ── Logo ── */}
      <div className="relative flex h-[68px] items-center gap-3.5 px-5 flex-shrink-0 group/logo">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 transition-all duration-300 group-hover/logo:shadow-primary/40 group-hover/logo:scale-105">
          <Zap className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover/logo:rotate-12" />
          <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300" />
        </div>
        <div>
          <h1 className="text-[17px] font-extrabold tracking-tight leading-none">
            Flex<span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">ee</span>
          </h1>
          <p className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase mt-0.5">
            Energy Platform
          </p>
        </div>
      </div>

      {/* ── Separator ── */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* ── Navigation ── */}
      <nav className="relative flex-1 px-3 py-5 space-y-1 overflow-y-auto scrollbar-hide">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Navigation
        </p>
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group overflow-hidden',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {/* Active background glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-xl border border-primary/20" />
              )}
              {/* Active left accent bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-primary to-primary/70" />
              )}
              <div className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground group-hover:text-foreground group-hover:bg-muted/50'
              )}>
                <item.icon className="h-[17px] w-[17px] transition-transform duration-200 group-hover:scale-110" />
              </div>
              <span className="relative z-10 flex-1">{item.name}</span>
              {isActive && (
                <ChevronRight className="relative z-10 h-3.5 w-3.5 text-primary/60 transition-transform duration-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="relative flex-shrink-0">
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Theme toggle */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Thème
          </span>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 group/theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-500 dark:text-amber-400 transition-transform duration-300 group-hover/theme:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover/theme:-rotate-12" />
              )}
            </button>
          )}
        </div>

        {/* User card */}
        <div className="px-3 pb-4">
          <div className="relative flex items-center gap-3 rounded-xl bg-muted/40 p-3 border border-border hover:border-primary/30 transition-all duration-300 group/user hover:shadow-lg hover:shadow-primary/5">
            <Link
              href="/profile"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xs font-bold flex-shrink-0 transition-all duration-300 group-hover/user:shadow-md group-hover/user:shadow-primary/30 group-hover/user:scale-105"
              title="Mon profil"
            >
              {userInitials}
            </Link>
            <div className="flex-1 min-w-0">
              <Link href="/profile" className="block hover:opacity-80 transition-opacity">
                <p className="text-[13px] font-semibold truncate leading-none text-foreground/90">
                  {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '...'}
                </p>
              </Link>
              {user && (
                <span className={cn(
                  'text-[10px] inline-flex items-center gap-1 font-semibold mt-1.5 leading-none',
                  user.role === Role.ADMIN
                    ? 'text-amber-500 dark:text-amber-400'
                    : user.role === Role.OPERATOR
                      ? 'text-primary'
                      : 'text-muted-foreground'
                )}>
                  <Shield className="w-2.5 h-2.5" />
                  {user.role}
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 flex-shrink-0 group/logout"
              title="Déconnexion"
            >
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover/logout:-translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
