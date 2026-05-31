import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** POST /api/forum/posts — новая тема (любой залогиненный). */
export class CreateForumPostDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
