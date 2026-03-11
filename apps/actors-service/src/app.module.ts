import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from "../prisma/prisma.module";
import { ActorTypesModule } from "./actor-types/actor-types.module";
import { ActorsModule } from "./actors/actors.module";
import { ImplementationsModule } from "./implementations/implementations.module";
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [ PrismaModule,
    LogsModule,
    ActorTypesModule,
    ActorsModule,
    ImplementationsModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
