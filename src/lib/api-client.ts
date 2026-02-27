import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { tokenStorage } from './auth/api';

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================================================
// Helpers
// ============================================================================

function setAuthHeader(
  headers: any,
  token: string
) {
  const h: any = headers ?? {};

  // Axios v1: headers peut être AxiosHeaders (avec .set)
  if (typeof h.set === 'function') h.set('Authorization', `Bearer ${token}`);
  else h['Authorization'] = `Bearer ${token}`;

  return h;
}

// ============================================================================
// API Client
// ============================================================================

class ApiClient {
  private api: AxiosInstance;

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  // Client dédié au refresh (sans interceptors -> pas de boucle)
  private refreshApi: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      withCredentials: true,
    });

    this.refreshApi = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // =========================
    // Request: attach access token
    // =========================
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();

        console.log(
          '[API] Request to:',
          config.url,
          '| Token exists:',
          !!token,
          '| Token preview:',
          token?.substring(0, 20)
        );

        if (token) {
          config.headers = setAuthHeader(config.headers, token);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // =========================
    // Response: refresh on 401
    // =========================
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | (InternalAxiosRequestConfig & { _retry?: boolean })
          | undefined;

        // Si pas de config -> on rejette
        if (!originalRequest) return Promise.reject(error);

        const url = originalRequest.url || '';
        const is401 = error.response?.status === 401;

        const shouldSkip =
          url.includes('/auth/login') ||
          url.includes('/auth/refresh');

        if (!is401 || originalRequest._retry || shouldSkip) {
          return Promise.reject(error);
        }

        // Si un refresh est déjà en cours, on met en file d'attente
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshSubscribers.push((token: string) => {
              try {
                originalRequest.headers = setAuthHeader(
                  originalRequest.headers,
                  token
                );
                resolve(this.api(originalRequest));
              } catch (e) {
                reject(e);
              }
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = tokenStorage.getRefreshToken();
          if (!refreshToken) throw new Error('No refresh token');

          // IMPORTANT: refresh avec client dédié (sans interceptors)
          const resp = await this.refreshApi.post('/auth/refresh', {
            refreshToken,
          });

          const newTokens: any = resp.data;

          tokenStorage.setTokens(
            newTokens.accessToken,
            newTokens.refreshToken,
            newTokens.accessTokenExpiry
          );

          this.isRefreshing = false;

          // Notifier les requêtes en attente
          const subs = this.refreshSubscribers;
          this.refreshSubscribers = [];
          subs.forEach((cb) => cb(newTokens.accessToken));

          // Rejouer la requête originale
          originalRequest.headers = setAuthHeader(
            originalRequest.headers,
            newTokens.accessToken
          );
          return this.api(originalRequest);
        } catch (refreshError) {
          this.isRefreshing = false;
          this.refreshSubscribers = [];

          tokenStorage.clearTokens();

          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        }
      }
    );
  }

  // ==========================================================================
  // HTTP Methods
  // ==========================================================================

  async get<T>(url: string): Promise<T> {
    const response = await this.api.get<T>(url);
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.api.patch<T>(url, data);
    return response.data;
  }

  async delete<T = void>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }
}

export const apiClient = new ApiClient();