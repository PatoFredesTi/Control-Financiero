import { Injectable } from '@nestjs/common';
import { ExpenseType, GoalStatus, InstallmentStatus, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FinancialAssistantContext, FinancialRulesEngine, financialRuleCatalog } from './financial-rules.engine';

function monthRange(month: number, year: number) {
  const safeMonth = Math.min(Math.max(Math.round(month), 1), 12);
  const safeYear = Math.max(Math.round(year), 2000);
  return {
    start: new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(safeYear, safeMonth, 1, 0, 0, 0, 0)),
    previousStart: new Date(Date.UTC(safeYear, safeMonth - 2, 1, 0, 0, 0, 0)),
    previousEnd: new Date(Date.UTC(safeYear, safeMonth - 1, 1, 0, 0, 0, 0)),
  };
}

function progress(current: number, target: number) {
  return target > 0 ? Math.round((current / target) * 100) : 0;
}

@Injectable()
export class FinancialAssistantService {
  private readonly engine = new FinancialRulesEngine();

  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyBriefing(month: number, year: number) {
    const context = await this.buildContext(month, year);
    const rules = this.engine.evaluate(context);
    const score = this.engine.calculateScore(context, rules);
    const actionPlan = this.engine.buildActionPlan(rules);
    const savingsRate = context.monthlyIncome > 0 ? Math.round(((context.monthlyIncome - context.monthlyExpenses) / context.monthlyIncome) * 100) : 0;
    const debtRatio = context.monthlyIncome > 0 ? Math.round((context.debtPayments / context.monthlyIncome) * 100) : 0;

    const headline = this.buildHeadline(context, score.level);

    return {
      period: { month: context.month, year: context.year },
      score,
      headline,
      context,
      ratios: {
        savingsRate,
        debtPaymentRatio: debtRatio,
        expenseToIncomeRatio: context.monthlyIncome > 0 ? Math.round((context.monthlyExpenses / context.monthlyIncome) * 100) : 0,
        creditUtilization: context.creditLimit > 0 ? Math.round((context.creditUsed / context.creditLimit) * 100) : 0,
      },
      rules,
      topRisks: rules.filter((rule) => rule.severity === 'CRITICAL' || rule.severity === 'WARNING').slice(0, 4),
      opportunities: rules.filter((rule) => rule.severity === 'POSITIVE' || rule.severity === 'INFO').slice(0, 4),
      actionPlan,
    };
  }

  async getActionPlan(month: number, year: number) {
    const context = await this.buildContext(month, year);
    const rules = this.engine.evaluate(context);
    return {
      period: { month, year },
      items: this.engine.buildActionPlan(rules),
      generatedFromRules: rules.length,
      message: rules.length ? 'Plan generado desde reglas financieras activadas.' : 'Sin riesgos relevantes detectados. Mantén el registro actualizado.',
    };
  }

  getRulesCatalog() {
    return financialRuleCatalog;
  }

  private async buildContext(month: number, year: number): Promise<FinancialAssistantContext> {
    const range = monthRange(month, year);

    const [incomes, expenses, previousExpenses, debts, budgets, goals, cards, installments, recurrents] = await Promise.all([
      this.prisma.income.findMany({ where: { receivedAt: { gte: range.start, lt: range.end } } }),
      this.prisma.expense.findMany({ where: { spentAt: { gte: range.start, lt: range.end } } }),
      this.prisma.expense.findMany({ where: { spentAt: { gte: range.previousStart, lt: range.previousEnd } } }),
      this.prisma.debt.findMany(),
      this.prisma.budget.findMany({ where: { month, year } }),
      this.prisma.savingsGoal.findMany(),
      this.prisma.creditCard.findMany(),
      this.prisma.installment.findMany({ where: { status: InstallmentStatus.PENDING, dueAt: { gte: range.start, lt: range.end } } }),
      this.prisma.recurringMovement.findMany({ where: { status: RecurringStatus.ACTIVE } }),
    ]);

    const monthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const monthlyExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const commonExpenses = expenses.filter((item) => item.type === ExpenseType.COMMON).reduce((sum, item) => sum + item.amount, 0);
    const debtPayments = expenses.filter((item) => item.type === ExpenseType.DEBT_PAYMENT).reduce((sum, item) => sum + item.amount, 0);
    const previousMonthExpenses = previousExpenses.reduce((sum, item) => sum + item.amount, 0);
    const exceededBudgets = budgets.filter((budget) => expenses.filter((expense) => expense.category.toLowerCase() === budget.category.toLowerCase()).reduce((sum, expense) => sum + expense.amount, 0) > budget.amount).length;
    const nearLimitBudgets = budgets.filter((budget) => {
      const spent = expenses.filter((expense) => expense.category.toLowerCase() === budget.category.toLowerCase()).reduce((sum, expense) => sum + expense.amount, 0);
      const used = progress(spent, budget.amount);
      return used >= 80 && used <= 100;
    }).length;

    return {
      month,
      year,
      monthlyIncome,
      monthlyExpenses,
      commonExpenses,
      debtPayments,
      debtPending: debts.reduce((sum, item) => sum + item.pendingAmount, 0),
      debtPaid: debts.reduce((sum, item) => sum + item.paidAmount, 0),
      activeDebts: debts.filter((item) => item.pendingAmount > 0).length,
      exceededBudgets,
      nearLimitBudgets,
      activeGoals: goals.filter((goal) => goal.status === GoalStatus.ACTIVE).length,
      completedGoals: goals.filter((goal) => goal.status === GoalStatus.COMPLETED).length,
      goalsAtRisk: goals.filter((goal) => goal.status === GoalStatus.ACTIVE && goal.targetDate && goal.targetDate < range.end && goal.currentAmount < goal.targetAmount).length,
      creditUsed: cards.reduce((sum, card) => sum + card.usedAmount, 0),
      creditLimit: cards.reduce((sum, card) => sum + card.limitAmount, 0),
      upcomingInstallments: installments.reduce((sum, item) => sum + item.amount, 0),
      recurringOutflow: recurrents.filter((item) => item.kind !== RecurringMovementKind.INCOME).reduce((sum, item) => sum + item.amount, 0),
      previousMonthExpenses,
    };
  }

  private buildHeadline(context: FinancialAssistantContext, level: string) {
    const balance = context.monthlyIncome - context.monthlyExpenses;
    if (balance < 0) return `Tu mes está en riesgo: el balance va negativo y requiere ajustes inmediatos.`;
    if (level === 'Excelente' || level === 'Bueno') return `Tu salud financiera está ${level.toLowerCase()} y el balance mensual se mantiene positivo.`;
    if (context.debtPending > 0) return `Tu principal foco debe ser ordenar deudas y cuidar el flujo del mes.`;
    return `Hay oportunidades de mejora para aumentar tu control y estabilidad financiera.`;
  }
}
