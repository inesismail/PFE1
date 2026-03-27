import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto, UpdateRegionDto } from './dto/region.dto';

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.region.findMany({
      include: { _count: { select: { sites: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const region = await this.prisma.client.region.findUnique({ where: { id } });
    if (!region) throw new NotFoundException(`Region not found: ${id}`);
    return region;
  }

  async findByCode(code: string) {
    const region = await this.prisma.client.region.findUnique({ where: { code } });
    if (!region) throw new NotFoundException(`Region not found: ${code}`);
    return region;
  }

  async findByCountry(countryCode: string) {
    return this.prisma.client.region.findMany({
      where: { countryCode },
      include: { _count: { select: { sites: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateRegionDto) {
    const existing = await this.prisma.client.region.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Region already exists: ${dto.code}`);
    return this.prisma.client.region.create({ data: dto });
  }

  async update(id: string, dto: UpdateRegionDto) {
    await this.findById(id);
    return this.prisma.client.region.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findById(id);
    const sitesCount = await this.prisma.client.site.count({ where: { regionId: id } });
    if (sitesCount > 0) throw new ConflictException(`Cannot delete region with ${sitesCount} sites`);
    return this.prisma.client.region.delete({ where: { id } });
  }

  async seed() {
    const defaults = [
      // EDF Island regions (with signal API)
      { code: 'CORSE',      name: 'Corse',      provider: 'EDF', apiEndpoint: 'https://opendata-corse.edf.fr',      datasetId: 'signal-reseau-corse-recharge-vehicule-electrique' },
      { code: 'GUADELOUPE', name: 'Guadeloupe', provider: 'EDF', apiEndpoint: 'https://opendata-guadeloupe.edf.fr', datasetId: 'signal-reseau-guadeloupe-recharge-vehicule-electrique' },
      { code: 'MARTINIQUE', name: 'Martinique', provider: 'EDF', apiEndpoint: 'https://opendata-martinique.edf.fr', datasetId: 'signal-reseau-martinique-recharge-vehicule-electrique' },
      { code: 'GUYANE',     name: 'Guyane',     provider: 'EDF', apiEndpoint: 'https://opendata-guyane.edf.fr',     datasetId: 'signal-reseau-guyane-recharge-vehicule-electrique' },
      { code: 'REUNION',    name: 'La Réunion', provider: 'EDF', apiEndpoint: 'https://opendata-reunion.edf.fr',    datasetId: 'signal-reseau-reunion-recharge-vehicule-electrique' },
      // Metropolitan French regions (Enedis / RTE)
      { code: 'ILE_DE_FRANCE',              name: 'Île-de-France',              provider: 'Enedis' },
      { code: 'AUVERGNE_RHONE_ALPES',       name: 'Auvergne-Rhône-Alpes',       provider: 'Enedis' },
      { code: 'PROVENCE_ALPES_COTE_AZUR',   name: "Provence-Alpes-Côte d'Azur", provider: 'Enedis' },
      { code: 'OCCITANIE',                  name: 'Occitanie',                  provider: 'Enedis' },
      { code: 'NOUVELLE_AQUITAINE',         name: 'Nouvelle-Aquitaine',         provider: 'Enedis' },
      { code: 'PAYS_DE_LA_LOIRE',           name: 'Pays de la Loire',           provider: 'Enedis' },
      { code: 'BRETAGNE',                   name: 'Bretagne',                   provider: 'Enedis' },
      { code: 'GRAND_EST',                  name: 'Grand Est',                  provider: 'Enedis' },
      { code: 'HAUTS_DE_FRANCE',            name: 'Hauts-de-France',            provider: 'Enedis' },
      { code: 'NORMANDIE',                  name: 'Normandie',                  provider: 'Enedis' },
      { code: 'BOURGOGNE_FRANCHE_COMTE',    name: 'Bourgogne-Franche-Comté',    provider: 'Enedis' },
      { code: 'CENTRE_VAL_DE_LOIRE',        name: 'Centre-Val de Loire',        provider: 'Enedis' },
    ];
    const created: any[] = [];    for (const r of defaults) {
      const existing = await this.prisma.client.region.findUnique({ where: { code: r.code } });
      if (!existing) created.push(await this.prisma.client.region.create({ data: r }));
    }
    return { seeded: created.length, created };
  }
}
