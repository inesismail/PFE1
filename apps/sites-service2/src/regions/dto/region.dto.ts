import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRegionDto {
  @IsString() code: string;
  @IsString() name: string;
  @IsString() @IsOptional() provider?: string;
  @IsString() @IsOptional() apiEndpoint?: string;
  @IsString() @IsOptional() datasetId?: string;
  @IsString() @IsOptional() apiKey?: string;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() countryCode?: string;
}

export class UpdateRegionDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() provider?: string;
  @IsString() @IsOptional() apiEndpoint?: string;
  @IsString() @IsOptional() datasetId?: string;
  @IsString() @IsOptional() apiKey?: string;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsString() @IsOptional() country?: string;
  @IsString() @IsOptional() countryCode?: string;
}
