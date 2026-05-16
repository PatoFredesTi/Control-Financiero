import type { Debt } from '../../debts/types/debt';

export type ImportedMovementStatus = 'PENDING' | 'CLASSIFIED' | 'IMPORTED' | 'DUPLICATE' | 'IGNORED';
export type ImportedMovementType = 'INCOME' | 'EXPENSE' | 'DEBT_PAYMENT' | 'UNKNOWN';

export interface ImportedMovement {
  id: string;
  batchId: string;
  rowNumber: number;
  rawDate?: string | null;
  rawDescription: string;
  rawAmount: string;
  parsedDate?: string | null;
  description: string;
  amount: number;
  suggestedType: ImportedMovementType;
  suggestedCategory?: string | null;
  suggestedPaymentMethod?: string | null;
  debtId?: string | null;
  debt?: Debt | null;
  duplicateScore: number;
  possibleDuplicateId?: string | null;
  status: ImportedMovementStatus;
  importedEntityType?: string | null;
  importedEntityId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBatchSummary {
  total: number;
  pending: number;
  classified: number;
  imported: number;
  duplicates: number;
  ignored: number;
  incomes: number;
  expenses: number;
  debtPayments: number;
}

export interface ImportBatch {
  id: string;
  fileName?: string | null;
  source?: string | null;
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  movements: ImportedMovement[];
  summary: ImportBatchSummary;
}

export interface CreateImportPreviewInput {
  csvText: string;
  fileName?: string;
  source?: string;
  delimiter?: ',' | ';' | '\t' | 'auto';
  amountMode?: 'SIGNED' | 'DEBIT_CREDIT';
  bankTemplate?: string;
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
  notes?: string;
}

export type UpdateImportedMovementInput = Partial<Pick<ImportedMovement, 'description' | 'amount' | 'suggestedType' | 'suggestedCategory' | 'suggestedPaymentMethod' | 'debtId' | 'notes'>> & {
  parsedDate?: string;
};

export interface CommitImportResult {
  batch: ImportBatch;
  imported: Array<{ movementId: string; entityType: string; entityId: string }>;
  errors: Array<{ movementId: string; rowNumber: number; message: string }>;
  message: string;
}
