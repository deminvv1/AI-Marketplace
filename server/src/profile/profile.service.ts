import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    return user;
  }

  async updateProfile(userId: string, dto: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    specialization?: string;
    industries?: string[];
    experience?: string;
    country?: string;
    phone?: string;
  }) {
    await this.prisma.profile.update({
      where: { userId },
      data: {
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        bio: dto.bio?.trim() || null,
        specialization: dto.specialization?.trim() || null,
        industries: dto.industries ?? [],
        experience: dto.experience?.trim() || null,
        country: dto.country?.trim() || null,
        phone: dto.phone?.trim() || null,
      },
    });
    return { success: true };
  }
}
