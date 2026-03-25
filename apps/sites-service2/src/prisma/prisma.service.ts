import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public client: any;

  constructor() {
    const { PrismaClient } = require('.prisma/sites-client');
    const { PrismaPg } = require('@prisma/adapter-pg');

    const dbUrl = process.env.DATABASE_URL || '';
    const schemaMatch = dbUrl.match(/schema=([^&]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'sites';

    const pool = new Pool({
      connectionString: dbUrl,
      options: `-c search_path=${schema}`,
    });

    const adapter = new PrismaPg(pool, { schema });
    this.client = new PrismaClient({ adapter });
  }

  get cpoConnection() { return this.client.cpoConnection; }
  get edfRegion() { return this.client.edfRegion; }
  get site() { return this.client.site; }
  get chargingStation() { return this.client.chargingStation; }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Database connected (sites schema)');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
