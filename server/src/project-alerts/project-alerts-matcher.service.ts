import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { EmailService } from '../notifications/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

type AlertRow = {
  id: string;
  userId: string;
  industry: string | null;
  country: string | null;
  q: string | null;
  tags: string[];
  notifyByEmail: boolean;
  user: { email: string };
};

@Injectable()
export class ProjectAlertsMatcherService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
  ) {}

  /** Вызывается после публикации OPEN-проекта */
  async notifyMatchingSubscribers(project: Project) {
    const alerts = await this.prisma.projectAlert.findMany({
      where: {
        isActive: true,
        userId: { not: project.clientId },
      },
      include: { user: { select: { email: true } } },
    });

    for (const alert of alerts) {
      if (!this.matches(alert, project)) continue;
      await this.dispatch(alert, project);
    }
  }

  private matches(alert: AlertRow, project: Project): boolean {
    const industry = alert.industry?.trim();
    if (industry && project.industry) {
      if (project.industry.toLowerCase() !== industry.toLowerCase()) {
        return false;
      }
    } else if (industry && !project.industry) {
      return false;
    }

    const country = alert.country?.trim();
    if (country && project.country) {
      const c = country.toLowerCase();
      const p = project.country.toLowerCase();
      if (!p.includes(c) && p !== c) return false;
    } else if (country && !project.country) {
      return false;
    }

    const q = alert.q?.trim().toLowerCase();
    if (q) {
      const hay = [
        project.title,
        project.shortDescription ?? '',
        project.description,
        project.industry ?? '',
        ...project.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (alert.tags.length > 0) {
      const projectTags = project.tags.map((t) => t.toLowerCase());
      const overlap = alert.tags.some((t) =>
        projectTags.includes(t.trim().toLowerCase()),
      );
      if (!overlap) return false;
    }

    const hasAnyFilter =
      !!industry || !!country || !!q || alert.tags.length > 0;
    if (!hasAnyFilter) return false;

    return true;
  }

  private async dispatch(alert: AlertRow, project: Project) {
    const link = `/projects/${project.id}`;
    const title = `New project: ${project.title}`;
    const body =
      project.shortDescription?.trim() ||
      project.description.slice(0, 160);

    await this.notifications.create({
      userId: alert.userId,
      type: 'PROJECT_ALERT',
      title,
      body,
      link,
    });

    if (alert.notifyByEmail && alert.user.email) {
      await this.email.sendProjectAlert(alert.user.email, { title, body, link });
    }
  }
}
