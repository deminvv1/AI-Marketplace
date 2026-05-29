import { IsOptional, IsString, MaxLength } from 'class-validator';

/** GET /api/solutions?industry=&format=&q= */
export class ListSolutionsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  format?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;
}
