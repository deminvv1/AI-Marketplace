import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

const freelancerSelect = {
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
      onlineStatus: true,
    },
  },
} as const;

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, dto: ToggleFavoriteDto) {
    await this.assertTargetExists(dto.targetId, dto.targetType);

    try {
      return await this.prisma.favorite.create({
        data: {
          userId,
          targetId: dto.targetId,
          targetType: dto.targetType,
        },
      });
    } catch {
      throw new ConflictException('Already in favorites');
    }
  }

  async remove(userId: string, dto: ToggleFavoriteDto) {
    const fav = await this.prisma.favorite.findUnique({
      where: {
        userId_targetId_targetType: {
          userId,
          targetId: dto.targetId,
          targetType: dto.targetType,
        },
      },
    });
    if (!fav) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: { id: fav.id },
    });
    return { success: true };
  }

  /** Список избранного; для freelancer подтягиваем карточки пользователей */
  async list(userId: string, targetType?: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        ...(targetType ? { targetType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    if (targetType === 'freelancer' || (!targetType && favorites.some((f) => f.targetType === 'freelancer'))) {
      const freelancerFavs = favorites.filter((f) => f.targetType === 'freelancer');
      const users = await this.prisma.user.findMany({
        where: { id: { in: freelancerFavs.map((f) => f.targetId) } },
        select: freelancerSelect,
      });
      const byId = new Map(users.map((u) => [u.id, u]));
      return favorites.map((f) => ({
        ...f,
        freelancer: f.targetType === 'freelancer' ? byId.get(f.targetId) ?? null : null,
      }));
    }

    return favorites;
  }

  async isFavorited(userId: string, targetId: string, targetType: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: {
        userId_targetId_targetType: { userId, targetId, targetType },
      },
    });
    return { favorited: !!fav };
  }

  private async assertTargetExists(targetId: string, targetType: string) {
    if (targetType === 'freelancer') {
      const u = await this.prisma.user.findUnique({ where: { id: targetId } });
      if (!u) throw new NotFoundException('Freelancer not found');
      return;
    }
    if (targetType === 'project') {
      const p = await this.prisma.project.findUnique({ where: { id: targetId } });
      if (!p) throw new NotFoundException('Project not found');
      return;
    }
    if (targetType === 'solution') {
      const s = await this.prisma.solution.findUnique({ where: { id: targetId } });
      if (!s) throw new NotFoundException('Solution not found');
    }
  }
}
