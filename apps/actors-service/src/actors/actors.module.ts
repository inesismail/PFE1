import { Module } from "@nestjs/common";
import { ActorsController } from "./actors.controller";
import { ActorsService } from "./actors.service";
import { LogsModule } from '../logs/logs.module';


@Module({
  imports: [LogsModule],
  controllers: [ActorsController],
  providers: [ActorsService],
})
export class ActorsModule {}