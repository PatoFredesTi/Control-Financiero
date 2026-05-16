import type { Debt } from '../../debts/types/debt';

export type ExpenseType = 'COMMON' | 'DEBT_PAYMENT';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  spentAt: string;
  paymentMethod?: string | null;
  type: ExpenseType;
  debtId?: string | null;
  debt?: Debt | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  description: string;
  amount: number;
  category: string;
  spentAt: string;
  paymentMethod?: string;
  type: ExpenseType;
  debtId?: string;
  notes?: string;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export type ExpenseFilters = {
  category?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
};
