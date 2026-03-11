import { Module } from '@nestjs/common';
import { SignalProcessorController } from './signal-processor.controller';
import { SignalProcessorService } from './signal-processor.service';
import { CpoConnectionsModule } from '../cpo-connections/cpo-connections.module';
import { PrismaModule } from '../prisma/prisma.module'; // ← add this


@Module({
  imports: [CpoConnectionsModule, PrismaModule], // ← add PrismaModule here
  controllers: [SignalProcessorController],
  providers: [SignalProcessorService],
  exports: [SignalProcessorService],
})
export class SignalProcessorModule {}
