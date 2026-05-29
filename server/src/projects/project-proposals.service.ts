import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseStatus, Role } from '@prisma/client';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProposalDto } from './dto/create-proposal.dto';

/** Поля отклика, которые отдаём в API (список и карточка). */
const proposalSelect = {
  id: true,
  projectId: true,
  coverLetter: true,
  proposedBudget: true,
  estimatedDays: true,
  status: true,
  createdAt: true,
  freelancer: {
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          specialization: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class ProjectProposalsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  /** Только FREELANCER и BOTH могут откликаться на чужие OPEN-проекты. */
  private async assertCanPropose(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.FREELANCER && user.role !== Role.BOTH) {
      throw new ForbiddenException('Only freelancers can send proposals');
    }
  }

  /**
   * Создать отклик на проект.
   * Правила: проект OPEN, автор ≠ фрилансер, нет второго отклика с тем же freelancerId.
   */
  async create(projectId: string, freelancerId: string, dto: CreateProposalDto) {
    await this.assertCanPropose(freelancerId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true, clientId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.status !== 'OPEN') {
      throw new ForbiddenException('Project is not accepting proposals');
    }
    if (project.clientId === freelancerId) {
      throw new ForbiddenException('You cannot propose on your own project');
    }

    const existing = await this.prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: { projectId, freelancerId },
      },
    });
    if (existing) {
      throw new ConflictException('You already sent a proposal for this project');
    }

    return this.prisma.proposal.create({
      data: {
        projectId,
        freelancerId,
        coverLetter: dto.coverLetter.trim(),
        proposedBudget: dto.proposedBudget?.trim() || null,
        estimatedDays: dto.estimatedDays ?? null,
      },
      select: proposalSelect,
    });
  }

  /**
   * Список откликов по проекту — только владелец проекта (clientId).
   */
  async listForProjectOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== userId) {
      throw new ForbiddenException('Only the project owner can view proposals');
    }

    return this.prisma.proposal.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: proposalSelect,
    });
  }

  /**
   * Отклик текущего пользователя на конкретный проект (для формы «уже отправлено»).
   */
  async findMineOnProject(projectId: string, freelancerId: string) {
    return this.prisma.proposal.findUnique({
      where: {
        projectId_freelancerId: { projectId, freelancerId },
      },
      select: proposalSelect,
    });
  }

  /** Все отклики фрилансера — для /proposals и дашборда */
  async listMine(freelancerId: string) {
    await this.assertCanPropose(freelancerId);
    return this.prisma.proposal.findMany({
      where: { freelancerId },
      orderBy: { createdAt: 'desc' },
      select: {
        ...proposalSelect,
        project: {
          select: {
            id: true,
            title: true,
            status: true,
            industry: true,
            budget: true,
            country: true,
            client: { select: { username: true } },
          },
        },
      },
    });
  }

  private async assertProjectOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, clientId: true, status: true, freelancerId: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.clientId !== userId) {
      throw new ForbiddenException('Only the project owner can manage proposals');
    }
    return project;
  }

  /**
   * Принять отклик: Proposal → ACCEPTED, остальные PENDING → REJECTED,
   * Project.freelancerId = исполнитель, Project.status = IN_PROGRESS.
   */
  async accept(projectId: string, proposalId: string, clientId: string) {
    const project = await this.assertProjectOwner(projectId, clientId);
    if (project.status !== 'OPEN') {
      throw new BadRequestException('Project is no longer open for hiring');
    }

    const proposal = await this.prisma.proposal.findFirst({
      where: { id: proposalId, projectId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== ResponseStatus.PENDING) {
      throw new BadRequestException('Only pending proposals can be accepted');
    }

    const otherPending = await this.prisma.proposal.findMany({
      where: {
        projectId,
        status: ResponseStatus.PENDING,
        id: { not: proposalId },
      },
      select: { freelancerId: true },
    });

    const accepted = await this.prisma.$transaction(async (tx) => {
      await tx.proposal.updateMany({
        where: {
          projectId,
          status: ResponseStatus.PENDING,
          id: { not: proposalId },
        },
        data: { status: ResponseStatus.REJECTED },
      });

      await tx.proposal.update({
        where: { id: proposalId },
        data: { status: ResponseStatus.ACCEPTED },
      });

      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          freelancerId: proposal.freelancerId,
          status: 'IN_PROGRESS',
        },
        select: { id: true, title: true },
      });

      const result = await tx.proposal.findUnique({
        where: { id: proposalId },
        select: proposalSelect,
      });

      return { result, projectTitle: updatedProject.title };
    });

    await this.notifications.create({
      userId: proposal.freelancerId,
      type: 'PROPOSAL_ACCEPTED',
      title: `Proposal accepted: ${accepted.projectTitle}`,
      body: 'The client hired you for this project. Work is now in progress.',
      link: `/projects/${projectId}`,
    });

    await this.notifyProposalsRejected(
      otherPending.map((p) => p.freelancerId),
      accepted.projectTitle,
      'hired_other',
    );

    return accepted.result;
  }

  /** Отклонить один отклик (проект остаётся OPEN, freelancerId не меняется). */
  async reject(projectId: string, proposalId: string, clientId: string) {
    await this.assertProjectOwner(projectId, clientId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    const proposal = await this.prisma.proposal.findFirst({
      where: { id: proposalId, projectId },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== ResponseStatus.PENDING) {
      throw new BadRequestException('Only pending proposals can be rejected');
    }

    const result = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: ResponseStatus.REJECTED },
      select: proposalSelect,
    });

    await this.notifyProposalsRejected(
      [proposal.freelancerId],
      project.title,
      'declined',
    );

    return result;
  }

  private async notifyProposalsRejected(
    freelancerIds: string[],
    projectTitle: string,
    reason: 'declined' | 'hired_other',
  ) {
    const body =
      reason === 'hired_other'
        ? 'Another freelancer was hired for this project. It is now in progress.'
        : 'The client declined your proposal. The project is still open for others.';

    const uniqueIds = [...new Set(freelancerIds)];
    const title = `Proposal not selected: ${projectTitle}`;
    const link = '/proposals';

    await Promise.all(
      uniqueIds.map((userId) =>
        this.notifications.create({
          userId,
          type: 'PROPOSAL_REJECTED',
          title,
          body,
          link,
        }),
      ),
    );

    await this.sendProposalEmails(uniqueIds, title, body, link);
  }

  private async sendProposalEmails(
    userIds: string[],
    title: string,
    body: string,
    link: string,
  ) {
    if (userIds.length === 0) return;

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true },
    });

    await Promise.all(
      users.map((u) =>
        this.email.sendProposalUpdate(u.email, { title, body, link }),
      ),
    );
  }
}
