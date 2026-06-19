import {
  CanActivate, ExecutionContext, Injectable,
  UnauthorizedException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    if (!req.user?.id) throw new UnauthorizedException();

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });
    if (!user || user.role !== 'ADMIN') throw new ForbiddenException('Admin only');

    return true;
  }
}
