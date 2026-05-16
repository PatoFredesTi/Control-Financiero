import type { Debt } from '../../debts/types/debt';

export type RecurringMovementKind = 'INCOME' | 'EXPENSE' | 'DEBT_PAYMENT';
export type RecurringFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
export type RecurringStatus = 'ACTIVE' | 'PAUSED' | 'FINISHED';

export interface RecurringMovement {
  id: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod?: string | null;
  kind: RecurringMovementKind;
  frequency: RecurringFrequency;
  nextRunAt: string;
  lastRunAt?: string | null;
  debtId?: string | null;
  debt?: Debt | null;
  status: RecurringStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringMovementInput {
  description: string;
  amount: number;
  category: string;
  paymentMethod?: string;
  kind: RecurringMovementKind;
  frequency: RecurringFrequency;
  nextRunAt: string;
  debtId?: string;
  status?: RecurringStatus;
  notes?: string;
}

export type UpdateRecurringMovementInput = Partial<CreateRecurringMovementInput>;
