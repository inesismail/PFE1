import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  client: any;
  private pool: Pool;

  constructor() {
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const dbUrl = process.env.DATABASE_URL || '';
    const schemaMatch = dbUrl.match(/schema=([^&]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'dso';
    this.pool = new Pool({ connectionString: dbUrl, options: `-c search_path=${schema}` });
    const adapter = new PrismaPg(this.pool, { schema });
    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
  }
}