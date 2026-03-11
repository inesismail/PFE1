import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateSiteDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() edfRegionId?: string;
  @IsNumber() @Min(0) @IsOptional() maxCapacityKw?: number;
  @IsNumber() @Min(0) @IsOptional() reducedLimitKw?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
}

export class AssignRegionDto {
  @IsString() edfRegionId: string;
  @IsNumber() @Min(0) @IsOptional() reducedLimitKw?: number;
}

export class SetSiteLimitDto {
  @IsNumber() @Min(0) limitKw: number;
}

export class ManualOverrideDto {
  @IsNumber() @Min(0) limitKw: number;
  @IsNumber() @Min(1) @IsOptional() durationMinutes?: number;
  @IsString() @IsOptional() endsAt?: string;
  @IsString() @IsOptional() reason?: string;
}
