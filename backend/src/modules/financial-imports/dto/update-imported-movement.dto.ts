import { ImportedMovementType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateImportedMovementDto {
  @IsOptional()
  @IsDateString()
  parsedDate?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsEnum(ImportedMovementType)
  suggestedType?: ImportedMovementType;

  @IsOptional()
  @IsString()
  suggestedCategory?: string;

  @IsOptional()
  @IsString()
  suggestedPaymentMethod?: string;

  @IsOptional()
  @IsUUID('4')
  debtId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
