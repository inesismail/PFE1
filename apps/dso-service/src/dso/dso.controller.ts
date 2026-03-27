import 'dotenv/config';
import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DsoService } from './dso.service';
import {
  CreateDsoConnectionDto,
  UpdateDsoConnectionDto,
  TestDsoConnectionDto,
  CreateSiteLinkDto,
  CreateEnergySnapshotDto,
  CreateOptimizationLogDto,
  ToggleConnectionDto,
  ToggleSiteLinkDto,
  ToggleOptimizationDto,
} from './dto';

@ApiTags('DSO')
@Controller('dso')
export class DsoController {
  constructor(private readonly dsoService: DsoService) {}

  // ── Dashboard ─────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'DSO dashboard — résumé global' })
  getDashboard() {
    return this.dsoService.getDashboard();
  }

  // ── Types DSO disponibles (formulaire dynamique) ───────────────

  @Get('types')
  @ApiOperation({ summary: 'Types DSO disponibles — alimente la liste déroulante et adapte le formulaire' })
  getAvailableDsoTypes() {
    return this.dsoService.getAvailableDsoTypes();
  }

  // ── Connections ───────────────────────────────────────────────────

  @Get('connections')
  @ApiOperation({ summary: 'Liste toutes les connexions DSO' })
  getConnections() {
    return this.dsoService.getConnections();
  }

  @Post('connections/test')
  @ApiOperation({ summary: 'Tester une connexion DSO (mock ou réelle)' })
  testConnection(@Body() dto: TestDsoConnectionDto) {
    return this.dsoService.testConnection(dto.baseUrl, dto.token, dto.tariffUrl, dto.energyUrl);
  }

  @Post('connections')
  @ApiOperation({ summary: 'Créer une connexion DSO (valide le token mock ou réel)' })
  createConnection(@Body() dto: CreateDsoConnectionDto) {
    return this.dsoService.createConnection(dto);
  }

  @Get('connections/:id')
  @ApiOperation({ summary: 'Connexion DSO par ID' })
  getConnection(@Param('id') id: string) {
    return this.dsoService.getConnectionById(id);
  }

  @Put('connections/:id')
  @ApiOperation({ summary: 'Mettre à jour connexion DSO' })
  updateConnection(@Param('id') id: string, @Body() dto: UpdateDsoConnectionDto) {
    return this.dsoService.updateConnection(id, dto);
  }

  @Patch('connections/:id/toggle')
  @ApiOperation({ summary: 'Activer/désactiver connexion DSO' })
  toggleConnection(@Param('id') id: string, @Body() dto: ToggleConnectionDto) {
    return this.dsoService.toggleConnection(id, dto?.isActive);
  }

  @Delete('connections/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer connexion DSO' })
  deleteConnection(@Param('id') id: string) {
    return this.dsoService.deleteConnection(id);
  }

  // ── DSO Sites (mock ou réel) ──────────────────────────────────────
  @Get('connections/:id/sites')
  @ApiOperation({ summary: 'Sites du mock DSO pour cette connexion' })
  @ApiQuery({ name: 'count', required: false, description: 'Nombre de sites (max 10)' })
  getDsoSites(@Param('id') id: string, @Query('count') count?: string) {
    return this.dsoService.getDsoSites(id, count ? parseInt(count) : 3);
  }

  @Post('connections/:id/sync-sites')
  @ApiOperation({ summary: 'Sync sites du mock DSO → crée dans sites-service' })
  syncSites(@Param('id') id: string) {
    return this.dsoService.syncSites(id);
  }

  @Get('connections/:id/energy')
  @ApiOperation({ summary: 'Données énergie depuis mock DSO' })
  @ApiQuery({ name: 'site_id', required: true, description: 'ID du site DSO (ex: site-12345)' })
  getEnergy(@Param('id') id: string, @Query('site_id') siteId: string) {
    return this.dsoService.fetchEnergy(id, siteId);
  }

  @Get('connections/:id/tariff')
  @ApiOperation({ summary: 'Données tarif depuis mock DSO' })
  @ApiQuery({ name: 'site_id', required: true, description: 'ID du site DSO (ex: site-12345)' })
  getTariff(@Param('id') id: string, @Query('site_id') siteId: string) {
    return this.dsoService.fetchTariff(id, siteId);
  }

  // ── Site Links ────────────────────────────────────────────────────

  @Get('connections/:id/site-links')
  @ApiOperation({ summary: 'Site links d\'une connexion DSO' })
  getSiteLinks(@Param('id') id: string) {
    return this.dsoService.getSiteLinks(id);
  }

  @Post('connections/:id/site-links')
  @ApiOperation({ summary: 'Lier un site CPO à un site DSO' })
  createSiteLink(@Param('id') id: string, @Body() dto: CreateSiteLinkDto) {
    return this.dsoService.createSiteLink(id, dto);
  }

  @Get('site-links')
  @ApiOperation({ summary: 'Tous les site links' })
  getAllSiteLinks() {
    return this.dsoService.getAllSiteLinks();
  }

  @Get('site-links/:id')
  @ApiOperation({ summary: 'Site link par ID' })
  getSiteLink(@Param('id') id: string) {
    return this.dsoService.getSiteLinkById(id);
  }

  @Patch('site-links/:id/toggle')
  @ApiOperation({ summary: 'Activer/désactiver un site link' })
  toggleSiteLink(@Param('id') id: string, @Body() dto: ToggleSiteLinkDto) {
    return this.dsoService.toggleSiteLink(id, dto.enabled);
  }

  @Patch('site-links/:id/toggle-optimization')
  @ApiOperation({ summary: 'Activer/désactiver l\'optimisation énergie pour un site link' })
  toggleOptimization(@Param('id') id: string, @Body() dto: ToggleOptimizationDto) {
    return this.dsoService.toggleOptimization(id, dto.optimizationEnabled);
  }

  @Delete('site-links/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un site link' })
  deleteSiteLink(@Param('id') id: string) {
    return this.dsoService.deleteSiteLink(id);
  }

  // ── Sync Energy ───────────────────────────────────────────────────

  @Post('site-links/:id/sync-energy')
  @ApiOperation({ summary: 'Sync énergie depuis DSO → distribue entre tous les CPO liés au même site DSO' })
  syncEnergy(@Param('id') id: string) {
    return this.dsoService.syncEnergyForSiteLink(id);
  }

  @Post('connections/:id/sync-energy/:dsoSiteRef')
  @ApiOperation({ summary: 'Sync énergie pour un site DSO — distribue entre tous les CPO liés' })
  syncEnergyForDsoSite(@Param('id') id: string, @Param('dsoSiteRef') dsoSiteRef: string) {
    return this.dsoService.syncEnergyForDsoSite(id, dsoSiteRef);
  }

  // ── Snapshots manuels ─────────────────────────────────────────────
  @Post('site-links/:id/snapshots')
  @ApiOperation({ summary: 'Ajouter un snapshot énergie manuellement' })
  addSnapshot(@Param('id') id: string, @Body() dto: CreateEnergySnapshotDto) {
    return this.dsoService.addSnapshot(id, dto);
  }

  @Get('site-links/:id/snapshots')
  @ApiOperation({ summary: 'Snapshots énergie d\'un site link' })
  @ApiQuery({ name: 'limit', required: false })
  getSnapshots(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.dsoService.getSnapshots(id, limit ? parseInt(limit) : 100);
  }

  // ── Optimization Logs ─────────────────────────────────────────────

  @Post('optimization-logs')
  @ApiOperation({ summary: 'Créer un log d\'optimisation' })
  createLog(@Body() dto: CreateOptimizationLogDto) {
    return this.dsoService.createOptimizationLog(dto);
  }

  @Get('optimization-logs')
  @ApiOperation({ summary: 'Logs d\'optimisation avec filtres' })
  @ApiQuery({ name: 'dsoSiteRef', required: false })
  @ApiQuery({ name: 'level', required: false, enum: ['full', 'reduced', 'blocked'] })
  @ApiQuery({ name: 'triggeredBy', required: false, enum: ['auto', 'manual'] })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  getLogs(
    @Query('dsoSiteRef') dsoSiteRef?: string,
    @Query('level') level?: string,
    @Query('triggeredBy') triggeredBy?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.dsoService.getOptimizationLogs({
      dsoSiteRef, level, triggeredBy,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  @Get('optimization-logs/stats')
  @ApiOperation({ summary: 'Stats optimisation par période' })
  @ApiQuery({ name: 'sinceHours', required: false })
  getStats(@Query('sinceHours') sinceHours?: string) {
    return this.dsoService.getOptimizationStats(sinceHours ? parseInt(sinceHours) : 24);
  }

  @Get('optimization-logs/site/:dsoSiteRef')
  @ApiOperation({ summary: 'Logs par référence site DSO' })
  getLogsBySite(@Param('dsoSiteRef') ref: string, @Query('limit') limit?: string) {
    return this.dsoService.getOptimizationLogsBySite(ref, limit ? parseInt(limit) : 100);
  }

  // ── Compatibilité CPO ↔ DSO (régions) ─────────────────────────────

  @Get('connections/compatible')
  @ApiOperation({ summary: 'DSO compatibles avec un CPO (par régions)' })
  @ApiQuery({ name: 'regions', required: true, description: 'Régions du CPO séparées par virgule' })
  getCompatibleConnections(@Query('regions') regions: string) {
    const cpoRegions = regions.split(',').map(r => r.trim()).filter(Boolean);
    return this.dsoService.getCompatibleConnections(cpoRegions);
  }

  @Get('connections/:id/regions')
  @ApiOperation({ summary: 'Régions couvertes par un DSO' })
  getConnectionRegions(@Param('id') id: string) {
    return this.dsoService.getConnectionRegions(id);
  }

  @Post('connections/:id/check-compatibility')
  @ApiOperation({ summary: 'Vérifier la compatibilité CPO ↔ DSO' })
  checkCompatibility(@Param('id') id: string, @Body() body: { cpoRegions: string[] }) {
    return this.dsoService.checkCpoCompatibility(id, body.cpoRegions);
  }
}