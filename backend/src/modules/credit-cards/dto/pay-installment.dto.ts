import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PayInstallmentDto {
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
