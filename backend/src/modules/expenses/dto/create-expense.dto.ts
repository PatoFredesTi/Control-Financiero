import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ExpenseType } from '@prisma/client';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsDateString()
  spentAt!: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsEnum(ExpenseType)
  type?: ExpenseType;

  @ValidateIf((expense) => expense.type === ExpenseType.DEBT_PAYMENT)
  @IsString()
  @IsNotEmpty({ message: 'La deuda asociada es obligatoria para pagos de deuda.' })
  debtId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
