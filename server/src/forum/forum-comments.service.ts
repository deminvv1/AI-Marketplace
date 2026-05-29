import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateForumCommentDto } from './dto/create-forum-comment.dto';

const authorSelect = {
  id: true,
  username: true,
  avatarUrl: true,
  profile: {
    select: { firstName: true, lastName: true },
  },
} as const;

const commentSelect = {
  id: true,
  content: true,
  postId: true,
  parentCommentId: true,
  likesCount: true,
  createdAt: true,
  author: { select: authorSelect },
  replies: {
    orderBy: { createdAt: 'asc' as const },
    select: {
      id: true,
      content: true,
      parentCommentId: true,
      likesCount: true,
      createdAt: true,
      author: { select: authorSelect },
    },
  },
} as const;

@Injectable()
export class ForumCommentsService {
  constructor(private prisma: PrismaService) {}

  /** Комментарии темы: верхний уровень + replies */
  async listForPost(postId: string) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Topic not found');

    return this.prisma.forumComment.findMany({
      where: { postId, parentCommentId: null },
      orderBy: { createdAt: 'asc' },
      select: commentSelect,
    });
  }

  async create(postId: string, authorId: string, dto: CreateForumCommentDto) {
    const post = await this.prisma.forumPost.findFirst({
      where: { id: postId, isDeleted: false },
      select: { id: true },
    });
    if (!post) throw new NotFoundException('Topic not found');

    if (dto.parentCommentId) {
      const parent = await this.prisma.forumComment.findFirst({
        where: { id: dto.parentCommentId, postId },
      });
      if (!parent) throw new NotFoundException('Parent comment not found');
    }

    return this.prisma.forumComment.create({
      data: {
        postId,
        authorId,
        content: dto.content.trim(),
        parentCommentId: dto.parentCommentId ?? null,
      },
      select: {
        id: true,
        content: true,
        postId: true,
        parentCommentId: true,
        likesCount: true,
        createdAt: true,
        author: { select: authorSelect },
      },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.forumComment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('Only the author can delete this comment');
    }
    await this.prisma.forumComment.delete({ where: { id: commentId } });
    return { success: true };
  }
}
