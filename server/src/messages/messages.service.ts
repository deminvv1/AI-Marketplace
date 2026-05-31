import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BlocksService } from '../blocks/blocks.service';
import { SendMessageDto } from './dto/send-message.dto';

const participantUserSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: {
      firstName: true,
      lastName: true,
      onlineStatus: true,
    },
  },
} as const;

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private blocks: BlocksService,
  ) {}

  private async assertParticipant(conversationId: string, userId: string) {
    const row = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });
    if (!row) throw new ForbiddenException('Not a participant of this conversation');
  }

  private async findExistingDirect(userId: string, otherUserId: string) {
    const shared = await this.prisma.conversation.findMany({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: { select: { userId: true } },
      },
    });
    return (
      shared.find((c) => c.participants.length === 2) ?? null
    );
  }

  async listConversations(userId: string) {
    const memberships = await this.prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    const ids = memberships.map((m) => m.conversationId);
    if (ids.length === 0) return [];

    const conversations = await this.prisma.conversation.findMany({
      where: { id: { in: ids } },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participants: {
          include: { user: { select: participantUserSelect } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
      },
    });

    const unreadGroups = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        conversationId: { in: ids },
        senderId: { not: userId },
        isRead: false,
      },
      _count: { _all: true },
    });
    const unreadMap = new Map(
      unreadGroups.map((g) => [g.conversationId, g._count._all]),
    );

    return conversations.map((c) => {
      const other = c.participants.find((p) => p.userId !== userId)?.user;
      const last = c.messages[0] ?? null;
      return {
        id: c.id,
        lastMessageAt: c.lastMessageAt,
        otherUser: other ?? null,
        lastMessage: last,
        unreadCount: unreadMap.get(c.id) ?? 0,
      };
    });
  }

  async startOrGetConversation(userId: string, participantId: string) {
    await this.blocks.assertCanInteract(userId, participantId);

    const other = await this.prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true },
    });
    if (!other) throw new NotFoundException('User not found');

    const existing = await this.findExistingDirect(userId, participantId);
    if (existing) {
      return this.getConversation(userId, existing.id);
    }

    const created = await this.prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: {
        participants: {
          include: { user: { select: participantUserSelect } },
        },
      },
    });

    const otherUser =
      created.participants.find((p) => p.userId !== userId)?.user ?? null;

    return {
      id: created.id,
      lastMessageAt: created.lastMessageAt,
      otherUser,
      lastMessage: null,
      unreadCount: 0,
    };
  }

  async getConversation(userId: string, conversationId: string) {
    await this.assertParticipant(conversationId, userId);

    const c = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: { user: { select: participantUserSelect } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
      },
    });
    if (!c) throw new NotFoundException('Conversation not found');

    const unreadCount = await this.prisma.message.count({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
    });

    const otherUser =
      c.participants.find((p) => p.userId !== userId)?.user ?? null;

    return {
      id: c.id,
      lastMessageAt: c.lastMessageAt,
      otherUser,
      lastMessage: c.messages[0] ?? null,
      unreadCount,
    };
  }

  async listMessages(userId: string, conversationId: string) {
    await this.assertParticipant(conversationId, userId);

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        senderId: true,
        isRead: true,
        createdAt: true,
      },
    });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    await this.assertParticipant(conversationId, userId);

    const otherParticipant =
      await this.prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: { not: userId } },
        select: { userId: true },
      });
    if (otherParticipant) {
      await this.blocks.assertCanInteract(userId, otherParticipant.userId);
    }

    const content = dto.content.trim();
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          content,
        },
        select: {
          id: true,
          content: true,
          senderId: true,
          isRead: true,
          createdAt: true,
        },
      });
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      });
      return message;
    });
  }
}
