'use client';

import { Loader2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth';
import { Sidebar } from '@/components/layout';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();
  const { isLoading } = useAuth();

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Show loading state while auth is initializing
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400">Loading...</p>
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
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
