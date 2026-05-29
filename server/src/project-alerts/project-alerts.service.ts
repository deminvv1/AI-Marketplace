import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectAlertDto } from './dto/create-project-alert.dto';
import { UpdateProjectAlertDto } from './dto/update-project-alert.dto';

@Injectable()
export class ProjectAlertsService {
  constructor(private prisma: PrismaService) {}

  private async assertFreelancer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.FREELANCER && user.role !== Role.BOTH) {
      throw new ForbiddenException('Project alerts are for freelancers');
    }
  }

  list(userId: string) {
    return this.prisma.projectAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateProjectAlertDto) {
    await this.assertFreelancer(userId);
    return this.prisma.projectAlert.create({
      data: {
        userId,
        label: dto.label?.trim() || null,
        industry: dto.industry?.trim() || null,
        country: dto.country?.trim() || null,
        q: dto.q?.trim() || null,
        tags: dto.tags ?? [],
        notifyByEmail: dto.notifyByEmail ?? true,
      },
    });
  }

  async update(alertId: string, userId: string, dto: UpdateProjectAlertDto) {
    await this.assertOwner(alertId, userId);
    return this.prisma.projectAlert.update({
      where: { id: alertId },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() || null } : {}),
        ...(dto.industry !== undefined
          ? { industry: dto.industry.trim() || null }
          : {}),
        ...(dto.country !== undefined
          ? { country: dto.country.trim() || null }
          : {}),
        ...(dto.q !== undefined ? { q: dto.q.trim() || null } : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
        ...(dto.notifyByEmail !== undefined
          ? { notifyByEmail: dto.notifyByEmail }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async remove(alertId: string, userId: string) {
    await this.assertOwner(alertId, userId);
    await this.prisma.projectAlert.delete({ where: { id: alertId } });
    return { success: true };
  }

  private async assertOwner(alertId: string, userId: string) {
    const alert = await this.prisma.projectAlert.findUnique({
      where: { id: alertId },
    });
    if (!alert) throw new NotFoundException('Alert not found');
    if (alert.userId !== userId) throw new ForbiddenException();
  }
}
