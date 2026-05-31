import { Module } from '@nestjs/common';
import { BlocksModule } from '../blocks/blocks.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [BlocksModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
