import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: { email: string; name?: string; passwordHash: string; role?: string }) {
    return this.prisma.user.create({ data });
  }

  updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateUser(id: string, data: { email?: string; name?: string; role?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  // refresh tokens
  async saveRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return this.prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  async deleteRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async findRefreshToken(tokenHash: string) {
    return this.prisma.refreshToken.findFirst({ where: { tokenHash } });
  }

  async deleteAllRefreshTokens(userId: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async getRefreshTokensByUser(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteRefreshTokenById(id: string) {
    return this.prisma.refreshToken.delete({ where: { id } });
  }

  // ── Password Reset Tokens ──

  async createPasswordResetToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
    // Invalidate any existing tokens for this user
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: data.userId } });
    return this.prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(tokenHash: string) {
    return this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null },
    });
  }

  async markPasswordResetTokenUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}