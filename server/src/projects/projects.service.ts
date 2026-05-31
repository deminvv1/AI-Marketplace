import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectAlertsMatcherService } from '../project-alerts/project-alerts-matcher.service';
import { TaxonomyService } from '../taxonomy/taxonomy.service';

/**
 * Единый набор полей Project для списков и карточки.
 * Не тянем лишнее (attachments, freelancer) — только то, что нужно UI каталога.
 */
const projectListSelect = {
  id: true,
  title: true,
  shortDescription: true,
  description: true,
  industry: true,
  tags: true,
  budget: true,
  deadline: true,
  country: true,
  language: true,
  workFormat: true,
  status: true,
  createdAt: true,
  client: {
    select: { id: true, username: true, avatarUrl: true },
  },
  _count: { select: { proposals: true } },
} as const;

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private projectAlerts: ProjectAlertsMatcherService,
    private taxonomy: TaxonomyService,
  ) {}

  /** Публиковать проекты могут только CLIENT и BOTH (заказчик). */
  private async assertCanPostProjects(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.CLIENT && user.role !== Role.BOTH) {
      throw new ForbiddenException('Only clients can post projects');
    }
  }

  /** Создание проекта; clientId = id из JWT (Supabase). */
  async create(userId: string, dto: CreateProjectDto) {
    await this.assertCanPostProjects(userId);

    const industry = this.taxonomy.normalizeIndustry(dto.industry);
    const tags = this.taxonomy.normalizeTags(dto.tags);

    const project = await this.prisma.project.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        shortDescription: dto.shortDescription?.trim() || null,
        industry,
        tags,
        budget: dto.budget?.trim() || null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        country: dto.country?.trim() || null,
        language: dto.language?.trim() || null,
        workFormat: dto.workFormat?.trim() || null,
        clientId: userId,
      },
      select: projectListSelect,
    });

    const full = await this.prisma.project.findUnique({ where: { id: project.id } });
    if (full) {
      void this.projectAlerts.notifyMatchingSubscribers(full);
    }

    return project;
  }

  /**
   * Редактирование полей проекта — только владелец, только OPEN
   * (после accept меняется status / freelancerId).
   */
  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true, status: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== userId) {
      throw new ForbiddenException('Only the project owner can edit it');
    }
    if (project.status !== 'OPEN') {
      throw new BadRequestException(
        'Only open projects can be edited. Complete or cancel work first.',
      );
    }

    const data: Prisma.ProjectUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.shortDescription !== undefined) {
      data.shortDescription = dto.shortDescription.trim() || null;
    }
    if (dto.industry !== undefined) {
      data.industry = this.taxonomy.normalizeIndustry(dto.industry);
    }
    if (dto.tags !== undefined) data.tags = this.taxonomy.normalizeTags(dto.tags);
    if (dto.budget !== undefined) data.budget = dto.budget.trim() || null;
    if (dto.deadline !== undefined) {
      data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }
    if (dto.country !== undefined) data.country = dto.country.trim() || null;
    if (dto.language !== undefined) data.language = dto.language.trim() || null;
    if (dto.workFormat !== undefined) {
      data.workFormat = dto.workFormat.trim() || null;
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
      select: {
        ...projectListSelect,
        updatedAt: true,
        freelancerId: true,
        freelancer: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
  }

  /** Публичный каталог: только OPEN + опциональные фильтры из query. */
  findAll(query: ListProjectsQueryDto = {}) {
    const industry = query.industry?.trim();
    const tag = query.tag?.trim().toLowerCase();
    const country = query.country?.trim();
    const q = query.q?.trim();
    const industryName = industry
      ? this.taxonomy.normalizeIndustry(industry)
      : null;

    const where: Prisma.ProjectWhereInput = {
      status: 'OPEN',
      ...(industryName ? { industry: industryName } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(country
        ? { country: { contains: country, mode: 'insensitive' } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { shortDescription: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { industry: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };

    return this.prisma.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: projectListSelect,
    });
  }

  /**
   * Заказчик закрывает проект после работы: IN_PROGRESS → COMPLETED.
   * COMPLETED не попадает в каталог (там только OPEN).
   */
  async complete(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true, status: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== userId) {
      throw new ForbiddenException('Only the project owner can complete it');
    }
    if (project.status !== 'IN_PROGRESS') {
      throw new BadRequestException(
        'Only in-progress projects can be marked completed',
      );
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED' },
      select: projectListSelect,
    });
  }

  /** Личный кабинет заказчика: все его проекты, любой status. */
  findMine(userId: string) {
    return this.prisma.project.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      select: projectListSelect,
    });
  }

  /** Завершённые проекты: как заказчик и как исполнитель. */
  async findCompletedMine(userId: string) {
    const select = {
      ...projectListSelect,
      freelancerId: true,
      freelancer: {
        select: { id: true, username: true, avatarUrl: true },
      },
    } as const;

    const [asClient, asFreelancer] = await Promise.all([
      this.prisma.project.findMany({
        where: { clientId: userId, status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' },
        select,
      }),
      this.prisma.project.findMany({
        where: { freelancerId: userId, status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' },
        select,
      }),
    ]);

    return { asClient, asFreelancer };
  }

  /** Детальная страница /projects/[id] — без списка откликов (отдельный endpoint proposals). */
  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: {
        ...projectListSelect,
        updatedAt: true,
        freelancerId: true,
        freelancer: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  /**
   * Delete — только владелец (clientId).
   * Proposal удаляются каскадом (onDelete: Cascade в schema).
   */
  async remove(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== userId) {
      throw new ForbiddenException('Only the project owner can delete it');
    }

    await this.prisma.project.delete({ where: { id: projectId } });
    return { success: true };
  }
}
