export type CreditCardStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';
export type InstallmentPurchaseStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type InstallmentStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type CreditCard = {
  id: string;
  name: string;
  issuer?: string | null;
  limitAmount: number;
  usedAmount: number;
  billingDay: number;
  paymentDueDay: number;
  status: CreditCardStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { purchases: number };
};

export type InstallmentPurchase = {
  id: string;
  creditCardId: string;
  creditCard?: CreditCard;
  description: string;
  category: string;
  totalAmount: number;
  installmentsCount: number;
  monthlyAmount: number;
  paidAmount: number;
  pendingAmount: number;
  firstInstallmentAt: string;
  status: InstallmentPurchaseStatus;
  notes?: string | null;
  installments: Installment[];
};

export type Installment = {
  id: string;
  purchaseId: string;
  purchase?: InstallmentPurchase;
  number: number;
  amount: number;
  dueAt: string;
  status: InstallmentStatus;
  paidAt?: string | null;
  expenseId?: string | null;
};

export type CreditCardSummary = {
  totalCards: number;
  activeCards: number;
  totalLimit: number;
  totalUsed: number;
  totalAvailable: number;
  utilizationPercentage: number;
  totalPurchases: number;
  currentMonthPending: number;
  cards: CreditCard[];
};

export type UpcomingInstallmentsResponse = {
  month: number;
  year: number;
  total: number;
  pending: number;
  paid: number;
  installments: Installment[];
};

export type CreateCreditCardInput = {
  name: string;
  issuer?: string;
  limitAmount: number;
  billingDay: number;
  paymentDueDay: number;
  notes?: string;
};

export type CreateInstallmentPurchaseInput = {
  description: string;
  category: string;
  totalAmount: number;
  installmentsCount: number;
  firstInstallmentAt: string;
  notes?: string;
};
