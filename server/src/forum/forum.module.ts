import { Module } from '@nestjs/common';
import { ForumCommentsController } from './forum-comments.controller';
import { ForumCommentsService } from './forum-comments.service';
import { ForumPostsController } from './forum-posts.controller';
import { ForumPostsService } from './forum-posts.service';

/** ForumPost + ForumComment — обсуждения для залогиненных пользователей */
@Module({
  controllers: [ForumPostsController, ForumCommentsController],
  providers: [ForumPostsService, ForumCommentsService],
  exports: [ForumPostsService],
})
export class ForumModule {}
