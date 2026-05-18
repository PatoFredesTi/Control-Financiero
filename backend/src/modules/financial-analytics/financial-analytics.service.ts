import { Injectable } from '@nestjs/common';
import { DebtStatus, ExpenseType, InstallmentStatus, RecurringFrequency, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type AnalyticsParams = {
  months: number;
  smallExpenseThreshold: number;
};

type RatioParams = {
  months: number;
};

type MonthBucket = {
  month: number;
  year: number;
  label: string;
  start: Date;
  end: Date;
};

type InsightTone = 'success' | 'warning' | 'danger' | 'info';

type Recommendation = {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: InsightTone;
  title: string;
  description: string;
  action: string;
};

const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'short', year: '2-digit' });

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function percentage(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function safeAverage(values: number[]) {
  const cleanValues = values.filter((value) => Number.isFinite(value));
  return cleanValues.length ? Math.round(cleanValues.reduce((sum, value) => sum + value, 0) / cleanValues.length) : 0;
}

function addMonths(base: Date, offset: number) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function buildMonthBuckets(months: number): MonthBucket[] {
  const now = new Date();
  const safeMonths = clamp(Math.round(months), 3, 24);
  const start = new Date(now.getFullYear(), now.getMonth() - safeMonths + 1, 1);

  return Array.from({ length: safeMonths }, (_, index) => {
    const date = addMonths(start, index);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      label: monthFormatter.format(date),
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    };
  });
}

function normalizeRecurringAmountToMonthly(amount: number, frequency: RecurringFrequency) {
  if (frequency === RecurringFrequency.WEEKLY) return Math.round(amount * 4.33);
  if (frequency === RecurringFrequency.BIWEEKLY) return Math.round(amount * 2.16);
  if (frequency === RecurringFrequency.YEARLY) return Math.round(amount / 12);
  return amount;
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

@Injectable()
export class FinancialAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRatios(params: RatioParams) {
    const months = clamp(Math.round(params.months || 6), 3, 24);
    const buckets = buildMonthBuckets(months);
    const start = buckets[0].start;
    const end = buckets[buckets.length - 1].end;

    const [incomes, expenses, debts, recurringMovements, budgets, creditCards] = await Promise.all([
      this.prisma.income.findMany({ where: { receivedAt: { gte: start, lt: end } }, select: { amount: true, receivedAt: true } }),
      this.prisma.expense.findMany({ where: { spentAt: { gte: start, lt: end } }, select: { amount: true, spentAt: true, type: true, category: true } }),
      this.prisma.debt.findMany({ select: { initialAmount: true, pendingAmount: true, paidAmount: true, status: true } }),
      this.prisma.recurringMovement.findMany({ where: { status: RecurringStatus.ACTIVE }, select: { amount: true, kind: true, frequency: true } }),
      this.prisma.budget.findMany({ where: { OR: buckets.map((bucket) => ({ month: bucket.month, year: bucket.year })) } }),
      this.prisma.creditCard.findMany({ select: { limitAmount: true, usedAmount: true } }),
    ]);

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalCommonExpenses = expenses.filter((expense) => expense.type === ExpenseType.COMMON).reduce((sum, item) => sum + item.amount, 0);
    const totalDebtPayments = expenses.filter((expense) => expense.type === ExpenseType.DEBT_PAYMENT).reduce((sum, item) => sum + item.amount, 0);
    const totalDebtPending = debts.reduce((sum, debt) => sum + debt.pendingAmount, 0);
    const totalDebtInitial = debts.reduce((sum, debt) => sum + debt.initialAmount, 0);
    const totalDebtPaid = debts.reduce((sum, debt) => sum + debt.paidAmount, 0);
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limitAmount, 0);
    const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.usedAmount, 0);

    const monthlyIncome = safeAverage(buckets.map((bucket) => incomes.filter((income) => income.receivedAt >= bucket.start && income.receivedAt < bucket.end).reduce((sum, income) => sum + income.amount, 0)));
    const monthlyExpenses = safeAverage(buckets.map((bucket) => expenses.filter((expense) => expense.spentAt >= bucket.start && expense.spentAt < bucket.end).reduce((sum, expense) => sum + expense.amount, 0)));
    const recurringMonthlyIncome = recurringMovements.filter((movement) => movement.kind === RecurringMovementKind.INCOME).reduce((sum, movement) => sum + normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);
    const recurringMonthlyOutflow = recurringMovements.filter((movement) => movement.kind !== RecurringMovementKind.INCOME).reduce((sum, movement) => sum + normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);

    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const budgetUsageRatio = totalBudgeted > 0 ? percentage(totalCommonExpenses, totalBudgeted) : 0;

    const ratios = {
      savingsRate: percentage(totalIncome - totalExpenses, totalIncome),
      expenseToIncomeRatio: percentage(totalExpenses, totalIncome),
      debtPaymentToIncomeRatio: percentage(totalDebtPayments, totalIncome),
      debtPendingToMonthlyIncomeRatio: monthlyIncome > 0 ? Math.round((totalDebtPending / monthlyIncome) * 100) : 0,
      fixedCommitmentRatio: percentage(recurringMonthlyOutflow, Math.max(monthlyIncome, recurringMonthlyIncome)),
      budgetUsageRatio,
      debtProgressRatio: percentage(totalDebtPaid, totalDebtInitial),
      creditUtilizationRatio: percentage(totalCreditUsed, totalCreditLimit),
      monthlyBalanceAverage: monthlyIncome - monthlyExpenses,
    };

    const score = this.calculateFinancialScore(ratios);

    return {
      period: { months, start: start.toISOString(), end: end.toISOString() },
      totals: {
        totalIncome,
        totalExpenses,
        totalCommonExpenses,
        totalDebtPayments,
        totalDebtPending,
        totalDebtInitial,
        totalDebtPaid,
        totalCreditLimit,
        totalCreditUsed,
        monthlyIncomeAverage: monthlyIncome,
        monthlyExpenseAverage: monthlyExpenses,
        recurringMonthlyIncome,
        recurringMonthlyOutflow,
      },
      ratios,
      score,
    };
  }

  async getAdvancedAnalytics(params: AnalyticsParams) {
    const months = clamp(Math.round(params.months || 6), 3, 24);
    const smallExpenseThreshold = Math.max(Math.round(params.smallExpenseThreshold || 10000), 1000);
    const buckets = buildMonthBuckets(months);
    const start = buckets[0].start;
    const end = buckets[buckets.length - 1].end;
    const currentBucket = buckets[buckets.length - 1];
    const previousBucket = buckets[buckets.length - 2] ?? currentBucket;

    const [incomes, expenses, debts, budgets, recurringMovements, savingsGoals, installments, creditCards] = await Promise.all([
      this.prisma.income.findMany({ where: { receivedAt: { gte: start, lt: end } }, orderBy: { receivedAt: 'asc' } }),
      this.prisma.expense.findMany({ where: { spentAt: { gte: start, lt: end } }, orderBy: { spentAt: 'asc' } }),
      this.prisma.debt.findMany({ orderBy: [{ status: 'asc' }, { pendingAmount: 'desc' }] }),
      this.prisma.budget.findMany({ where: { OR: buckets.map((bucket) => ({ month: bucket.month, year: bucket.year })) } }),
      this.prisma.recurringMovement.findMany({ where: { status: RecurringStatus.ACTIVE }, orderBy: { nextRunAt: 'asc' } }),
      this.prisma.savingsGoal.findMany({ include: { contributions: true } }),
      this.prisma.installment.findMany({ where: { status: InstallmentStatus.PENDING }, include: { purchase: { include: { creditCard: true } } }, orderBy: { dueAt: 'asc' } }),
      this.prisma.creditCard.findMany(),
    ]);

    const monthlyOverview = buckets.map((bucket) => {
      const bucketIncomes = incomes.filter((income) => income.receivedAt >= bucket.start && income.receivedAt < bucket.end);
      const bucketExpenses = expenses.filter((expense) => expense.spentAt >= bucket.start && expense.spentAt < bucket.end);
      const income = bucketIncomes.reduce((sum, item) => sum + item.amount, 0);
      const expense = bucketExpenses.reduce((sum, item) => sum + item.amount, 0);
      const commonExpenses = bucketExpenses.filter((expenseItem) => expenseItem.type === ExpenseType.COMMON).reduce((sum, item) => sum + item.amount, 0);
      const debtPayments = bucketExpenses.filter((expenseItem) => expenseItem.type === ExpenseType.DEBT_PAYMENT).reduce((sum, item) => sum + item.amount, 0);
      const balance = income - expense;

      return {
        month: bucket.month,
        year: bucket.year,
        label: bucket.label,
        income,
        expense,
        commonExpenses,
        debtPayments,
        balance,
        savingsRate: percentage(balance, income),
      };
    });

    const currentMonthExpenses = expenses.filter((expense) => expense.spentAt >= currentBucket.start && expense.spentAt < currentBucket.end);
    const previousMonthExpenses = expenses.filter((expense) => expense.spentAt >= previousBucket.start && expense.spentAt < previousBucket.end);
    const categoryTrends = this.buildCategoryTrends(expenses, currentMonthExpenses, previousMonthExpenses, buckets);
    const smallExpenses = this.buildSmallExpenses(currentMonthExpenses, smallExpenseThreshold);
    const recurringPressure = this.buildRecurringPressure(recurringMovements, monthlyOverview.at(-1)?.income ?? 0);
    const subscriptionAnalysis = this.buildSubscriptionAnalysis(recurringMovements, expenses);
    const debtAnalysis = this.buildDebtAnalysis(debts, monthlyOverview.at(-1)?.income ?? 0);
    const creditAnalysis = this.buildCreditAnalysis(creditCards, installments);
    const savingsAnalysis = this.buildSavingsAnalysis(savingsGoals, monthlyOverview.at(-1)?.income ?? 0);
    const budgetAnalysis = this.buildBudgetAnalysis(budgets, currentMonthExpenses, currentBucket);
    const ratiosResponse = await this.getRatios({ months });

    const recommendations = this.buildRecommendations({
      monthlyOverview,
      categoryTrends,
      smallExpenses,
      recurringPressure,
      subscriptionAnalysis,
      debtAnalysis,
      creditAnalysis,
      savingsAnalysis,
      budgetAnalysis,
      ratios: ratiosResponse.ratios,
    });

    return {
      period: { months, smallExpenseThreshold, start: start.toISOString(), end: end.toISOString(), currentMonth: currentBucket },
      score: ratiosResponse.score,
      totals: ratiosResponse.totals,
      ratios: ratiosResponse.ratios,
      monthlyOverview,
      categoryTrends,
      smallExpenses,
      recurringPressure,
      subscriptionAnalysis,
      debtAnalysis,
      creditAnalysis,
      savingsAnalysis,
      budgetAnalysis,
      recommendations,
    };
  }

  private buildCategoryTrends(expenses: Array<{ category: string; amount: number; spentAt: Date }>, currentMonthExpenses: Array<{ category: string; amount: number }>, previousMonthExpenses: Array<{ category: string; amount: number }>, buckets: MonthBucket[]) {
    const categories = Array.from(new Set(expenses.map((expense) => expense.category))).sort();

    return categories.map((category) => {
      const currentAmount = currentMonthExpenses.filter((expense) => expense.category.toLowerCase() === category.toLowerCase()).reduce((sum, expense) => sum + expense.amount, 0);
      const previousAmount = previousMonthExpenses.filter((expense) => expense.category.toLowerCase() === category.toLowerCase()).reduce((sum, expense) => sum + expense.amount, 0);
      const monthlyAmounts = buckets.map((bucket) => expenses.filter((expense) => expense.category.toLowerCase() === category.toLowerCase() && expense.spentAt >= bucket.start && expense.spentAt < bucket.end).reduce((sum, expense) => sum + expense.amount, 0));
      const averageAmount = safeAverage(monthlyAmounts);
      const changeVsPrevious = previousAmount > 0 ? Math.round(((currentAmount - previousAmount) / previousAmount) * 100) : currentAmount > 0 ? 100 : 0;
      const changeVsAverage = averageAmount > 0 ? Math.round(((currentAmount - averageAmount) / averageAmount) * 100) : currentAmount > 0 ? 100 : 0;
      const trend = changeVsPrevious > 15 ? 'UP' : changeVsPrevious < -15 ? 'DOWN' : 'STABLE';

      return { category, currentAmount, previousAmount, averageAmount, changeVsPrevious, changeVsAverage, trend, monthlyAmounts };
    }).sort((a, b) => b.currentAmount - a.currentAmount);
  }

  private buildSmallExpenses(expenses: Array<{ description: string; category: string; amount: number; spentAt: Date }>, threshold: number) {
    const items = expenses.filter((expense) => expense.amount > 0 && expense.amount <= threshold);
    const totalAmount = items.reduce((sum, expense) => sum + expense.amount, 0);
    const byCategory = Array.from(new Set(items.map((expense) => expense.category))).map((category) => {
      const categoryItems = items.filter((expense) => expense.category === category);
      return {
        category,
        count: categoryItems.length,
        amount: categoryItems.reduce((sum, expense) => sum + expense.amount, 0),
      };
    }).sort((a, b) => b.amount - a.amount);

    return {
      threshold,
      count: items.length,
      totalAmount,
      averageAmount: items.length ? Math.round(totalAmount / items.length) : 0,
      byCategory,
      topItems: items.sort((a, b) => b.amount - a.amount).slice(0, 10).map((item) => ({ description: item.description, category: item.category, amount: item.amount, date: item.spentAt.toISOString() })),
    };
  }

  private buildRecurringPressure(recurringMovements: Array<{ amount: number; kind: RecurringMovementKind; frequency: RecurringFrequency; description: string; category: string }>, monthlyIncome: number) {
    const recurringIncome = recurringMovements.filter((movement) => movement.kind === RecurringMovementKind.INCOME).reduce((sum, movement) => sum + normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);
    const recurringOutflow = recurringMovements.filter((movement) => movement.kind !== RecurringMovementKind.INCOME).reduce((sum, movement) => sum + normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);

    return {
      recurringIncome,
      recurringOutflow,
      netRecurringBalance: recurringIncome - recurringOutflow,
      pressureRatio: percentage(recurringOutflow, Math.max(monthlyIncome, recurringIncome)),
      topRecurringOutflows: recurringMovements
        .filter((movement) => movement.kind !== RecurringMovementKind.INCOME)
        .map((movement) => ({ description: movement.description, category: movement.category, monthlyAmount: normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), kind: movement.kind, frequency: movement.frequency }))
        .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
        .slice(0, 8),
    };
  }

  private buildSubscriptionAnalysis(recurringMovements: Array<{ amount: number; kind: RecurringMovementKind; frequency: RecurringFrequency; description: string; category: string }>, expenses: Array<{ description: string; category: string; amount: number }>) {
    const subscriptionKeywords = ['netflix', 'spotify', 'prime', 'disney', 'youtube', 'hbo', 'max', 'apple', 'icloud', 'gym', 'gimnasio', 'canva', 'notion', 'chatgpt', 'openai', 'dropbox', 'adobe', 'suscripcion', 'subscription'];

    const recurrentSubscriptions = recurringMovements
      .filter((movement) => movement.kind !== RecurringMovementKind.INCOME)
      .filter((movement) => subscriptionKeywords.some((keyword) => normalizeText(`${movement.description} ${movement.category}`).includes(keyword)))
      .map((movement) => ({ source: 'RECURRENT', description: movement.description, category: movement.category, monthlyAmount: normalizeRecurringAmountToMonthly(movement.amount, movement.frequency) }));

    const expenseSubscriptions = expenses
      .filter((expense) => subscriptionKeywords.some((keyword) => normalizeText(`${expense.description} ${expense.category}`).includes(keyword)))
      .map((expense) => ({ source: 'EXPENSE', description: expense.description, category: expense.category, monthlyAmount: expense.amount }));

    const items = [...recurrentSubscriptions, ...expenseSubscriptions]
      .sort((a, b) => b.monthlyAmount - a.monthlyAmount)
      .slice(0, 12);

    return {
      count: items.length,
      estimatedMonthlyAmount: items.reduce((sum, item) => sum + item.monthlyAmount, 0),
      items,
    };
  }

  private buildDebtAnalysis(debts: Array<{ name: string; initialAmount: number; pendingAmount: number; paidAmount: number; status: DebtStatus }>, monthlyIncome: number) {
    const activeDebts = debts.filter(
  (debt) =>
    (debt.status === DebtStatus.ACTIVE || debt.status === DebtStatus.OVERDUE) &&
    debt.pendingAmount > 0,
);
    const totalPending = activeDebts.reduce((sum, debt) => sum + debt.pendingAmount, 0);
    const totalInitial = debts.reduce((sum, debt) => sum + debt.initialAmount, 0);
    const totalPaid = debts.reduce((sum, debt) => sum + debt.paidAmount, 0);

    return {
      activeDebtsCount: activeDebts.length,
      totalPending,
      totalPaid,
      progressPercentage: percentage(totalPaid, totalInitial),
      pendingToMonthlyIncomeRatio: monthlyIncome > 0 ? Math.round((totalPending / monthlyIncome) * 100) : 0,
      highestDebts: activeDebts.sort((a, b) => b.pendingAmount - a.pendingAmount).slice(0, 5).map((debt) => ({ name: debt.name, pendingAmount: debt.pendingAmount, progressPercentage: percentage(debt.paidAmount, debt.initialAmount) })),
    };
  }

  private buildCreditAnalysis(creditCards: Array<{ name: string; limitAmount: number; usedAmount: number; status: string }>, installments: Array<{ amount: number; dueAt: Date; purchase: { description: string; creditCard: { name: string } } }>) {
    const totalLimit = creditCards.reduce((sum, card) => sum + card.limitAmount, 0);
    const totalUsed = creditCards.reduce((sum, card) => sum + card.usedAmount, 0);
    const upcomingCommitments = installments.slice(0, 12).map((installment) => ({
      description: installment.purchase.description,
      creditCard: installment.purchase.creditCard.name,
      amount: installment.amount,
      dueAt: installment.dueAt.toISOString(),
    }));

    return {
      cardsCount: creditCards.length,
      totalLimit,
      totalUsed,
      availableAmount: Math.max(totalLimit - totalUsed, 0),
      utilizationPercentage: percentage(totalUsed, totalLimit),
      upcomingInstallmentsAmount: installments.reduce((sum, installment) => sum + installment.amount, 0),
      upcomingCommitments,
    };
  }

  private buildSavingsAnalysis(savingsGoals: Array<{ name: string; targetAmount: number; currentAmount: number; targetDate: Date | null; contributions: Array<{ amount: number; contributedAt: Date }> }>, monthlyIncome: number) {
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const activeGoals = savingsGoals.filter((goal) => goal.currentAmount < goal.targetAmount);

    return {
      goalsCount: savingsGoals.length,
      activeGoalsCount: activeGoals.length,
      totalTarget,
      totalSaved,
      progressPercentage: percentage(totalSaved, totalTarget),
      savedToMonthlyIncomeRatio: percentage(totalSaved, monthlyIncome),
      goalsAtRisk: activeGoals
        .map((goal) => {
          if (!goal.targetDate) return null;
          const monthsRemaining = Math.max((goal.targetDate.getFullYear() - new Date().getFullYear()) * 12 + (goal.targetDate.getMonth() - new Date().getMonth()), 1);
          const monthlyRequired = Math.ceil(Math.max(goal.targetAmount - goal.currentAmount, 0) / monthsRemaining);
          return { name: goal.name, remainingAmount: Math.max(goal.targetAmount - goal.currentAmount, 0), targetDate: goal.targetDate.toISOString(), monthlyRequired, isAtRisk: monthlyIncome > 0 && monthlyRequired > monthlyIncome * 0.2 };
        })
        .filter((goal): goal is { name: string; remainingAmount: number; targetDate: string; monthlyRequired: number; isAtRisk: boolean } => Boolean(goal))
        .sort((a, b) => Number(b.isAtRisk) - Number(a.isAtRisk) || b.monthlyRequired - a.monthlyRequired),
    };
  }

  private buildBudgetAnalysis(budgets: Array<{ category: string; amount: number; month: number; year: number }>, currentMonthExpenses: Array<{ category: string; amount: number }>, currentBucket: MonthBucket) {
    const currentBudgets = budgets.filter((budget) => budget.month === currentBucket.month && budget.year === currentBucket.year);
    const usage = currentBudgets.map((budget) => {
      const spentAmount = currentMonthExpenses.filter((expense) => expense.category.toLowerCase() === budget.category.toLowerCase()).reduce((sum, expense) => sum + expense.amount, 0);
      return {
        category: budget.category,
        budgetAmount: budget.amount,
        spentAmount,
        remainingAmount: budget.amount - spentAmount,
        usagePercentage: percentage(spentAmount, budget.amount),
        status: spentAmount > budget.amount ? 'EXCEEDED' : spentAmount >= budget.amount * 0.8 ? 'RISK' : 'OK',
      };
    }).sort((a, b) => b.usagePercentage - a.usagePercentage);

    return {
      budgetsCount: currentBudgets.length,
      exceededCount: usage.filter((item) => item.status === 'EXCEEDED').length,
      atRiskCount: usage.filter((item) => item.status === 'RISK').length,
      usage,
    };
  }

  private calculateFinancialScore(ratios: { savingsRate: number; expenseToIncomeRatio: number; debtPaymentToIncomeRatio: number; debtPendingToMonthlyIncomeRatio: number; fixedCommitmentRatio: number; budgetUsageRatio: number; debtProgressRatio: number; creditUtilizationRatio: number; monthlyBalanceAverage: number }) {
    let score = 70;

    if (ratios.savingsRate >= 20) score += 15;
    else if (ratios.savingsRate >= 10) score += 8;
    else if (ratios.savingsRate < 0) score -= 25;
    else if (ratios.savingsRate < 5) score -= 10;

    if (ratios.expenseToIncomeRatio > 100) score -= 25;
    else if (ratios.expenseToIncomeRatio > 85) score -= 12;

    if (ratios.fixedCommitmentRatio > 60) score -= 15;
    else if (ratios.fixedCommitmentRatio > 45) score -= 8;

    if (ratios.debtPaymentToIncomeRatio > 40) score -= 12;
    else if (ratios.debtPaymentToIncomeRatio > 30) score -= 6;

    if (ratios.creditUtilizationRatio > 70) score -= 15;
    else if (ratios.creditUtilizationRatio > 40) score -= 7;

    if (ratios.budgetUsageRatio > 100) score -= 10;
    else if (ratios.budgetUsageRatio <= 80 && ratios.budgetUsageRatio > 0) score += 5;

    if (ratios.debtProgressRatio >= 50) score += 5;
    if (ratios.monthlyBalanceAverage > 0) score += 5;

    return {
      value: clamp(score),
      label: score >= 80 ? 'Salud financiera fuerte' : score >= 60 ? 'Salud financiera estable' : score >= 40 ? 'Atención necesaria' : 'Riesgo financiero alto',
      description: 'Score calculado a partir de ahorro, gasto, endeudamiento, compromisos fijos, presupuestos y uso de crédito.',
    };
  }

  private buildRecommendations(data: { monthlyOverview: Array<{ income: number; expense: number; balance: number; savingsRate: number }>; categoryTrends: Array<{ category: string; currentAmount: number; changeVsPrevious: number; changeVsAverage: number }>; smallExpenses: { count: number; totalAmount: number; threshold: number }; recurringPressure: { pressureRatio: number; recurringOutflow: number }; subscriptionAnalysis: { count: number; estimatedMonthlyAmount: number }; debtAnalysis: { totalPending: number; pendingToMonthlyIncomeRatio: number; activeDebtsCount: number }; creditAnalysis: { utilizationPercentage: number; totalUsed: number }; savingsAnalysis: { activeGoalsCount: number; progressPercentage: number; goalsAtRisk: Array<{ name: string; monthlyRequired: number; isAtRisk: boolean }> }; budgetAnalysis: { exceededCount: number; atRiskCount: number }; ratios: { savingsRate: number; expenseToIncomeRatio: number; fixedCommitmentRatio: number; creditUtilizationRatio: number } }) {
    const recommendations: Recommendation[] = [];
    const currentMonth = data.monthlyOverview.at(-1);
    const topGrowingCategory = data.categoryTrends.find((trend) => trend.currentAmount > 0 && trend.changeVsAverage > 20);

    if (currentMonth && currentMonth.balance < 0) {
      recommendations.push({
        priority: 'HIGH',
        type: 'danger',
        title: 'Balance mensual negativo',
        description: 'Tus gastos superan tus ingresos en el mes actual. Este es el principal foco de corrección.',
        action: 'Revisa gastos variables, pausa compras no urgentes y define un límite semanal de gasto.',
      });
    }

    if (data.ratios.savingsRate < 5) {
      recommendations.push({
        priority: 'HIGH',
        type: 'warning',
        title: 'Tasa de ahorro muy baja',
        description: 'La tasa de ahorro está bajo el 5%. Con este ritmo será difícil construir colchón financiero.',
        action: 'Automatiza una meta pequeña de ahorro al inicio del mes, aunque sea un monto bajo.',
      });
    }

    if (topGrowingCategory) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'warning',
        title: `Categoría al alza: ${topGrowingCategory.category}`,
        description: `Este mes está ${topGrowingCategory.changeVsAverage}% sobre su promedio reciente.`,
        action: 'Revisa los últimos movimientos de esta categoría y define un presupuesto específico.',
      });
    }

    if (data.smallExpenses.totalAmount > 0) {
      recommendations.push({
        priority: data.smallExpenses.totalAmount > 50000 ? 'MEDIUM' : 'LOW',
        type: 'info',
        title: 'Gastos hormiga detectados',
        description: `Hay ${data.smallExpenses.count} gastos menores o iguales a ${data.smallExpenses.threshold}. En conjunto suman un monto relevante.`,
        action: 'Agrupa esos gastos por categoría y elimina los que no aportan valor real.',
      });
    }

    if (data.subscriptionAnalysis.estimatedMonthlyAmount > 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'info',
        title: 'Suscripciones acumuladas',
        description: `Se detectaron ${data.subscriptionAnalysis.count} posibles suscripciones o servicios recurrentes.`,
        action: 'Cancela o pausa servicios que no hayas usado durante el último mes.',
      });
    }

    if (data.recurringPressure.pressureRatio > 50) {
      recommendations.push({
        priority: 'HIGH',
        type: 'warning',
        title: 'Compromisos fijos altos',
        description: 'Los recurrentes consumen más de la mitad de tu ingreso mensual estimado.',
        action: 'Negocia, elimina o reduce servicios fijos antes de atacar gastos pequeños.',
      });
    }

    if (data.creditAnalysis.utilizationPercentage > 60) {
      recommendations.push({
        priority: 'HIGH',
        type: 'danger',
        title: 'Uso de crédito elevado',
        description: 'El uso del cupo de tarjetas supera un nivel prudente y puede presionar meses futuros.',
        action: 'Evita nuevas compras en cuotas y prioriza liberar cupo en tarjetas con mayor uso.',
      });
    }

    if (data.budgetAnalysis.exceededCount > 0 || data.budgetAnalysis.atRiskCount > 0) {
      recommendations.push({
        priority: data.budgetAnalysis.exceededCount > 0 ? 'HIGH' : 'MEDIUM',
        type: data.budgetAnalysis.exceededCount > 0 ? 'danger' : 'warning',
        title: 'Presupuestos bajo presión',
        description: `${data.budgetAnalysis.exceededCount} presupuestos excedidos y ${data.budgetAnalysis.atRiskCount} cerca del límite.`,
        action: 'Ajusta el gasto del resto del mes o redistribuye presupuesto entre categorías.',
      });
    }

    const riskyGoal = data.savingsAnalysis.goalsAtRisk.find((goal) => goal.isAtRisk);
    if (riskyGoal) {
      recommendations.push({
        priority: 'MEDIUM',
        type: 'warning',
        title: `Meta exigente: ${riskyGoal.name}`,
        description: `Para llegar a tiempo necesitarías ahorrar aproximadamente ${riskyGoal.monthlyRequired} al mes.`,
        action: 'Amplía el plazo, reduce el objetivo o conecta la meta con un ahorro recurrente.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        type: 'success',
        title: 'Finanzas estables',
        description: 'No se detectaron señales críticas en el período analizado.',
        action: 'Mantén el registro constante y revisa tus tendencias una vez por semana.',
      });
    }

    return recommendations.sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.priority] - order[b.priority];
    }).slice(0, 8);
  }
}
