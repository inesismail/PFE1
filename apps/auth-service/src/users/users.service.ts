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

  create(data: { email: string; name?: string; passwordHash: string }) {
    return this.prisma.user.create({ data });
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
}