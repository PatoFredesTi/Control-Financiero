import { IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateGoalContributionDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsDateString()
  contributedAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
