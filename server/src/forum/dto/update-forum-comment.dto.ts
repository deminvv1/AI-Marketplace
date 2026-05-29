import { IsString, MinLength } from 'class-validator';

/** PATCH комментария — только автор */
export class UpdateForumCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}
