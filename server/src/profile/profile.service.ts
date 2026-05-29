import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { TaxonomyService } from '../taxonomy/taxonomy.service';

const portfolioSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  url: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class ProfileService {
  constructor(
    private prisma: PrismaService,
    private taxonomy: TaxonomyService,
  ) {}

  /** Свой профиль + портфолио (вкладка /profile). */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            portfolioItems: {
              orderBy: { createdAt: 'desc' },
              select: portfolioSelect,
            },
          },
        },
      },
    });
    return user;
  }

  private async getOwnedProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  private async assertPortfolioItemOwner(itemId: string, userId: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
      include: { profile: { select: { userId: true } } },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    if (item.profile.userId !== userId) {
      throw new ForbiddenException('Not your portfolio item');
    }
    return item;
  }

  /** Create — добавить кейс в портфолио */
  async createPortfolioItem(userId: string, dto: CreatePortfolioItemDto) {
    const profile = await this.getOwnedProfile(userId);
    return this.prisma.portfolioItem.create({
      data: {
        profileId: profile.id,
        type: dto.type.trim(),
        title: dto.title?.trim() || null,
        content: dto.content?.trim() || null,
        url: dto.url?.trim() || null,
      },
      select: portfolioSelect,
    });
  }

  /** Update — изменить свой кейс */
  async updatePortfolioItem(
    userId: string,
    itemId: string,
    dto: UpdatePortfolioItemDto,
  ) {
    await this.assertPortfolioItemOwner(itemId, userId);
    return this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        ...(dto.type !== undefined ? { type: dto.type.trim() } : {}),
        ...(dto.title !== undefined ? { title: dto.title?.trim() || null } : {}),
        ...(dto.content !== undefined ? { content: dto.content?.trim() || null } : {}),
        ...(dto.url !== undefined ? { url: dto.url?.trim() || null } : {}),
      },
      select: portfolioSelect,
    });
  }

  /** Delete — удалить свой кейс */
  async deletePortfolioItem(userId: string, itemId: string) {
    await this.assertPortfolioItemOwner(itemId, userId);
    await this.prisma.portfolioItem.delete({ where: { id: itemId } });
    return { success: true };
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
    const data: {
      firstName?: string | null;
      lastName?: string | null;
      bio?: string | null;
      specialization?: string | null;
      industries?: string[];
      experience?: string | null;
      country?: string | null;
      phone?: string | null;
    } = {
      firstName: dto.firstName?.trim() || null,
      lastName: dto.lastName?.trim() || null,
      bio: dto.bio?.trim() || null,
      specialization: dto.specialization?.trim() || null,
      experience: dto.experience?.trim() || null,
      country: dto.country?.trim() || null,
      phone: dto.phone?.trim() || null,
    };
    if (dto.industries !== undefined) {
      data.industries = this.taxonomy.normalizeIndustries(dto.industries);
    }

    await this.prisma.profile.update({
      where: { userId },
      data,
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
