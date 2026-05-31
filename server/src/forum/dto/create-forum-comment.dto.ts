import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

/** POST /api/forum/posts/:postId/comments */
export class CreateForumCommentDto {
  @IsString()
  @MinLength(1)
  content: string;

  /** Ответ на другой комментарий (опционально) */
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;
}
