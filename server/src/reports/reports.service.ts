import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  create(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        reporterId,
        type: dto.type.trim(),
        targetId: dto.targetId.trim(),
        targetType: dto.targetType.trim(),
        description: dto.description?.trim() || null,
      },
      select: {
        id: true,
        type: true,
        targetId: true,
        targetType: true,
        status: true,
        createdAt: true,
      },
    });
  }

  listMine(reporterId: string) {
    return this.prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        type: true,
        targetId: true,
        targetType: true,
        status: true,
        createdAt: true,
      },
    });
  }
}
