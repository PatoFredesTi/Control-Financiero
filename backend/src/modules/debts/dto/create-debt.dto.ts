import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { DebtStatus } from '@prisma/client';

export class CreateDebtDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  creditor?: string;

  @IsInt()
  @Min(1)
  initialAmount!: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  estimatedEndDate?: string;

  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
