import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Req, BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Admin: list all users ─────────────────────────────────────────
  @Get()
  async list(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const users = await this.usersService.findAll();
    let filtered = users;

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (u: any) => u.email.toLowerCase().includes(s) || u.name?.toLowerCase().includes(s),
      );
    }
    if (role) {
      filtered = filtered.filter((u: any) => u.role === role);
    }

    const p = Math.max(1, parseInt(page ?? '1'));
    const l = Math.min(100, Math.max(1, parseInt(limit ?? '50')));
    const total = filtered.length;
    const paginated = filtered.slice((p - 1) * l, p * l);

    return { users: paginated, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  // ── Admin: get user by id ─────────────────────────────────────────
  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new BadRequestException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Admin: create user ────────────────────────────────────────────
  @Post()
  async create(@Body() body: { email: string; password?: string; firstName?: string; lastName?: string; role?: string }) {
    const tempPassword = body.password || crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);
    const name = [body.firstName, body.lastName].filter(Boolean).join(' ') || undefined;
    const user = await this.usersService.create({ email: body.email, name, passwordHash: hash, role: body.role });
    const { passwordHash, ...safe } = user;
    return { user: safe, temporaryPassword: body.password ? undefined : tempPassword };
  }

  // ── Admin: update user ────────────────────────────────────────────
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: { email?: string; firstName?: string; lastName?: string; role?: string }) {
    const name = body.firstName || body.lastName
      ? [body.firstName, body.lastName].filter(Boolean).join(' ')
      : undefined;
    const data: any = {};
    if (body.email) data.email = body.email;
    if (name) data.name = name;
    if (body.role) data.role = body.role;
    const user = await this.usersService.updateUser(id, data);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Admin: delete user ────────────────────────────────────────────
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted' };
  }

  // ── Admin: lock account ───────────────────────────────────────────
  @Post(':id/lock')
  async lock(@Param('id') id: string) {
    // Simple implementation: set role to LOCKED or use a flag
    await this.usersService.updateUser(id, { role: 'LOCKED' });
    return { message: 'User account locked' };
  }

  // ── Admin: unlock account ─────────────────────────────────────────
  @Post(':id/unlock')
  async unlock(@Param('id') id: string) {
    await this.usersService.updateUser(id, { role: 'VIEWER' });
    return { message: 'User account unlocked' };
  }

  // ── Admin: revoke all tokens ──────────────────────────────────────
  @Post(':id/revoke-tokens')
  async revokeTokens(@Param('id') id: string) {
    await this.usersService.deleteAllRefreshTokens(id);
    return { message: 'All tokens revoked' };
  }

  // ── Admin: reset password ─────────────────────────────────────────
  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hash = await bcrypt.hash(tempPassword, 10);
    await this.usersService.updatePassword(id, hash);
    await this.usersService.deleteAllRefreshTokens(id);
    return { message: 'Password reset', temporaryPassword: tempPassword };
  }

  // ── Profile: get my profile ───────────────────────────────────────
  @Get('profile/me')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new BadRequestException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Profile: update my profile ────────────────────────────────────
  @Put('profile/me')
  async updateProfile(@Req() req: any, @Body() body: { firstName?: string; lastName?: string }) {
    const name = [body.firstName, body.lastName].filter(Boolean).join(' ') || undefined;
    const user = await this.usersService.updateUser(req.user.userId, name ? { name } : {});
    const { passwordHash, ...safe } = user;
    return safe;
  }

  // ── Profile: change password ──────────────────────────────────────
  @Post('profile/change-password')
  async changePassword(
    @Req() req: any,
    @Body() body: { currentPassword: string; newPassword: string; logoutOtherSessions?: boolean },
  ) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) throw new BadRequestException('User not found');

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const hash = await bcrypt.hash(body.newPassword, 10);
    await this.usersService.updatePassword(user.id, hash);

    if (body.logoutOtherSessions) {
      await this.usersService.deleteAllRefreshTokens(user.id);
    }

    return { message: 'Password changed successfully' };
  }

  // ── Profile: sessions ─────────────────────────────────────────────
  @Get('profile/sessions')
  async getSessions(@Req() req: any) {
    const tokens = await this.usersService.getRefreshTokensByUser(req.user.userId);
    return tokens.map((t: any) => ({
      id: t.id,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
    }));
  }

  @Delete('profile/sessions/:sessionId')
  async revokeSession(@Param('sessionId') sessionId: string) {
    await this.usersService.deleteRefreshTokenById(sessionId);
    return { message: 'Session revoked' };
  }
}
