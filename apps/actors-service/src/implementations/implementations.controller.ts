import { Controller, Get, Param, Post } from "@nestjs/common";
import { ImplementationsService } from "./implementations.service";

@Controller()
export class ImplementationsController {
  constructor(private service: ImplementationsService) {}

  @Get("implementations/available")
  available() {
    return this.service.available();
  }

  @Get("actors/:id/implementations")
  actorImplementations(@Param("id") id: string) {
    return this.service.actorImplementations(id);
  }

  @Post("actors/:id/implementations/:code/enable")
  enable(@Param("id") id: string, @Param("code") code: string) {
    return this.service.enable(id, code);
  }

  @Post("actors/:id/implementations/:code/disable")
  disable(@Param("id") id: string, @Param("code") code: string) {
    return this.service.disable(id, code);
  }
}