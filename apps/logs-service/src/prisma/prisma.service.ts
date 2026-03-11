import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private client: PrismaClient;

  systemLog: any;

constructor() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool, { schema: 'logs' }); // ✅
  this.client = new PrismaClient({ adapter } as any);
  this.systemLog = (this.client as any).systemLog;
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
          `SELECT create_hypertable('system_logs', 'timestamp', if_not_exists => TRUE)`,
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