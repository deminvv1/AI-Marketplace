import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  type: string;

  @IsString()
  @MinLength(1)
  targetId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  targetType: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
