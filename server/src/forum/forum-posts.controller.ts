import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { ListForumPostsQueryDto } from './dto/list-forum-posts-query.dto';
import { UpdateForumPostDto } from './dto/update-forum-post.dto';
import { ForumPostsService } from './forum-posts.service';

/**
 * Темы форума (ForumPost).
 * /api/forum/posts — зона Антона, см. docs/TASKS.md
 */
@Controller('forum/posts')
export class ForumPostsController {
  constructor(private posts: ForumPostsService) {}

  @Get()
  findAll(@Query() query: ListForumPostsQueryDto) {
    return this.posts.findAll(query);
  }

  /** GET /api/forum/posts/:id/liked — лайкнул ли текущий пользователь */
  @Get(':id/liked')
  @UseGuards(AuthGuard)
  liked(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.posts.isLiked(id, user.id);
  }

  /** POST /api/forum/posts/:id/like — toggle лайка */
  @Post(':id/like')
  @UseGuards(AuthGuard)
  toggleLike(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.posts.toggleLike(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posts.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateForumPostDto,
  ) {
    return this.posts.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateForumPostDto,
  ) {
    return this.posts.update(id, user.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.posts.remove(id, user.id);
  }
}
