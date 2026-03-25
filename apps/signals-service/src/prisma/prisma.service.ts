import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public client: any;
  public signal: any;
  public siteLimitLog: any;

  constructor() {
    const { PrismaClient } = require('.prisma/signals-client');
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

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log('Database connected (signals schema)');
    await this.createHypertables();
  }

  async onModuleDestroy() { await this.client.$disconnect(); }

  private async createHypertables(): Promise<void> {
    try {
      const tsdbCheck = await this.client.$queryRawUnsafe(
        `SELECT extname FROM pg_extension WHERE extname = 'timescaledb'`,
      );
      if (!tsdbCheck || tsdbCheck.length === 0) {
        this.logger.warn('TimescaleDB non trouvé — tables normales utilisées');
        return;
      }

      await this.ensureHypertable('Signal', 'time');
      await this.ensureHypertable('SiteLimitLog', 'time');
    } catch (error) {
      this.logger.warn(
        `Hypertable init non critique : ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private async ensureHypertable(table: string, timeColumn: string): Promise<void> {
    try {
      const check = await this.client.$queryRawUnsafe(
        `SELECT hypertable_name FROM timescaledb_information.hypertables WHERE hypertable_name = $1`,
        table,
      );
      if (!check || check.length === 0) {
        await this.client.$executeRawUnsafe(
          `SELECT public.create_hypertable('"${table}"', '${timeColumn}', if_not_exists := TRUE, migrate_data := TRUE)`,
        );
        this.logger.log(`Hypertable créée : ${table}`);
      } else {
        this.logger.log(`Hypertable déjà existante : ${table}`);
      }
    } catch (error) {
      this.logger.warn(
        `Hypertable ${table} non critique : ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}