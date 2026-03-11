import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOptimizationLogDto {
  @ApiProperty({ example: 'site--16886' })
  @IsString()
  dsoSiteRef: string;

  @ApiProperty({ example: 'Parc Marseille Campus' })
  @IsString()
  dsoSiteName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  siteLinkId?: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  energyKw: number;

  @ApiProperty({ example: 400 })
  @IsNumber()
  @Min(0)
  maxCapacityKw: number;

  @ApiProperty({ example: 280 })
  @IsNumber()
  @Min(0)
  computedLimitKw: number;

  @ApiProperty({ enum: ['full', 'reduced', 'stop'], example: 'full' })
  @IsIn(['full', 'reduced', 'stop'])
  level: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  appliedToCpo: boolean;

  @ApiProperty({ enum: ['auto', 'manual'], example: 'manual' })
  @IsIn(['auto', 'manual'])
  triggeredBy: string;
}