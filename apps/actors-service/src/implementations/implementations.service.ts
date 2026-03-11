import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ImplementationsService {
  constructor(private prisma: PrismaService) {}

  async available() {
    return this.prisma.client.implementation.findMany({
      where: { isActive: true },
      include: { implementationType: true },
    });
  }

  async actorImplementations(actorId: string) {
    return this.prisma.client.actorImplementation.findMany({
      where: { actorId },
      include: { implementation: true },
    });
  }

  async enable(actorId: string, implementationCode: string) {
    const impl = await this.prisma.client.implementation.findUniqueOrThrow({
      where: { code: implementationCode },
    });
    return this.prisma.client.actorImplementation.upsert({
      where: { actorId_implementationId: { actorId, implementationId: impl.id } },
      update: { isEnabled: true, enabledAt: new Date() },
      create: { actorId, implementationId: impl.id, isEnabled: true, enabledAt: new Date() },
    });
  }

  async disable(actorId: string, implementationCode: string) {
    const impl = await this.prisma.client.implementation.findUniqueOrThrow({
      where: { code: implementationCode },
    });
    return this.prisma.client.actorImplementation.update({
      where: { actorId_implementationId: { actorId, implementationId: impl.id } },
      data: { isEnabled: false, disabledAt: new Date() },
    });
  }
}