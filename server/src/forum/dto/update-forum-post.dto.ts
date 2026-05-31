import { IsArray, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** PATCH /api/forum/posts/:id — только автор темы */
export class UpdateForumPostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
