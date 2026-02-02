'use client';

import {
  AuthContextType,
  AuthState,
  ChangePasswordData,
  LoginCredentials,
  RegisterData,
  Role,
} from './types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi, tokenStorage } from './api';

// ============================================================================
// Initial State
// ============================================================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Provider
// ============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>(initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenStorage.getAccessToken();
      
      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Check if token is expired
        if (tokenStorage.isTokenExpired()) {
          // Try to refresh
          await authApi.refreshTokens();
        }

        // Get current user
        const user = await authApi.getCurrentUser();
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Auth initialization failed:', error);
        tokenStorage.clearTokens();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login
  const login = useCallback(async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await authApi.login(credentials);
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Register (note: doesn't auto-login, user must login separately)
  const register = useCallback(async (data: RegisterData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authApi.register(data);
      // Registration successful but not authenticated yet
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const message = getErrorMessage(error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Refresh tokens
  const refreshTokens = useCallback(async () => {
    try {
      await authApi.refreshTokens();
      const user = await authApi.getCurrentUser();
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
    } catch (error) {
      console.error('Token refresh failed:', error);
      tokenStorage.clearTokens();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      throw error;
    }
  }, []);

  // Change password
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    await authApi.changePassword(data);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Role check
  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!state.user) return false;
      
      // Admin has access to everything
      if (state.user.role === Role.ADMIN) return true;
      
      // Role hierarchy: ADMIN > OPERATOR > VIEWER
      const roleHierarchy = {
        [Role.ADMIN]: 3,
        [Role.OPERATOR]: 2,
        [Role.VIEWER]: 1,
      };
      
      return roleHierarchy[state.user.role] >= roleHierarchy[role];
    },
    [state.user]
  );

  // Computed role checks
  const isAdmin = useMemo(
    () => state.user?.role === Role.ADMIN,
    [state.user?.role]
  );
  
  const isOperator = useMemo(
    () => state.user?.role === Role.OPERATOR || isAdmin,
    [state.user?.role, isAdmin]
  );
  
  const isViewer = useMemo(
    () => state.user?.role === Role.VIEWER || isOperator,
    [state.user?.role, isOperator]
  );

  // Context value
  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refreshTokens,
      changePassword,
      clearError,
      hasRole,
      isAdmin,
      isOperator,
      isViewer,
    }),
    [
      state,
      login,
      register,
      logout,
      refreshTokens,
      changePassword,
      clearError,
      hasRole,
      isAdmin,
      isOperator,
      isViewer,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================================
// Utility Functions
// ============================================================================

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for API error response
    const axiosError = error as {
      response?: { data?: { message?: string } };
    };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}

// ============================================================================
// Role-Based Component Helpers
// ============================================================================

interface RequireRoleProps {
  role: Role;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ role, children, fallback = null }: RequireRoleProps) {
  const { hasRole, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
}

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return null;
  
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
}
