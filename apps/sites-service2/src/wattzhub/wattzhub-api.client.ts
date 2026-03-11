import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';

export interface CpoAuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  [key: string]: any;
}

export interface CpoSiteDto {
  id: string;
  name: string;
  address?: string;
  maxCapacityKw?: number;
  currentPowerKw?: number;
  siteId?: string;
  siteName?: string;
  smartCharging?: boolean;
  voltage?: number;
  numberOfPhases?: number;
}

@Injectable()
export class WattzHubApiClient {
  private readonly logger = new Logger(WattzHubApiClient.name);
  private client!: AxiosInstance;
  private authClient!: AxiosInstance;
  private baseUrl!: string;
  private accessToken: string | null = null;

  configure(baseUrl: string, accessToken?: string): void {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.accessToken = accessToken || null;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.authClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    const errorHandler = (error: AxiosError) => {
      this.logger.error(`WattzHub API error: ${error.response?.status} ${error.message}`);
      return Promise.reject(error);
    };

    this.client.interceptors.response.use((r) => r, errorHandler);
    this.authClient.interceptors.response.use((r) => r, errorHandler);
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  async authenticate(email: string, password: string, tenant?: string): Promise<CpoAuthResponseDto> {
    try {
      const response = await this.authClient.post('/auth/signin', {
        email, password, acceptEula: true,
        ...(tenant ? { tenant } : {}),
      });
      const data = response.data as Record<string, any>;
      const token = data?.accessToken || data?.token || data?.access_token || data?.idToken || data?.id_token;
      if (!token) throw new HttpException('No access token received from WattzHub', HttpStatus.BAD_REQUEST);
      this.accessToken = token;
      return { ...data, accessToken: token };
    } catch (error) {
      const axiosErr = error as AxiosError;
      if (axiosErr.response?.status === 401) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      const errorData = axiosErr.response?.data as any;
      const message = errorData?.errorMessage || errorData?.message || axiosErr.message;
      throw new HttpException(`Authentication failed: ${message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async validateToken(): Promise<boolean> {
    if (!this.accessToken) return false;
    try {
      const res = await this.client.get('/api/site-areas', { params: { Limit: 1 } });
      return res.status === 200;
    } catch { return false; }
  }

  async refreshAccessToken(refreshToken: string): Promise<CpoAuthResponseDto> {
    try {
      const response = await this.authClient.post('/auth/refresh', { refreshToken });
      if ((response.data as any)?.accessToken) {
        this.accessToken = (response.data as any).accessToken;
      }
      return response.data as CpoAuthResponseDto;
    } catch (error) {
      const axiosErr = error as AxiosError;
      throw new HttpException(`Token refresh failed: ${axiosErr.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getSiteAreas(): Promise<CpoSiteDto[]> {
    try {
      const response = await this.client.get('/api/site-areas', {
        params: { Limit: 100, WithSite: true, WithChargingStations: true },
      });
      const siteAreas = response.data?.result || response.data?.data || response.data;
      if (!Array.isArray(siteAreas)) return [];
      return this.mapSiteAreas(siteAreas);
    } catch (error) {
      const axiosErr = error as AxiosError;
      throw new HttpException(`Failed to fetch site areas: ${axiosErr.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async getSites(): Promise<CpoSiteDto[]> {
    return this.getSiteAreas();
  }

  async setSiteAreaLimit(siteAreaId: string, limitKw: number): Promise<void> {
    try {
      const maximumPowerWatts = Math.round(limitKw * 1000);
      const getResponse = await this.client.get(`/api/site-areas/${siteAreaId}`);
      const currentSiteArea = { ...getResponse.data };
      delete currentSiteArea.id;
      delete currentSiteArea.createdOn;
      delete currentSiteArea.createdBy;
      delete currentSiteArea.lastChangedBy;
      delete currentSiteArea.chargingStations;
      delete currentSiteArea.site;
      delete currentSiteArea.parentSiteArea;
      delete currentSiteArea.connectorStats;
      await this.client.put(`/api/site-areas/${siteAreaId}`, {
        ...currentSiteArea,
        maximumPower: maximumPowerWatts,
      });
    } catch (error) {
      const axiosErr = error as AxiosError;
      throw new HttpException(`Failed to set site area limit: ${axiosErr.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async setSiteLimit(siteId: string, limitKw: number): Promise<void> {
    return this.setSiteAreaLimit(siteId, limitKw);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/api/site-areas', { params: { Limit: 1 }, timeout: 5000 });
      return true;
    } catch { return false; }
  }

  private mapSiteAreas(siteAreas: any[]): CpoSiteDto[] {
    return siteAreas.map((area) => ({
      id: area.id || area._id,
      name: area.name || 'Unknown',
      address: this.formatAddress(area.address),
      maxCapacityKw: area.maximumPower ? area.maximumPower / 1000 : undefined,
      currentPowerKw: undefined,
      siteId: area.siteID,
      siteName: area.site?.name,
      smartCharging: area.smartCharging,
      voltage: area.voltage,
      numberOfPhases: area.numberOfPhases,
    }));
  }

  private formatAddress(address: any): string | undefined {
    if (!address) return undefined;
    if (typeof address === 'string') return address;
    return [address.address1, address.address2, address.postalCode, address.city, address.country]
      .filter(Boolean).join(', ') || undefined;
  }
}
