import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const blockedUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: { firstName: true, lastName: true },
  },
} as const;

@Injectable()
export class BlocksService {
  constructor(private prisma: PrismaService) {}

  async assertCanInteract(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new BadRequestException('Cannot interact with yourself');
    }
    const blocked = await this.prisma.blockedUser.findFirst({
      where: {
        OR: [
          { blockedById: userId, blockedId: otherUserId },
          { blockedById: otherUserId, blockedId: userId },
        ],
      },
    });
    if (blocked) {
      throw new ForbiddenException('Messaging is not available with this user');
    }
  }

  list(blockedById: string) {
    return this.prisma.blockedUser.findMany({
      where: { blockedById },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        blockedId: true,
        createdAt: true,
        blocked: { select: blockedUserSelect },
      },
    });
  }

  async block(blockedById: string, blockedId: string) {
    if (blockedById === blockedId) {
      throw new BadRequestException('Cannot block yourself');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: blockedId },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User not found');

    try {
      return await this.prisma.blockedUser.create({
        data: { blockedById, blockedId },
        select: {
          id: true,
          blockedId: true,
          createdAt: true,
          blocked: { select: blockedUserSelect },
        },
      });
    } catch {
      throw new BadRequestException('User is already blocked');
    }
  }

  async unblock(blockedById: string, blockedId: string) {
    const row = await this.prisma.blockedUser.findUnique({
      where: { blockedById_blockedId: { blockedById, blockedId } },
    });
    if (!row) throw new NotFoundException('Block not found');
    await this.prisma.blockedUser.delete({ where: { id: row.id } });
    return { success: true };
  }
}
