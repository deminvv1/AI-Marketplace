import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL
      ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // socketId → userId
  private socketUser = new Map<string, string>();

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  /* ── Auth helper ─────────────────────────────────────────── */
  private async getUserId(client: Socket): Promise<string | null> {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) return null;
    const { data: { user } } = await this.supabase.auth.getUser(token);
    return user?.id ?? null;
  }

  /* ── Connect ─────────────────────────────────────────────── */
  async handleConnection(client: Socket) {
    const userId = await this.getUserId(client);
    if (!userId) { client.disconnect(); return; }

    this.socketUser.set(client.id, userId);
    client.join(`user:${userId}`);

    await this.prisma.profile.updateMany({
      where: { userId },
      data: { onlineStatus: true, lastSeenAt: new Date() },
    });

    // Notify contacts that user is online
    this.server.emit(`presence:${userId}`, { online: true });
  }

  /* ── Disconnect ──────────────────────────────────────────── */
  async handleDisconnect(client: Socket) {
    const userId = this.socketUser.get(client.id);
    this.socketUser.delete(client.id);
    if (!userId) return;

    // Only set offline if no other sockets for this user
    const stillConnected = [...this.socketUser.values()].some(id => id === userId);
    if (!stillConnected) {
      await this.prisma.profile.updateMany({
        where: { userId },
        data: { onlineStatus: false, lastSeenAt: new Date() },
      });
      this.server.emit(`presence:${userId}`, { online: false });
    }
  }

  /* ── Join conversation room ──────────────────────────────── */
  @SubscribeMessage('join_conversation')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = this.socketUser.get(client.id);
    if (!userId) return;

    // Verify participant
    const member = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: data.conversationId, userId } },
    });
    if (!member) return;

    client.join(`conv:${data.conversationId}`);
  }

  /* ── Send message ────────────────────────────────────────── */
  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const userId = this.socketUser.get(client.id);
    if (!userId || !data.content?.trim()) return;

    // Verify participant
    const member = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: data.conversationId, userId } },
    });
    if (!member) return;

    const content = data.content.trim();
    const now = new Date();

    const message = await this.prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: { conversationId: data.conversationId, senderId: userId, content },
        select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
      });
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: { lastMessageAt: now },
      });
      return msg;
    });

    // Broadcast to all in conversation room
    this.server
      .to(`conv:${data.conversationId}`)
      .emit('new_message', { conversationId: data.conversationId, message });

    // In-app notification + personal room ping for recipient
    const other = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId: data.conversationId, userId: { not: userId } },
      select: { userId: true },
    });
    if (other) {
      const sender = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, profile: { select: { firstName: true, lastName: true } } },
      });
      const senderName = [sender?.profile?.firstName, sender?.profile?.lastName]
        .filter(Boolean).join(' ') || sender?.username || 'Someone';

      const notif = await this.notifications.create({
        userId: other.userId,
        type: 'NEW_MESSAGE',
        title: `New message from ${senderName}`,
        body: content.slice(0, 100),
        link: '/messages',
      });

      // Push to recipient's personal room (if online)
      this.server.to(`user:${other.userId}`).emit('notification', notif);
    }

    return message;
  }

  /* ── Manual presence ────────────────────────────────────── */
  @SubscribeMessage('go_offline')
  async handleGoOffline(@ConnectedSocket() client: Socket) {
    const userId = this.socketUser.get(client.id);
    if (!userId) return;
    await this.prisma.profile.updateMany({
      where: { userId },
      data: { onlineStatus: false, lastSeenAt: new Date() },
    });
    this.server.emit(`presence:${userId}`, { online: false });
  }

  @SubscribeMessage('go_online')
  async handleGoOnline(@ConnectedSocket() client: Socket) {
    const userId = this.socketUser.get(client.id);
    if (!userId) return;
    await this.prisma.profile.updateMany({
      where: { userId },
      data: { onlineStatus: true, lastSeenAt: new Date() },
    });
    this.server.emit(`presence:${userId}`, { online: true });
  }

  /* ── Typing indicator ────────────────────────────────────── */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = this.socketUser.get(client.id);
    if (!userId) return;
    client.to(`conv:${data.conversationId}`).emit('typing', { userId, isTyping: data.isTyping });
  }
}