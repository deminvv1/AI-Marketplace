import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileService } from '../profile/profile.service';
import { ListFreelancersQueryDto } from './dto/list-freelancers-query.dto';

/** Поля визитки фрилансера для GET /api/freelancers/:username */
const publicProfileSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      bio: true,
      country: true,
      language: true,
      specialization: true,
      industries: true,
      experience: true,
      rating: true,
      reviewsCount: true,
      completedProjectsCount: true,
      onlineStatus: true,
      viewCount: true,
      portfolioItems: {
        orderBy: { createdAt: 'desc' as const },
        take: 12,
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          url: true,
        },
      },
    },
  },
  privacy: {
    select: { profileVisible: true },
  },
} as const;

const listItemSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      specialization: true,
      country: true,
      rating: true,
      reviewsCount: true,
      onlineStatus: true,
    },
  },
} as const;

@Injectable()
export class FreelancersService {
  constructor(
    private prisma: PrismaService,
    private profile: ProfileService,
  ) {}

  private normalizeUsername(raw: string): string {
    return raw.trim().replace(/^@/, '').toLowerCase();
  }

  private isFreelancerRole(role: Role): boolean {
    return role === Role.FREELANCER || role === Role.BOTH;
  }

  /**
   * Каталог исполнителей (для /freelancers).
   * Только пользователи с username и profileVisible, роль FREELANCER/BOTH.
   */
  async list(query: ListFreelancersQueryDto = {}) {
    const q = query.q?.trim();
    const where: Prisma.UserWhereInput = {
      username: { not: null },
      role: { in: [Role.FREELANCER, Role.BOTH] },
      privacy: { profileVisible: true },
      ...(q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              {
                profile: {
                  is: {
                    OR: [
                      { firstName: { contains: q, mode: 'insensitive' } },
                      { lastName: { contains: q, mode: 'insensitive' } },
                      { specialization: { contains: q, mode: 'insensitive' } },
                      { bio: { contains: q, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: listItemSelect,
    });
    return users;
  }

  /**
   * «Публичная» визитка по @username — для залогиненных пользователей платформы.
   * Увеличивает Profile.viewCount через ProfileService.recordProfileView.
   */
  async getPublicByUsername(username: string, viewerId?: string | null) {
    const normalized = this.normalizeUsername(username);
    const user = await this.prisma.user.findFirst({
      where: { username: { equals: normalized, mode: 'insensitive' } },
      select: publicProfileSelect,
    });

    if (!user) throw new NotFoundException('Freelancer not found');
    if (!this.isFreelancerRole(user.role)) {
      throw new NotFoundException('This user is not a freelancer');
    }
    if (user.privacy && !user.privacy.profileVisible) {
      throw new ForbiddenException('Profile is hidden');
    }

    const { viewCount } = await this.profile.recordProfileView(user.id, viewerId);

    const { privacy: _privacy, ...rest } = user;
    return {
      ...rest,
      profile: user.profile ? { ...user.profile, viewCount } : null,
    };
  }
}
