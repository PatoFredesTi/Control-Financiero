import { RecurringFrequency, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRecurringMovementDto {
  @IsString()
  description: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsEnum(RecurringMovementKind)
  kind: RecurringMovementKind;

  @IsEnum(RecurringFrequency)
  frequency: RecurringFrequency;

  @IsString()
  nextRunAt: string;

  @IsOptional()
  @IsUUID()
  debtId?: string;

  @IsOptional()
  @IsEnum(RecurringStatus)
  status?: RecurringStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
