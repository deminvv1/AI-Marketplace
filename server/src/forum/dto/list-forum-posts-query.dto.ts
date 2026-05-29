import { IsOptional, IsString, MaxLength } from 'class-validator';

/** GET /api/forum/posts?industry=&q= */
export class ListForumPostsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
