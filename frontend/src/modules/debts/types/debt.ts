export type DebtStatus = 'ACTIVE' | 'PAID' | 'OVERDUE' | 'PAUSED';

export interface Debt {
  id: string;
  name: string;
  description?: string | null;
  creditor?: string | null;
  initialAmount: number;
  pendingAmount: number;
  paidAmount: number;
  startDate: string;
  estimatedEndDate?: string | null;
  status: DebtStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtInput {
  name: string;
  description?: string;
  creditor?: string;
  initialAmount: number;
  startDate: string;
  estimatedEndDate?: string;
  status?: DebtStatus;
  notes?: string;
}
