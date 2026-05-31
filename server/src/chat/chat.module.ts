import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [ChatGateway],
})
export class ChatModule {}