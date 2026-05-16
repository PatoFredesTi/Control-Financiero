import { IsIn, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateImportPreviewDto {
  @IsString()
  @MinLength(5)
  csvText!: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsIn([',', ';', '\t', 'auto'])
  delimiter?: ',' | ';' | '\t' | 'auto';

  @IsOptional()
  @IsIn(['SIGNED', 'DEBIT_CREDIT'])
  amountMode?: 'SIGNED' | 'DEBIT_CREDIT';

  @IsOptional()
  @IsString()
  bankTemplate?: string;

  @IsOptional()
  @IsObject()
  fieldMapping?: {
    date?: string;
    description?: string;
    amount?: string;
    debit?: string;
    credit?: string;
    type?: string;
    category?: string;
    paymentMethod?: string;
  };

  @IsOptional()
  @IsString()
  notes?: string;
}
