import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto/create-actor.dto';
import { UpdateActorDto } from './dto/update-actor.dto';

@ApiTags('Actors')
@Controller('actors')
export class ActorsController {
  constructor(private service: ActorsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les acteurs' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Acteur par ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Créer un acteur' })
  create(@Body() dto: CreateActorDto) { return this.service.create(dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un acteur' })
  update(@Param('id') id: string, @Body() dto: UpdateActorDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un acteur' })
  remove(@Param('id') id: string) { return this.service.delete(id); }
}