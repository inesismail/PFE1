import { Module } from "@nestjs/common";
import { ImplementationsController } from "./implementations.controller";
import { ImplementationsService } from "./implementations.service";

@Module({
  controllers: [ImplementationsController],
  providers: [ImplementationsService],
})
export class ImplementationsModule {}