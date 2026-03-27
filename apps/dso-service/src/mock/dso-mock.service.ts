import { Injectable, UnauthorizedException } from '@nestjs/common';
import { VALID_TOKENS, PREFIXES, SUFFIXES, CITIES, STREETS, CAPS} from './dso-mock.data';

@Injectable()
export class DsoMockService {

  // ── Vérifie le token ──────────────────────────────────────────────
  validateToken(token: string): string {
    const label = VALID_TOKENS[token];
    if (!label) throw new UnauthorizedException('Token invalide ou manquant');
    return label;
  }

  isValidToken(token: string): boolean {
    return !!VALID_TOKENS[token];
  }

  // ── Génère des sites stables par token (seed déterministe) ────────
  generateSites(token: string, count = 3): any[] {
    let seed = 0;
    for (const c of token) seed = (seed * 31 + c.charCodeAt(0)) & 0xFFFFFFFF;

    const rng = this.makeRng(seed);
    const cities = this.sample(CITIES, Math.min(count, CITIES.length), rng);
    const sites: any[] = [];


    for (let i = 0; i < count; i++) {
      const [city, dept] = cities[i];
      let siteSeed = 0;
      for (const c of token + i) siteSeed = (siteSeed * 31 + (typeof c === 'string' ? c.charCodeAt(0) : c)) & 0xFFFFFFFF;
      const siteId = `site-${String(siteSeed % 90000 + 10000).padStart(5, '0')}`;

      sites.push({
        id: siteId,
        name: `${this.pick(PREFIXES, rng)} ${city} ${this.pick(SUFFIXES, rng)}`,
        address: `${Math.floor(rng() * 99) + 1} ${this.pick(STREETS, rng)}, ${dept}000 ${city}`,
        city,
        maxCapacity: this.pick(CAPS, rng),
        dsoLabel: VALID_TOKENS[token] || 'Inconnu',
      });
    }
    return sites;
  }

  // ── Génère énergie horaire pour un site ───────────────────────────
  generateEnergy(siteId: string): any {
    const dateKey = new Date().toISOString().slice(0, 10);
    const rng = this.makeRng(this.hashString(siteId + dateKey));
    const base = 50 + rng() * 150;
    const energy = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      value: Math.round((base + (rng() - 0.5) * 60) * 100) / 100,
    }));
    return { site_id: siteId, energy, unit: 'kW', date: dateKey };
  }

  // ── Génère tarifs horaires pour un site ──────────────────────────
  generateTariff(siteId: string): any {
    const dateKey = new Date().toISOString().slice(0, 10);
    const rng = this.makeRng(this.hashString(siteId + dateKey + 'tariff'));
    const base = 0.08 + rng() * 0.07;
    const tariffs = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      price: Math.round((base + (rng() - 0.5) * 0.08 + (h >= 8 && h <= 20 ? 0.02 : 0)) * 10000) / 10000,
    }));
    return { site_id: siteId, tariffs, currency: 'EUR', unit: 'EUR/kWh', date: dateKey };
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private makeRng(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xFFFFFFFF;
      return (s >>> 0) / 0xFFFFFFFF;
    };
  }

  private hashString(str: string): number {
    let hash = 0;
    for (const c of str) hash = (hash * 31 + c.charCodeAt(0)) & 0xFFFFFFFF;
    return hash >>> 0;
  }

  private pick<T>(arr: T[], rng: () => number): T {
    return arr[Math.floor(rng() * arr.length)];
  }

  private sample<T>(arr: T[], n: number, rng: () => number): T[] {
    const copy = [...arr];
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(rng() * copy.length);
      result.push(copy.splice(idx, 1)[0]);
    }
    return result;
  }
}