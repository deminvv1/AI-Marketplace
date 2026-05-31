import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

const reviewSelect = {
  id: true,
  rating: true,
  text: true,
  projectId: true,
  createdAt: true,
  fromUser: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      profile: { select: { firstName: true, lastName: true } },
    },
  },
  project: {
    select: { id: true, title: true },
  },
} as const;

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /** Пересчёт rating и reviewsCount в Profile получателя */
  private async syncProfileRating(toUserId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { toUserId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await this.prisma.profile.update({
      where: { userId: toUserId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewsCount: agg._count.id,
      },
    });
  }

  /** Отзывы о пользователе (публичная визитка / вкладка Reviews) */
  listForUser(toUserId: string) {
    return this.prisma.review.findMany({
      where: { toUserId },
      orderBy: { createdAt: 'desc' },
      select: reviewSelect,
    });
  }

  /** Отзыв по проекту (если есть) */
  async findByProject(projectId: string) {
    return this.prisma.review.findUnique({
      where: { projectId },
      select: reviewSelect,
    });
  }

  async create(fromUserId: string, dto: CreateReviewDto) {
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('You cannot review yourself');
    }

    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: {
          id: true,
          status: true,
          clientId: true,
          freelancerId: true,
        },
      });
      if (!project) throw new NotFoundException('Project not found');
      if (project.status !== 'COMPLETED') {
        throw new BadRequestException('Reviews are allowed only for completed projects');
      }
      if (project.clientId !== fromUserId) {
        throw new ForbiddenException('Only the project client can leave a project review');
      }
      if (!project.freelancerId || project.freelancerId !== dto.toUserId) {
        throw new BadRequestException('Review must be for the assigned freelancer');
      }

      const existing = await this.prisma.review.findUnique({
        where: { projectId: dto.projectId },
      });
      if (existing) {
        throw new ConflictException('This project already has a review');
      }
    }

    const review = await this.prisma.review.create({
      data: {
        fromUserId,
        toUserId: dto.toUserId,
        rating: dto.rating,
        text: dto.text?.trim() || null,
        projectId: dto.projectId ?? null,
      },
      select: reviewSelect,
    });

    await this.syncProfileRating(dto.toUserId);
    return review;
  }
}
