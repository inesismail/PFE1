import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDsoConnectionDto {
  @ApiProperty({ example: 'Enedis Mock', description: 'Nom du DSO' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: 'http://localhost:9999', description: 'URL de base du DSO (mock ou réel)' })
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty({ example: 'dso@enedis.fr' })
  @IsString()
  @IsNotEmpty()
  authEmail: string;

  @ApiProperty({
    example: 'token-enedis',
    description: 'Token DSO — tokens valides: token-enedis, token-geg, token-corse, token-lyon, token-paris, token-lille, token-metz, token-bordeaux, token-nantes, token-strasbourg'
  })
  @IsString()
  @IsNotEmpty()
  authPassword: string;

  @ApiPropertyOptional({ example: 'http://localhost:9999/tariff' })
  @IsString()
  @IsOptional()
  tariffUrl?: string;

  @ApiPropertyOptional({ example: 'http://localhost:9999/energy' })
  @IsString()
  @IsOptional()
  energyUrl?: string;
}