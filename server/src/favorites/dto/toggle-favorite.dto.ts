import { IsIn, IsString, IsUUID } from 'class-validator';

/** POST /api/favorites — добавить в избранное */
export class ToggleFavoriteDto {
  @IsString()
  @IsUUID()
  targetId: string;

  @IsString()
  @IsIn(['freelancer', 'project', 'solution'])
  targetType: 'freelancer' | 'project' | 'solution';
}
