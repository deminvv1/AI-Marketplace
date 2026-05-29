import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateForumCommentDto } from './dto/create-forum-comment.dto';
import { ForumCommentsService } from './forum-comments.service';

/**
 * Комментарии к теме (ForumComment), вложенный ресурс.
 * /api/forum/posts/:postId/comments
 */
@Controller('forum/posts/:postId/comments')
export class ForumCommentsController {
  constructor(private comments: ForumCommentsService) {}

  @Get()
  list(@Param('postId') postId: string) {
    return this.comments.listForPost(postId);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Param('postId') postId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateForumCommentDto,
  ) {
    return this.comments.create(postId, user.id, dto);
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.comments.remove(commentId, user.id);
  }
}
