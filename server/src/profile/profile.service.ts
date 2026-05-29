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

  /** Call when someone opens a public profile (e.g. /freelancers/:username). */
  async recordProfileView(profileUserId: string, viewerId?: string | null) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: profileUserId },
      select: { id: true },
    });
    if (!profile) return { viewCount: 0 };

    if (viewerId && viewerId === profileUserId) {
      const current = await this.prisma.profile.findUnique({
        where: { id: profile.id },
        select: { viewCount: true },
      });
      return { viewCount: current?.viewCount ?? 0 };
    }

    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        viewCount: { increment: 1 },
        profileViews: {
          create: { viewerId: viewerId ?? null },
        },
      },
      select: { viewCount: true },
    });

    return { viewCount: updated.viewCount };
  }
}
