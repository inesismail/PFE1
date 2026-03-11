import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateEdfRegionDto {
  @IsString() code: string;
  @IsString() name: string;
  @IsString() apiEndpoint: string;
  @IsString() datasetId: string;
  @IsString() @IsOptional() apiKey?: string;
}

export class UpdateEdfRegionDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() apiEndpoint?: string;
  @IsString() @IsOptional() datasetId?: string;
  @IsString() @IsOptional() apiKey?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
}
