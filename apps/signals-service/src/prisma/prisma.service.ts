import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public client: any;
  public signal: any;
  public siteLimitLog: any;

  constructor() {
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const dbUrl = process.env.DATABASE_URL || '';
    const schemaMatch = dbUrl.match(/schema=([^&]+)/);
    const schema = schemaMatch ? schemaMatch[1] : 'signals';
    const pool = new Pool({ connectionString: dbUrl, options: `-c search_path=${schema}` });
    const adapter = new PrismaPg(pool, { schema });
    this.client = new PrismaClient({ adapter });
    this.signal = this.client.signal;
    this.siteLimitLog = this.client.siteLimitLog;
  }

  async onModuleInit() { await this.client.$connect(); }
  async onModuleDestroy() { await this.client.$disconnect(); }
}