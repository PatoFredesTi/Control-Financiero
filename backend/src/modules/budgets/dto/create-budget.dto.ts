import { IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  category: string;

  @IsInt()
  @IsPositive()
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
