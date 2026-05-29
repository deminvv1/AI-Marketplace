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

const projectSelect = {
  id: true,
  title: true,
  shortDescription: true,
  industry: true,
  budget: true,
  country: true,
  status: true,
} as const;

const solutionSelect = {
  id: true,
  title: true,
  industry: true,
  price: true,
  preview: true,
  isPublished: true,
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

  /** Список избранного с карточками project / freelancer / solution */
  async list(userId: string, targetType?: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        userId,
        ...(targetType ? { targetType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const ids = (type: string) =>
      favorites.filter((f) => f.targetType === type).map((f) => f.targetId);

    const [users, projects, solutions] = await Promise.all([
      this.prisma.user.findMany({
        where: { id: { in: ids('freelancer') } },
        select: freelancerSelect,
      }),
      this.prisma.project.findMany({
        where: { id: { in: ids('project') } },
        select: projectSelect,
      }),
      this.prisma.solution.findMany({
        where: { id: { in: ids('solution') } },
        select: solutionSelect,
      }),
    ]);

    const freelancers = new Map(users.map((u) => [u.id, u]));
    const projectsById = new Map(projects.map((p) => [p.id, p]));
    const solutionsById = new Map(solutions.map((s) => [s.id, s]));

    return favorites.map((f) => ({
      ...f,
      freelancer:
        f.targetType === 'freelancer' ? freelancers.get(f.targetId) ?? null : null,
      project:
        f.targetType === 'project' ? projectsById.get(f.targetId) ?? null : null,
      solution:
        f.targetType === 'solution' ? solutionsById.get(f.targetId) ?? null : null,
    }));
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
