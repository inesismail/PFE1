import { Injectable } from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class ActorTypesService {
  constructor(private prisma: PrismaService) {}

 async findAll() {
  return this.prisma.client.actorType.findMany({
    orderBy: { code: 'asc' },
  });
}
}