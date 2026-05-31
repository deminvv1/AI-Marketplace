import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** PATCH /api/profile/portfolio/:itemId */
export class UpdatePortfolioItemDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;
}
