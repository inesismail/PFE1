import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TestDsoConnectionDto {
  @ApiProperty({ example: 'http://localhost:9999', description: 'URL de base du DSO' })
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty({ example: 'token-enedis', description: 'Token d\'authentification DSO' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({ example: 'http://localhost:9999/tariff' })
  @IsString()
  @IsOptional()
  tariffUrl?: string;

  @ApiPropertyOptional({ example: 'http://localhost:9999/energy' })
  @IsString()
  @IsOptional()
  energyUrl?: string;
}
