import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LogsClient } from '../logs/logs.client';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

@Injectable()
export class ActorsService {
  constructor(
    private prisma: PrismaService,
    private logsClient: LogsClient,
  ) {}

async findAll() {
  console.log('prisma:', !!this.prisma);
  console.log('prisma.client:', this.prisma?.client);
  return this.prisma.client.actor.findMany({
    include: { actorType: true },
  });
}

  async findOne(id: string) {
    const actor = await this.prisma.client.actor.findUnique({
      where: { id },
      include: { actorType: true, implementations: { include: { implementation: true } } },
    });
    if (!actor) throw new NotFoundException(`Actor not found: ${id}`);
    return actor;
  }

  async create(dto: CreateActorDto) {
    const actor = await this.prisma.client.actor.create({ data: dto });
    await this.logsClient.log({
      level: 'INFO', source: 'ActorsService', action: 'CREATE_ACTOR',
      message: `Actor created: ${dto.code}`, metadata: { actorId: actor.id },
    });
    return actor;
  }

  async update(id: string, dto: UpdateActorDto) {
    await this.findOne(id);
    return this.prisma.client.actor.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.logsClient.log({
      level: 'WARN', source: 'ActorsService', action: 'DELETE_ACTOR',
      message: `Actor deleted: ${id}`,
    });
    return this.prisma.client.actor.delete({ where: { id } });
  }
}