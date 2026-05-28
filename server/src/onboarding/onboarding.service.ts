import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async complete(userId: string, dto: { role: Role; username: string }) {
    const username = dto.username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      throw new BadRequestException('Username must be 3–30 characters: letters, numbers, underscores only.');
    }

    const taken = await this.prisma.user.findUnique({ where: { username } });
    if (taken && taken.id !== userId) {
      throw new BadRequestException('This username is already taken.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role, username, onboardingCompleted: true },
    });

    return { success: true };
  }

  async createIfNotExists(userId: string, email: string, avatarUrl: string | null, role: Role) {
    const exists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (exists) return exists;

    return this.prisma.user.create({
      data: {
        id: userId,
        email,
        avatarUrl,
        role,
        profile: { create: {} },
        privacy: { create: {} },
      },
    });
  }
}
