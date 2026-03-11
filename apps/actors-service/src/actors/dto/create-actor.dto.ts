import { IsString, IsUUID, IsOptional, IsBoolean } from "class-validator";

export class CreateActorDto {
  @IsUUID()
  actorTypeId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  config?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}