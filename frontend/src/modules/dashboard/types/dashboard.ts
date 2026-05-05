export type DashboardMovementType = 'INCOME' | 'EXPENSE';
export type DashboardExpenseType = 'COMMON' | 'DEBT_PAYMENT';
export type DashboardDebtStatus = 'ACTIVE' | 'PAID' | 'OVERDUE' | 'PAUSED';

export type DashboardRecentMovement = {
  id: string;
  type: DashboardMovementType;
  description: string;
  amount: number;
  category: string;
  date: string;
  expenseType?: DashboardExpenseType;
  debtName?: string | null;
};

export type DashboardSummary = {
  period: {
    month: number;
    year: number;
    monthStart: string;
    nextMonthStart: string;
  };
  totals: {
    totalIncomeThisMonth: number;
    totalExpenseThisMonth: number;
    totalCommonExpensesThisMonth: number;
    totalDebtPaymentsThisMonth: number;
    balanceThisMonth: number;
    totalDebtInitial: number;
    totalDebtPending: number;
    totalDebtPaid: number;
    debtProgressPercentage: number;
  };
  counts: {
    incomes: number;
    expenses: number;
    debts: number;
    activeDebts: number;
    paidDebts: number;
  };
  recentMovements: DashboardRecentMovement[];
};

export type MonthlyComparisonChartItem = {
  month: string;
  income: number;
  expense: number;
  balance: number;
};

export type ExpensesByCategoryChartItem = {
  category: string;
  amount: number;
  count: number;
};

export type ExpenseTypeBreakdownChartItem = {
  type: string;
  amount: number;
};

export type DebtProgressChartItem = {
  id: string;
  name: string;
  initialAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: DashboardDebtStatus;
  progressPercentage: number;
};

export type DashboardCharts = {
  period: {
    month: number;
    year: number;
    currentMonthStart: string;
    nextMonthStart: string;
    sixMonthsAgoStart: string;
  };
  monthlyComparison: MonthlyComparisonChartItem[];
  expensesByCategory: ExpensesByCategoryChartItem[];
  expenseTypeBreakdown: ExpenseTypeBreakdownChartItem[];
  debtProgress: DebtProgressChartItem[];
};
