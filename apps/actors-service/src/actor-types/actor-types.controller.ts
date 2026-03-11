import { Controller, Get } from "@nestjs/common";
import { ActorTypesService } from "./actor-types.service";

@Controller("actor-types")
export class ActorTypesController {
  constructor(private service: ActorTypesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}