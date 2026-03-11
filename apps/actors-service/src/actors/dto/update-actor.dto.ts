import { IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdateActorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  config?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}