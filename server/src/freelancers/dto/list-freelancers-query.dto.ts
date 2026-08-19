import { IsIn, IsOptional, IsString } from 'class-validator';
import { CATEGORY_SLUGS } from '../categories';

export class ListFreelancersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  /** Часть адреса страницы категории: ai-automation, programming и так далее. */
  @IsOptional()
  @IsIn(CATEGORY_SLUGS, { message: 'Unknown category.' })
  category?: string;
}
