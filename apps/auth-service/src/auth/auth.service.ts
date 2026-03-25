import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { sha256 } from './token.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(email: string, password: string, name?: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already exists');

    const hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      name,
      passwordHash: hash,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.safeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.safeUser(user) };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');

    const tokenHash = sha256(refreshToken);

    const stored = await this.usersService.findRefreshToken(tokenHash);
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    if (stored.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh token expired');

    // (Option sécurité) rotation: on supprime l’ancien et on en crée un nouveau
    await this.usersService.deleteRefreshToken(tokenHash);

    // On récupère le user
    const user = await this.usersService.findById(stored.userId);
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens(user.id, user.email);
    return { ...tokens, user: this.safeUser(user) };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { ok: true };

    const tokenHash = sha256(refreshToken);
    await this.usersService.deleteRefreshToken(tokenHash);
    return { ok: true };
  }

  async logoutAll(userId: string) {
    await this.usersService.deleteAllRefreshTokens(userId);
    return { ok: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hash);
    await this.usersService.deleteAllRefreshTokens(userId);
    return { message: 'Password changed successfully' };
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    // refresh token random + stocké hashé
    const rawRefresh = crypto.randomBytes(48).toString('hex');
    const refreshTokenHash = sha256(rawRefresh);

    const days = Number(this.config.get('JWT_REFRESH_EXPIRY_DAYS') ?? 7);
    console.log('JWT_REFRESH_EXPIRY_DAYS =', this.config.get('JWT_REFRESH_EXPIRY_DAYS'));
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
if (Number.isNaN(expiresAt.getTime())) {
  throw new Error('Invalid refresh token expiry date (check JWT_REFRESH_EXPIRY_DAYS)');
}
    await this.usersService.saveRefreshToken({
      userId,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken: rawRefresh };
  }

  private safeUser(user: any) {
    const { passwordHash, name, ...rest } = user;
    const parts = (name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    return { ...rest, firstName, lastName };
  }

  // ── Forgot Password ──

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If this email exists, a reset link has been generated.' };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await this.usersService.createPasswordResetToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    // Send reset email
    await this.mailService.sendPasswordResetEmail(email, resetLink);

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      // DEV ONLY — remove in production
      resetLink,
      token: rawToken,
    };
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    const tokenHash = sha256(token);
    const stored = await this.usersService.findPasswordResetToken(tokenHash);

    if (!stored) throw new BadRequestException('Invalid or expired reset token');
    if (stored.expiresAt.getTime() < Date.now()) throw new BadRequestException('Reset token has expired');

    const hash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(stored.userId, hash);
    await this.usersService.markPasswordResetTokenUsed(stored.id);
    await this.usersService.deleteAllRefreshTokens(stored.userId);

    return { message: 'Password has been reset successfully' };
  }
}