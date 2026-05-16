import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateInstallmentPurchaseDto {
  @IsUUID('4')
  creditCardId!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsInt()
  @Min(1)
  totalAmount!: number;

  @IsInt()
  @Min(1)
  @Max(60)
  installmentsCount!: number;

  @IsDateString()
  firstInstallmentAt!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
