import { Module } from "@nestjs/common";
import { ActorTypesController } from "./actor-types.controller";
import { ActorTypesService } from "./actor-types.service";

@Module({
  controllers: [ActorTypesController],
  providers: [ActorTypesService],
})
export class ActorTypesModule {}