import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateEnergySnapshotDto {
  @ApiProperty({ example: 125.5, description: 'Énergie en kW' })
  @IsNumber()
  energieKw: number;

  @ApiProperty({ example: 0.11, description: 'Tarif en EUR/kWh' })
  @IsNumber()
  tarif: number;

  @ApiProperty({ example: 0, description: '0 = défavorable (Vert UI), 1 = favorable (Orange UI)' })
  @IsNumber()
  signal: number;

  @ApiPropertyOptional({ example: 45.0 })
  @IsNumber()
  @IsOptional()
  congestionLevel?: number;
}