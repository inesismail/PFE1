import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private client: any;

  systemLog: any;

constructor() {
  const { PrismaClient } = require('.prisma/logs-client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const dbUrl = process.env.DATABASE_URL || '';
  const pool = new Pool({
    connectionString: dbUrl,
    options: `-c search_path=logs`,
  });
  const adapter = new PrismaPg(pool, { schema: 'logs' });
  this.client = new PrismaClient({ adapter });
  this.systemLog = this.client.systemLog;
}
  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log('Database connected (logs schema)');
    await this.createHypertables();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }

  private async createHypertables(): Promise<void> {
    try {
      const tsdbCheck = await (this.client as any).$queryRawUnsafe(
        `SELECT extname FROM pg_extension WHERE extname = 'timescaledb'`,
      );
      if (!tsdbCheck || tsdbCheck.length === 0) {
        this.logger.warn('TimescaleDB non trouvé — table normale utilisée');
        return;
      }
      const check = await (this.client as any).$queryRawUnsafe(
        `SELECT hypertable_name FROM timescaledb_information.hypertables
         WHERE hypertable_name = 'system_logs'`,
      );
      if (!check || check.length === 0) {
        await (this.client as any).$executeRawUnsafe(
          `SELECT public.create_hypertable('system_logs', 'timestamp', if_not_exists := TRUE, migrate_data := TRUE)`,
        );
        this.logger.log('Hypertable créée : system_logs');
      }
    } catch (error) {
      this.logger.warn(
        `Hypertable non critique : ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}