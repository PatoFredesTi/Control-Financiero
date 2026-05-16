export type Budget = {
  id: string;
  category: string;
  amount: number;
  month: number;
  year: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
};

export type CreateBudgetInput = {
  category: string;
  amount: number;
  month: number;
  year: number;
  notes?: string;
};
