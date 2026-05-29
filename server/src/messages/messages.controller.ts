import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private messages: MessagesService) {}

  @Get('conversations')
  @UseGuards(AuthGuard)
  listConversations(@CurrentUser() user: { id: string }) {
    return this.messages.listConversations(user.id);
  }

  @Post('conversations')
  @UseGuards(AuthGuard)
  startConversation(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateConversationDto,
  ) {
    return this.messages.startOrGetConversation(user.id, dto.participantId);
  }

  @Get('conversations/:id')
  @UseGuards(AuthGuard)
  getConversation(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.messages.getConversation(user.id, id);
  }

  @Get('conversations/:id/messages')
  @UseGuards(AuthGuard)
  listMessages(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.messages.listMessages(user.id, id);
  }

  @Post('conversations/:id/messages')
  @UseGuards(AuthGuard)
  sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.sendMessage(user.id, id, dto);
  }
}
