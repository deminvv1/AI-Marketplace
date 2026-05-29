import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

/** POST /api/reviews — отзыв после завершённого проекта или напрямую пользователю */
export class CreateReviewDto {
  @IsUUID()
  toUserId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  text?: string;

  /** Если указан — отзыв привязан к проекту (один отзыв на проект) */
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
