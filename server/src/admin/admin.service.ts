import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [users, projects, solutions, forumPosts, proposals, reports] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.project.count(),
        this.prisma.solution.count(),
        this.prisma.forumPost.count(),
        this.prisma.proposal.count(),
        this.prisma.report.count(),
      ]);
    const blocked = await this.prisma.user.count({ where: { isBlocked: true } });
    return { users, projects, solutions, forumPosts, proposals, reports, blocked };
  }

  async listUsers(q?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = q
      ? {
          OR: [
            { email: { contains: q, mode: 'insensitive' as const } },
            { username: { contains: q, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isBlocked: true,
          createdAt: true,
          avatarUrl: true,
          profile: { select: { firstName: true, lastName: true, country: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async banUser(targetId: string, adminId: string) {
    if (targetId === adminId) throw new Error('Cannot ban yourself');
    return this.prisma.user.update({
      where: { id: targetId },
      data: { isBlocked: true },
      select: { id: true, isBlocked: true },
    });
  }

  async unbanUser(targetId: string) {
    return this.prisma.user.update({
      where: { id: targetId },
      data: { isBlocked: false },
      select: { id: true, isBlocked: true },
    });
  }

  async listReports(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, email: true, username: true } },
        },
      }),
      this.prisma.report.count(),
    ]);
    return { items, total, page, limit };
  }
}
