import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { ListForumPostsQueryDto } from './dto/list-forum-posts-query.dto';
import { UpdateForumPostDto } from './dto/update-forum-post.dto';

const authorSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: { firstName: true, lastName: true, country: true },
  },
} as const;

const postListSelect = {
  id: true,
  title: true,
  content: true,
  industry: true,
  tags: true,
  isPinned: true,
  likesCount: true,
  viewsCount: true,
  createdAt: true,
  updatedAt: true,
  author: { select: authorSelect },
  _count: { select: { comments: true } },
} as const;

@Injectable()
export class ForumPostsService {
  constructor(private prisma: PrismaService) {}

  /** Лента тем: не удалённые, закреплённые сверху */
  findAll(query: ListForumPostsQueryDto = {}) {
    const industry = query.industry?.trim();
    const q = query.q?.trim();

    const where: Prisma.ForumPostWhereInput = {
      isDeleted: false,
      ...(industry
        ? { industry: { equals: industry, mode: 'insensitive' } }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
              { tags: { has: q } },
            ],
          }
        : {}),
    };

    return this.prisma.forumPost.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      select: postListSelect,
    });
  }

  /** Карточка темы + счётчик просмотров */
  async findOne(id: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id, isDeleted: false },
      select: {
        ...postListSelect,
        authorId: true,
      },
    });
    if (!post) throw new NotFoundException('Topic not found');

    await this.prisma.forumPost.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return { ...post, viewsCount: post.viewsCount + 1 };
  }

  create(authorId: string, dto: CreateForumPostDto) {
    return this.prisma.forumPost.create({
      data: {
        title: dto.title.trim(),
        content: dto.content.trim(),
        industry: dto.industry?.trim() || null,
        tags: dto.tags ?? [],
        authorId,
      },
      select: postListSelect,
    });
  }

  async update(postId: string, userId: string, dto: UpdateForumPostDto) {
    await this.assertAuthor(postId, userId);
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.content !== undefined ? { content: dto.content.trim() } : {}),
        ...(dto.industry !== undefined
          ? { industry: dto.industry?.trim() || null }
          : {}),
        ...(dto.tags !== undefined ? { tags: dto.tags } : {}),
      },
      select: postListSelect,
    });
  }

  /** Мягкое удаление — isDeleted=true, комментарии остаются в БД */
  async remove(postId: string, userId: string) {
    await this.assertAuthor(postId, userId);
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    });
    return { success: true };
  }

  private async assertAuthor(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: { authorId: true, isDeleted: true },
    });
    if (!post || post.isDeleted) throw new NotFoundException('Topic not found');
    if (post.authorId !== userId) {
      throw new ForbiddenException('Only the author can edit this topic');
    }
  }
}
