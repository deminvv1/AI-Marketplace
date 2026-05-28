import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async checkEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true },
    });
    return { exists: !!user };
  }

  async createUser(id: string, email: string, avatarUrl: string | null, role: Role) {
    return this.prisma.user.create({
      data: {
        id,
        email,
        avatarUrl,
        role,
        profile: { create: {} },
        privacy: { create: {} },
      },
    });
  }
}
