import {
  AuthResponse,
  ChangePasswordData,
  LoginCredentials,
  RegisterData,
  User,
} from './types';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const ACCESS_TOKEN_KEY = 'flexee_access_token';
const REFRESH_TOKEN_KEY = 'flexee_refresh_token';
const TOKEN_EXPIRY_KEY = 'flexee_token_expiry';

// ============================================================================
// Token Management
// ============================================================================

export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string, expiry: number): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    // Use provided expiry or default to 15 minutes from now
    const tokenExpiry = expiry ?? (Date.now() + 15 * 60 * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString());
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  },

  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return true;
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    // Add 30s buffer before expiry
    return Date.now() >= (parseInt(expiry, 10) - 30000);
  },
};

// ============================================================================
// Auth API Client
// ============================================================================

class AuthApiClient {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      withCredentials: true, // For httpOnly cookies if needed
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // If unauthorized and not already retrying
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/auth/login') &&
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newTokens = await this.refreshTokens();
            this.isRefreshing = false;
            
            // Notify subscribers
            this.refreshSubscribers.forEach((callback) =>
              callback(newTokens.accessToken)
            );
            this.refreshSubscribers = [];

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
            tokenStorage.clearTokens();
            
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Auth Methods
  // ============================================================================

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', credentials);
    
    tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.accessTokenExpiry
    );
    
    return response.data;
  }

  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await this.api.post<{ message: string; user: User }>('/auth/register', data);
    // Note: Registration doesn't auto-login - user must login separately
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken });
      }
    } finally {
      tokenStorage.clearTokens();
    }
  }

  async logoutAll(): Promise<void> {
    try {
      await this.api.post('/auth/logout-all');
    } finally {
      tokenStorage.clearTokens();
    }
  }

  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    tokenStorage.setTokens(
      response.data.accessToken,
      response.data.refreshToken,
      response.data.accessTokenExpiry
    );

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me');
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.api.post('/auth/change-password', data);
  }

  // ============================================================================
  // Get authenticated axios instance for other API calls
  // ============================================================================

  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

// Singleton instance
export const authApi = new AuthApiClient();

// Export the authenticated axios instance for use in other API calls
export const getAuthenticatedApi = () => authApi.getAxiosInstance();
