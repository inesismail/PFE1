import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: any;
  private pool: Pool;

  constructor() {
    const { PrismaClient } = require('.prisma/auth-client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const url = process.env.DATABASE_URL || '';
    const schemaMatch = url.match(/[?&]schema=([^&]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'auth';
    const cleanUrl = url.replace(/[?&]schema=[^&]+/, '');

    this.pool = new Pool({
      connectionString: cleanUrl,
      options: `-c search_path=${schema}`,
    });
    const adapter = new PrismaPg(this.pool, { schema });
    this.client = new PrismaClient({ adapter });
  }

  // Model accessors
  get user() { return this.client.user; }
  get refreshToken() { return this.client.refreshToken; }
  get passwordResetToken() { return this.client.passwordResetToken; }

  // Proxy Prisma methods for services that call this.prisma.$connect etc.
  async $connect() { return this.client.$connect(); }
  async $disconnect() { return this.client.$disconnect(); }
  async $queryRawUnsafe(...args: any[]) { return this.client.$queryRawUnsafe(...args); }

  async onModuleInit() { await this.client.$connect(); }
  async onModuleDestroy() { await this.client.$disconnect(); await this.pool.end(); }
}