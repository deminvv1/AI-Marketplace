import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolutionDto } from './dto/create-solution.dto';
import { ListSolutionsQueryDto } from './dto/list-solutions-query.dto';
import { UpdateSolutionDto } from './dto/update-solution.dto';
import { TaxonomyService } from '../taxonomy/taxonomy.service';

const solutionSelect = {
  id: true,
  title: true,
  industry: true,
  description: true,
  format: true,
  price: true,
  preview: true,
  mediaUrls: true,
  tags: true,
  language: true,
  country: true,
  viewsCount: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  freelancer: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          rating: true,
          reviewsCount: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class SolutionsService {
  constructor(
    private prisma: PrismaService,
    private taxonomy: TaxonomyService,
  ) {}

  private async assertCanPublishSolutions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.FREELANCER && user.role !== Role.BOTH) {
      throw new ForbiddenException('Only freelancers can publish solutions');
    }
  }

  private async assertSolutionOwner(solutionId: string, userId: string) {
    const solution = await this.prisma.solution.findUnique({
      where: { id: solutionId },
      select: { id: true, freelancerId: true },
    });
    if (!solution) throw new NotFoundException('Solution not found');
    if (solution.freelancerId !== userId) {
      throw new ForbiddenException('Not your solution');
    }
    return solution;
  }

  /** Каталог: только опубликованные решения */
  findAll(query: ListSolutionsQueryDto = {}) {
    const industryName = query.industry?.trim()
      ? this.taxonomy.normalizeIndustry(query.industry)
      : null;
    const tag = query.tag?.trim().toLowerCase();
    const format = query.format?.trim();
    const country = query.country?.trim();
    const q = query.q?.trim();

    const where: Prisma.SolutionWhereInput = {
      isPublished: true,
      ...(industryName ? { industry: industryName } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(format ? { format: { equals: format, mode: 'insensitive' } } : {}),
      ...(country
        ? { country: { contains: country, mode: 'insensitive' } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { preview: { contains: q, mode: 'insensitive' } },
              { industry: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };

    return this.prisma.solution.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: solutionSelect,
    });
  }

  findMine(userId: string) {
    return this.prisma.solution.findMany({
      where: { freelancerId: userId },
      orderBy: { createdAt: 'desc' },
      select: solutionSelect,
    });
  }

  async findOne(id: string) {
    const solution = await this.prisma.solution.findUnique({
      where: { id },
      select: solutionSelect,
    });
    if (!solution) throw new NotFoundException('Solution not found');

    await this.prisma.solution.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return { ...solution, viewsCount: solution.viewsCount + 1 };
  }

  async create(userId: string, dto: CreateSolutionDto) {
    await this.assertCanPublishSolutions(userId);

    return this.prisma.solution.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        industry: this.taxonomy.normalizeIndustry(dto.industry),
        format: dto.format?.trim() || null,
        price: dto.price?.trim() || null,
        preview: dto.preview?.trim() || null,
        mediaUrls: dto.mediaUrls ?? [],
        tags: this.taxonomy.normalizeTags(dto.tags),
        language: dto.language?.trim() || null,
        country: dto.country?.trim() || null,
        isPublished: dto.isPublished ?? true,
        freelancerId: userId,
      },
      select: solutionSelect,
    });
  }

  async update(solutionId: string, userId: string, dto: UpdateSolutionDto) {
    await this.assertSolutionOwner(solutionId, userId);

    return this.prisma.solution.update({
      where: { id: solutionId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.industry !== undefined
          ? { industry: this.taxonomy.normalizeIndustry(dto.industry) }
          : {}),
        ...(dto.format !== undefined
          ? { format: dto.format?.trim() || null }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price?.trim() || null } : {}),
        ...(dto.preview !== undefined
          ? { preview: dto.preview?.trim() || null }
          : {}),
        ...(dto.mediaUrls !== undefined ? { mediaUrls: dto.mediaUrls } : {}),
        ...(dto.tags !== undefined
          ? { tags: this.taxonomy.normalizeTags(dto.tags) }
          : {}),
        ...(dto.language !== undefined
          ? { language: dto.language?.trim() || null }
          : {}),
        ...(dto.country !== undefined
          ? { country: dto.country?.trim() || null }
          : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
      },
      select: solutionSelect,
    });
  }

  async remove(solutionId: string, userId: string) {
    await this.assertSolutionOwner(solutionId, userId);
    await this.prisma.solution.delete({ where: { id: solutionId } });
    return { success: true };
  }
}
