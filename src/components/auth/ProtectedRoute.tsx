'use client';

import { Role, useAuth } from '@/lib/auth';
import { usePathname, useRouter } from 'next/navigation';

import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

// ============================================================================
// Protected Route Wrapper
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`${fallbackPath}?redirect=${redirectUrl}`);
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      // User doesn't have required role, redirect to unauthorized
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLoading, hasRole, requiredRole, router, pathname, fallbackPath]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// Public Route - Redirects if authenticated
// ============================================================================

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================================
// Role-Based Content Components
// ============================================================================

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) return null;
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

interface OperatorOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OperatorOnly({ children, fallback = null }: OperatorOnlyProps) {
  const { isOperator, isLoading } = useAuth();
  
  if (isLoading) return null;
  return isOperator ? <>{children}</> : <>{fallback}</>;
}
