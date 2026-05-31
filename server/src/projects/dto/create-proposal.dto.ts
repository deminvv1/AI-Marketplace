import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

/**
 * Тело POST /api/projects/:projectId/proposals
 * Отклик фрилансера: сопроводительное письмо + ориентир по бюджету и срокам.
 */
export class CreateProposalDto {
  @IsString()
  @MinLength(10)
  coverLetter: string;

  @IsOptional()
  @IsString()
  proposedBudget?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  estimatedDays?: number;
}
