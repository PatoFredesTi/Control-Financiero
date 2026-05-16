import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class CommitImportBatchDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  movementIds?: string[];
}
