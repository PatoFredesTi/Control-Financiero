export type Income = {
  id: string;
  description: string;
  amount: number;
  category: string;
  receivedAt: string;
  paymentMethod?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateIncomeInput = {
  description: string;
  amount: number;
  category: string;
  receivedAt: string;
  paymentMethod?: string;
  notes?: string;
};
