import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

// ── Connection toggle ───────────────────────────────────────────────
export class ToggleConnectionDto {
  @ApiPropertyOptional({ example: true, description: 'Forcer l\'état actif/inactif (toggle si omis)' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ── Site-link toggle ────────────────────────────────────────────────
export class ToggleSiteLinkDto {
  @ApiProperty({ example: true, description: 'Activer ou désactiver le site link' })
  @IsBoolean()
  enabled: boolean;
}

// ── Optimization toggle ─────────────────────────────────────────────
export class ToggleOptimizationDto {
  @ApiProperty({ example: true, description: 'Activer ou désactiver l\'optimisation énergie' })
  @IsBoolean()
  optimizationEnabled: boolean;
}
