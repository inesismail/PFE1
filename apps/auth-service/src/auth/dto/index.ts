import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'admin@flexee.fr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ example: 'Ismail' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@flexee.fr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class LogoutDto {
  @ApiProperty({ example: 'eyJhbGciOi...' })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}