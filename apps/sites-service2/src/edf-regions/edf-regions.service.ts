import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEdfRegionDto, UpdateEdfRegionDto } from './dto/edf-region.dto';

@Injectable()
export class EdfRegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.edfRegion.findMany({
      include: { _count: { select: { sites: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const region = await this.prisma.client.edfRegion.findUnique({ where: { id } });
    if (!region) throw new NotFoundException(`EDF region not found: ${id}`);
    return region;
  }

  async findByCode(code: string) {
    const region = await this.prisma.client.edfRegion.findUnique({ where: { code } });
    if (!region) throw new NotFoundException(`EDF region not found: ${code}`);
    return region;
  }

  async create(dto: CreateEdfRegionDto) {
    const existing = await this.prisma.client.edfRegion.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`EDF region already exists: ${dto.code}`);
    return this.prisma.client.edfRegion.create({ data: dto });
  }

  async update(id: string, dto: UpdateEdfRegionDto) {
    await this.findById(id);
    return this.prisma.client.edfRegion.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    const sitesCount = await this.prisma.client.site.count({ where: { edfRegionId: id } });
    if (sitesCount > 0) throw new ConflictException(`Cannot delete region with ${sitesCount} sites`);
    return this.prisma.client.edfRegion.delete({ where: { id } });
  }

  async seed() {
    const defaults = [
      { code: 'CORSE',      name: 'Corse',      provider: 'EDF', apiEndpoint: 'https://opendata-corse.edf.fr',      datasetId: 'signal-reseau-corse-recharge-vehicule-electrique' },
      { code: 'GUADELOUPE', name: 'Guadeloupe', provider: 'EDF', apiEndpoint: 'https://opendata-guadeloupe.edf.fr', datasetId: 'signal-reseau-guadeloupe-recharge-vehicule-electrique' },
      { code: 'MARTINIQUE', name: 'Martinique', provider: 'EDF', apiEndpoint: 'https://opendata-martinique.edf.fr', datasetId: 'signal-reseau-martinique-recharge-vehicule-electrique' },
      { code: 'GUYANE',     name: 'Guyane',     provider: 'EDF', apiEndpoint: 'https://opendata-guyane.edf.fr',     datasetId: 'signal-reseau-guyane-recharge-vehicule-electrique' },
      { code: 'REUNION',    name: 'La Réunion', provider: 'EDF', apiEndpoint: 'https://opendata-reunion.edf.fr',    datasetId: 'signal-reseau-reunion-recharge-vehicule-electrique' },
    ];
    const created: any[] = [];    for (const r of defaults) {
      const existing = await this.prisma.client.edfRegion.findUnique({ where: { code: r.code } });
      if (!existing) created.push(await this.prisma.client.edfRegion.create({ data: r }));
    }
    return { seeded: created.length, created };
  }
}
