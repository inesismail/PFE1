import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { sha256 } from './token.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
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

    return this.issueTokens(user.id, user.email);
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.email);
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

    return this.issueTokens(user.id, user.email);
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return { ok: true };

    const tokenHash = sha256(refreshToken);
    await this.usersService.deleteRefreshToken(tokenHash);
    return { ok: true };
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
}