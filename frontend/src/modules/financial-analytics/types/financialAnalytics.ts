export type FinancialScore = {
  value: number;
  label: string;
  description: string;
};

export type FinancialRatios = {
  savingsRate: number;
  expenseToIncomeRatio: number;
  debtPaymentToIncomeRatio: number;
  debtPendingToMonthlyIncomeRatio: number;
  fixedCommitmentRatio: number;
  budgetUsageRatio: number;
  debtProgressRatio: number;
  creditUtilizationRatio: number;
  monthlyBalanceAverage: number;
};

export type MonthlyOverviewItem = {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
  commonExpenses: number;
  debtPayments: number;
  balance: number;
  savingsRate: number;
};

export type CategoryTrend = {
  category: string;
  currentAmount: number;
  previousAmount: number;
  averageAmount: number;
  changeVsPrevious: number;
  changeVsAverage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  monthlyAmounts: number[];
};

export type SmallExpenses = {
  threshold: number;
  count: number;
  totalAmount: number;
  averageAmount: number;
  byCategory: Array<{ category: string; count: number; amount: number }>;
  topItems: Array<{ description: string; category: string; amount: number; date: string }>;
};

export type RecurringPressure = {
  recurringIncome: number;
  recurringOutflow: number;
  netRecurringBalance: number;
  pressureRatio: number;
  topRecurringOutflows: Array<{ description: string; category: string; monthlyAmount: number; kind: string; frequency: string }>;
};

export type SubscriptionAnalysis = {
  count: number;
  estimatedMonthlyAmount: number;
  items: Array<{ source: string; description: string; category: string; monthlyAmount: number }>;
};

export type DebtAnalysis = {
  activeDebtsCount: number;
  totalPending: number;
  totalPaid: number;
  progressPercentage: number;
  pendingToMonthlyIncomeRatio: number;
  highestDebts: Array<{ name: string; pendingAmount: number; progressPercentage: number }>;
};

export type CreditAnalysis = {
  cardsCount: number;
  totalLimit: number;
  totalUsed: number;
  availableAmount: number;
  utilizationPercentage: number;
  upcomingInstallmentsAmount: number;
  upcomingCommitments: Array<{ description: string; creditCard: string; amount: number; dueAt: string }>;
};

export type SavingsAnalysis = {
  goalsCount: number;
  activeGoalsCount: number;
  totalTarget: number;
  totalSaved: number;
  progressPercentage: number;
  savedToMonthlyIncomeRatio: number;
  goalsAtRisk: Array<{ name: string; remainingAmount: number; targetDate: string; monthlyRequired: number; isAtRisk: boolean }>;
};

export type BudgetAnalysis = {
  budgetsCount: number;
  exceededCount: number;
  atRiskCount: number;
  usage: Array<{ category: string; budgetAmount: number; spentAmount: number; remainingAmount: number; usagePercentage: number; status: 'EXCEEDED' | 'RISK' | 'OK' }>;
};

export type FinancialRecommendation = {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action: string;
};

export type FinancialAnalyticsAdvanced = {
  period: { months: number; smallExpenseThreshold: number; start: string; end: string; currentMonth: { month: number; year: number; label: string; start: string; end: string } };
  score: FinancialScore;
  totals: Record<string, number>;
  ratios: FinancialRatios;
  monthlyOverview: MonthlyOverviewItem[];
  categoryTrends: CategoryTrend[];
  smallExpenses: SmallExpenses;
  recurringPressure: RecurringPressure;
  subscriptionAnalysis: SubscriptionAnalysis;
  debtAnalysis: DebtAnalysis;
  creditAnalysis: CreditAnalysis;
  savingsAnalysis: SavingsAnalysis;
  budgetAnalysis: BudgetAnalysis;
  recommendations: FinancialRecommendation[];
};
