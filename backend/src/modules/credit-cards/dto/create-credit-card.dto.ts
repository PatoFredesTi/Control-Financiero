import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreditCardStatus } from '@prisma/client';

export class CreateCreditCardDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  issuer?: string;

  @IsInt()
  @Min(1)
  limitAmount!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  billingDay!: number;

  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay!: number;

  @IsOptional()
  @IsEnum(CreditCardStatus)
  status?: CreditCardStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
