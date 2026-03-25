import { IsString, IsEmail, IsOptional, IsEnum, IsInt, IsBoolean, Min, Max, IsUrl } from 'class-validator';

export enum AuthType {
  CREDENTIALS = 'credentials',
  TOKEN = 'token',
}

export class ConnectCpoDto {
  @IsString()
  actorId: string;

  @IsUrl({ require_tld: false })
  baseUrl: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  authUrl?: string;

  @IsEnum(AuthType)
  authType: AuthType;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  tenant?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsInt()
  @Min(1)
  @Max(1440)
  @IsOptional()
  fetchIntervalMinutes?: number;
}

export class UpdateCpoConnectionDto {
  @IsUrl({ require_tld: false })
  @IsOptional()
  baseUrl?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsInt()
  @Min(1)
  @Max(1440)
  @IsOptional()
  fetchIntervalMinutes?: number;

  @IsBoolean()
  @IsOptional()
  fetchEnabled?: boolean;

  @IsString()
  @IsOptional()
  tenant?: string;
}
