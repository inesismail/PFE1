import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface ActorInfo {
  id: string;
  name: string;
  code: string;
  type?: string;
}

@Injectable()
export class ActorsClient {
  private readonly logger = new Logger(ActorsClient.name);
  private readonly actorsUrl = process.env.ACTORS_BASE_URL || 'http://localhost:3005';

  async getById(actorId: string): Promise<ActorInfo | null> {
    try {
      const { data } = await axios.get<ActorInfo>(`${this.actorsUrl}/api/actors/${actorId}`, { timeout: 3000 });
      return data;
    } catch {
      this.logger.warn(`[ActorsClient] Failed to fetch actor: ${actorId}`);
      return null;
    }
  }

  async getByIds(actorIds: string[]): Promise<Map<string, ActorInfo>> {
    const map = new Map<string, ActorInfo>();
    if (actorIds.length === 0) return map;

    const unique = [...new Set(actorIds)];
    const results = await Promise.allSettled(
      unique.map((id) => this.getById(id)),
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        map.set(result.value.id, result.value);
      }
    }
    return map;
  }
}
