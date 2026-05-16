export type MonthlyProjection = {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  cumulativeBalance: number;
};

export type SavingsProjection = {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  monthlySaving: number;
  projectedBalanceBeforeSaving: number;
  cumulativeSavedAmount: number;
  cumulativeBalanceAfterSaving: number;
};

export type DebtProjection = {
  id: string;
  name: string;
  initialPendingAmount: number;
  projectedPendingAmount: number;
  projectedPaidAmount: number;
  estimatedPaidInMonth: string | null;
};

export type DebtMonthlyProjection = {
  month: number;
  year: number;
  label: string;
  paidThisMonth: number;
  remainingDebt: number;
};

export type ProjectionRecommendation = {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
};

export type FinancialProjection = {
  period: {
    month: number;
    year: number;
    monthsAhead: number;
    startDate: string;
    endDate: string;
  };
  assumptions: {
    averageMonthlyIncome: number;
    averageMonthlyExpenses: number;
    averageMonthlyCommonExpenses: number;
    averageMonthlyDebtPayments: number;
    activeMonthlyRecurringIncome: number;
    activeMonthlyRecurringExpenses: number;
    activeMonthlyRecurringDebtPayments: number;
    baseMonthlyIncome: number;
    baseMonthlyExpenses: number;
    baseMonthlyCommonExpenses: number;
    baseMonthlyDebtPayments: number;
  };
  scenarioInputs: {
    expenseReductionPercentage: number;
    reducedExpensesAmount: number;
    extraDebtPayment: number;
    monthlySaving: number;
  };
  scenarios: {
    baseline: {
      name: string;
      description: string;
      finalBalance: number;
      monthly: MonthlyProjection[];
    };
    reducedExpenses: {
      name: string;
      description: string;
      monthlySavingsImpact: number;
      finalBalance: number;
      monthly: MonthlyProjection[];
    };
    savingsPlan: {
      name: string;
      description: string;
      projectedSavedAmount: number;
      finalBalanceAfterSaving: number;
      monthly: SavingsProjection[];
    };
    acceleratedDebtPayment: {
      name: string;
      description: string;
      totalDebtBefore: number;
      totalDebtAfter: number;
      totalDebtPaidInProjection: number;
      monthlyPaymentCapacity: number;
      debts: DebtProjection[];
      monthly: DebtMonthlyProjection[];
    };
  };
  recommendations: ProjectionRecommendation[];
};
