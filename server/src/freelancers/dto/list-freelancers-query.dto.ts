import { IsOptional, IsString } from 'class-validator';

export class ListFreelancersQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
