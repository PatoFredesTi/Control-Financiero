import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateSavingsGoalDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsPositive()
  targetAmount: number;

  @IsOptional()
  @IsInt()
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  targetDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
