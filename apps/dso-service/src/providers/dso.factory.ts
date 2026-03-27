import { Injectable } from '@nestjs/common';
import { DsoProvider } from './dso-provider.interface';
import { EdfProvider } from './edf.provider';
import { MockProvider } from './mock.provider';
import { InternalProvider } from './internal.provider';
import { DsoMockService } from '../mock/dso-mock.service';
import { SitesClient } from '../sites/sites.client';

// ══════════════════════════════════════════════════════════════════
// DsoFactory — retourne le bon provider selon le type / token
// ══════════════════════════════════════════════════════════════════

export type DsoType = 'EDF' | 'ENEDIS' | 'MOCK' | 'INTERNAL' | string;

export interface DsoFactoryConfig {
  baseUrl?: string;
  token?: string;
  tariffUrl?: string;
  energyUrl?: string;
  label?: string;
}

@Injectable()
export class DsoFactory {
  constructor(
    private readonly mockService: DsoMockService,
    private readonly sitesClient: SitesClient,
  ) {}

  create(type: DsoType, config: DsoFactoryConfig = {}): DsoProvider {
    switch (type.toUpperCase()) {
      case 'INTERNAL':
        return new InternalProvider(this.sitesClient);

      case 'MOCK':
        return new MockProvider(this.mockService, config.token || '');

      case 'EDF':
      case 'ENEDIS':
        return new EdfProvider(
          config.baseUrl || '',
          config.token || '',
          config.tariffUrl,
          config.energyUrl,
          config.label || type,
        );

      default:
        // Auto-detect : si le token est un mock connu → MockProvider
        if (config.token && this.mockService.isValidToken(config.token)) {
          return new MockProvider(this.mockService, config.token);
        }
        // Sinon → EdfProvider (appel HTTP réel)
        return new EdfProvider(
          config.baseUrl || '',
          config.token || '',
          config.tariffUrl,
          config.energyUrl,
          config.label || 'DSO',
        );
    }
  }

  /** Résout le provider depuis une connexion DB (auto-detect mock vs réel) */
  createFromConnection(conn: { baseUrl: string; authPassword: string; tariffUrl?: string | null; energyUrl?: string | null; label?: string }): DsoProvider {
    return this.create('AUTO', {
      baseUrl: conn.baseUrl,
      token: conn.authPassword,
      tariffUrl: conn.tariffUrl || undefined,
      energyUrl: conn.energyUrl || undefined,
      label: conn.label,
    });
  }
}
