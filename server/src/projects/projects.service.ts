import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

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
  constructor(private prisma: PrismaService) {}

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

    return this.prisma.project.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        shortDescription: dto.shortDescription?.trim() || null,
        industry: dto.industry?.trim() || null,
        tags: dto.tags ?? [],
        budget: dto.budget?.trim() || null,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        country: dto.country?.trim() || null,
        language: dto.language?.trim() || null,
        workFormat: dto.workFormat?.trim() || null,
        clientId: userId,
      },
      select: projectListSelect,
    });
  }

  /** Публичный каталог: только OPEN (ещё принимают отклики). */
  findAll() {
    return this.prisma.project.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
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
}
