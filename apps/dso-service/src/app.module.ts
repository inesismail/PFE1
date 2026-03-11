import 'dotenv/config';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DsoMockModule } from './mock/dso-mock.module';
import { DsoModule } from './dso/dso.module';

@Module({
  imports: [PrismaModule, DsoMockModule, DsoModule],
})
export class AppModule {}