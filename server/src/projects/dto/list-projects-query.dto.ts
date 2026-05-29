import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Query для GET /api/projects — фильтры каталога (только OPEN на бэке). */
export class ListProjectsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
