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
import { TaxonomyService } from '../taxonomy/taxonomy.service';

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
  constructor(
    private prisma: PrismaService,
    private taxonomy: TaxonomyService,
  ) {}

  /** Лента тем: не удалённые, закреплённые сверху */
  findAll(query: ListForumPostsQueryDto = {}) {
    const industryName = query.industry?.trim()
      ? this.taxonomy.normalizeIndustry(query.industry)
      : null;
    const tag = query.tag?.trim().toLowerCase();
    const q = query.q?.trim();

    const where: Prisma.ForumPostWhereInput = {
      isDeleted: false,
      ...(industryName ? { industry: industryName } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
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
        industry: this.taxonomy.normalizeIndustry(dto.industry),
        tags: this.taxonomy.normalizeTags(dto.tags),
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
          ? { industry: this.taxonomy.normalizeIndustry(dto.industry) }
          : {}),
        ...(dto.tags !== undefined
          ? { tags: this.taxonomy.normalizeTags(dto.tags) }
          : {}),
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

  /** Toggle лайка темы; синхронизируем denormalized likesCount */
  async toggleLike(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Topic not found');

    const existing = await this.prisma.forumPostLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.forumPostLike.delete({
          where: { userId_postId: { userId, postId } },
        }),
        this.prisma.forumPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      const updated = await this.prisma.forumPost.findUnique({
        where: { id: postId },
        select: { likesCount: true },
      });
      return { liked: false, likesCount: Math.max(0, updated?.likesCount ?? 0) };
    }

    await this.prisma.$transaction([
      this.prisma.forumPostLike.create({
        data: { userId, postId },
      }),
      this.prisma.forumPost.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } },
      }),
    ]);
    const updated = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      select: { likesCount: true },
    });
    return { liked: true, likesCount: updated?.likesCount ?? 1 };
  }

  async isLiked(postId: string, userId: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Topic not found');

    const like = await this.prisma.forumPostLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    return { liked: !!like };
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
