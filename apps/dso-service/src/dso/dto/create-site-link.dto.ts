import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSiteLinkDto {
  @ApiProperty({ description: 'ID du site CPO (depuis sites-service)' })
  @IsString()
  @IsNotEmpty()
  siteId: string;

  @ApiProperty({ description: 'Référence du site dans le système DSO (ex: site-12345)' })
  @IsString()
  @IsNotEmpty()
  dsoSiteRef: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}