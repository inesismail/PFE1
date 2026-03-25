'use client';

import { Loader2, Menu, X } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { Sidebar } from '@/components/layout';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Show loading state while auth is initializing
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Public routes - no sidebar, no auth required
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes - with sidebar and auth check
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - Desktop uniquement, fixe sur la gauche */}
        <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-50">
          <Sidebar />
        </div>

        {/* Sidebar Mobile - Glisse par-dessus le contenu */}
        <div 
          className={`fixed inset-y-0 left-0 w-64 z-40 lg:hidden transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar />
        </div>

        {/* Overlay au-dessus du contenu quand sidebar ouvert (mobile) */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}

        {/* Main Content - avec marging left sur desktop */}
        <main className="flex-1 flex flex-col min-h-screen lg:ml-64">
          {/* Toggle Button - Mobile uniquement */}
          <div className="sticky top-0 z-50 lg:hidden flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-background/98 to-background/95 backdrop-blur-md border-b border-border/50 shadow-md">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 text-foreground border border-primary/30 transition-all duration-200 hover:shadow-lg active:scale-95"
              title={sidebarOpen ? 'Fermer menu' : 'Ouvrir menu'}
              aria-label="Basculer le menu"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 transition-transform duration-200 hover:scale-110 hover:rotate-90" />
              ) : (
                <Menu className="w-6 h-6 transition-transform duration-200 hover:scale-110" />
              )}
            </button>
            <span className="text-sm font-semibold text-foreground/80">Flexee</span>
          </div>

          {/* Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
