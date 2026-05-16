export interface Income {
  id: string;
  description: string;
  amount: number;
  category: string;
  receivedAt: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  description: string;
  amount: number;
  category: string;
  receivedAt: string;
  paymentMethod?: string;
  notes?: string;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;

export type IncomeFilters = {
  category?: string;
  startDate?: string;
  endDate?: string;
};
