import { BadRequestException, Injectable } from '@nestjs/common';
import { DebtStatus, ExpenseType, GoalStatus, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type ProjectionParams = {
  month?: string;
  year?: string;
  monthsAhead?: string;
  expenseReductionPercentage?: string;
  extraDebtPayment?: string;
  monthlySaving?: string;
};

type MonthlyProjection = {
  month: number;
  year: number;
  label: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  cumulativeBalance: number;
};

type SimulatedDebt = {
  id: string;
  name: string;
  initialPendingAmount: number;
  projectedPendingAmount: number;
  projectedPaidAmount: number;
  estimatedPaidInMonth: string | null;
};

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-CL', { month: 'short', year: 'numeric', timeZone: 'UTC' });

function toPositiveInteger(value: string | undefined, fallback: number, min: number, max: number, fieldName: string) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new BadRequestException(`${fieldName} debe ser un número entero entre ${min} y ${max}.`);
  }

  return parsed;
}

function toNonNegativeNumber(value: string | undefined, fallback: number, fieldName: string) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new BadRequestException(`${fieldName} debe ser un número mayor o igual a cero.`);
  }

  return Math.round(parsed);
}

function getMonthRange(year: number, month: number) {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  return { startDate, endDate };
}

function addMonths(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1, 0, 0, 0, 0));
  return {
    date,
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    label: MONTH_FORMATTER.format(date),
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(value, 100));
}

@Injectable()
export class FinancialProjectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyProjection(params: ProjectionParams) {
    const now = new Date();
    const month = toPositiveInteger(params.month, now.getUTCMonth() + 1, 1, 12, 'El mes');
    const year = toPositiveInteger(params.year, now.getUTCFullYear(), 2000, 2100, 'El año');
    const monthsAhead = toPositiveInteger(params.monthsAhead, 6, 1, 24, 'Los meses a proyectar');
    const expenseReductionPercentage = clampPercentage(toNonNegativeNumber(params.expenseReductionPercentage, 10, 'La reducción de gastos'));
    const extraDebtPayment = toNonNegativeNumber(params.extraDebtPayment, 0, 'El pago extra a deudas');
    const monthlySaving = toNonNegativeNumber(params.monthlySaving, 0, 'El ahorro mensual');

    const historicalMonths = Array.from({ length: 6 }, (_, index) => addMonths(year, month, index - 6));
    const historicalStart = getMonthRange(historicalMonths[0].year, historicalMonths[0].month).startDate;
    const projectionStart = getMonthRange(year, month).startDate;
    const projectionEnd = getMonthRange(addMonths(year, month, monthsAhead).year, addMonths(year, month, monthsAhead).month).startDate;

    const [historicalIncomes, historicalExpenses, recurringMovements, activeDebts, activeGoals, budgets] = await Promise.all([
      this.prisma.income.findMany({
        where: { receivedAt: { gte: historicalStart, lt: projectionStart } },
        select: { amount: true, receivedAt: true },
      }),
      this.prisma.expense.findMany({
        where: { spentAt: { gte: historicalStart, lt: projectionStart } },
        select: { amount: true, spentAt: true, type: true, category: true },
      }),
      this.prisma.recurringMovement.findMany({
        where: { status: RecurringStatus.ACTIVE },
      }),
      this.prisma.debt.findMany({
        where: { status: { in: [DebtStatus.ACTIVE, DebtStatus.OVERDUE] }, pendingAmount: { gt: 0 } },
        orderBy: [{ pendingAmount: 'asc' }, { createdAt: 'asc' }],
      }),
      this.prisma.savingsGoal.findMany({
        where: { status: { not: GoalStatus.COMPLETED } },
      }),
      this.prisma.budget.findMany({
        where: { year: { gte: year - 1 } },
      }),
    ]);

    const historicalIncomeByMonth = historicalMonths.map(({ month: itemMonth, year: itemYear }) => {
      return historicalIncomes
        .filter((income) => income.receivedAt.getUTCMonth() + 1 === itemMonth && income.receivedAt.getUTCFullYear() === itemYear)
        .reduce((sum, income) => sum + income.amount, 0);
    });

    const historicalExpenseByMonth = historicalMonths.map(({ month: itemMonth, year: itemYear }) => {
      return historicalExpenses
        .filter((expense) => expense.spentAt.getUTCMonth() + 1 === itemMonth && expense.spentAt.getUTCFullYear() === itemYear)
        .reduce((sum, expense) => sum + expense.amount, 0);
    });

    const historicalCommonExpenseByMonth = historicalMonths.map(({ month: itemMonth, year: itemYear }) => {
      return historicalExpenses
        .filter((expense) => expense.type === ExpenseType.COMMON && expense.spentAt.getUTCMonth() + 1 === itemMonth && expense.spentAt.getUTCFullYear() === itemYear)
        .reduce((sum, expense) => sum + expense.amount, 0);
    });

    const historicalDebtPaymentByMonth = historicalMonths.map(({ month: itemMonth, year: itemYear }) => {
      return historicalExpenses
        .filter((expense) => expense.type === ExpenseType.DEBT_PAYMENT && expense.spentAt.getUTCMonth() + 1 === itemMonth && expense.spentAt.getUTCFullYear() === itemYear)
        .reduce((sum, expense) => sum + expense.amount, 0);
    });

    const activeMonthlyRecurringIncome = recurringMovements
      .filter((movement) => movement.kind === RecurringMovementKind.INCOME)
      .reduce((sum, movement) => sum + this.normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);

    const activeMonthlyRecurringExpenses = recurringMovements
      .filter((movement) => movement.kind !== RecurringMovementKind.INCOME)
      .reduce((sum, movement) => sum + this.normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);

    const activeMonthlyRecurringDebtPayments = recurringMovements
      .filter((movement) => movement.kind === RecurringMovementKind.DEBT_PAYMENT)
      .reduce((sum, movement) => sum + this.normalizeRecurringAmountToMonthly(movement.amount, movement.frequency), 0);

    const averageMonthlyIncome = average(historicalIncomeByMonth.filter((value) => value > 0));
    const averageMonthlyExpenses = average(historicalExpenseByMonth.filter((value) => value > 0));
    const averageMonthlyCommonExpenses = average(historicalCommonExpenseByMonth.filter((value) => value > 0));
    const averageMonthlyDebtPayments = average(historicalDebtPaymentByMonth.filter((value) => value > 0));

    const baseMonthlyIncome = Math.max(averageMonthlyIncome, activeMonthlyRecurringIncome);
    const baseMonthlyExpenses = Math.max(averageMonthlyExpenses, activeMonthlyRecurringExpenses);
    const baseMonthlyCommonExpenses = Math.max(averageMonthlyCommonExpenses, Math.max(activeMonthlyRecurringExpenses - activeMonthlyRecurringDebtPayments, 0));
    const baseMonthlyDebtPayments = Math.max(averageMonthlyDebtPayments, activeMonthlyRecurringDebtPayments);

    const baselineProjection = this.buildMonthlyProjection(year, month, monthsAhead, baseMonthlyIncome, baseMonthlyExpenses);
    const reducedExpensesAmount = Math.round(baseMonthlyCommonExpenses * (expenseReductionPercentage / 100));
    const reducedExpensesProjection = this.buildMonthlyProjection(year, month, monthsAhead, baseMonthlyIncome, Math.max(baseMonthlyExpenses - reducedExpensesAmount, 0));
    const savingsProjection = this.buildSavingsProjection(year, month, monthsAhead, baseMonthlyIncome, baseMonthlyExpenses, monthlySaving);
    const debtSimulation = this.simulateDebtPayoff(year, month, monthsAhead, activeDebts, baseMonthlyDebtPayments + extraDebtPayment);

    const recommendations = this.buildRecommendations({
      baseMonthlyIncome,
      baseMonthlyExpenses,
      baselineProjection,
      reducedExpensesProjection,
      savingsProjection,
      debtSimulation,
      expenseReductionPercentage,
      reducedExpensesAmount,
      extraDebtPayment,
      monthlySaving,
      activeDebtsCount: activeDebts.length,
      activeGoalsCount: activeGoals.length,
      budgetsCount: budgets.length,
    });

    return {
      period: {
        month,
        year,
        monthsAhead,
        startDate: projectionStart.toISOString(),
        endDate: projectionEnd.toISOString(),
      },
      assumptions: {
        averageMonthlyIncome,
        averageMonthlyExpenses,
        averageMonthlyCommonExpenses,
        averageMonthlyDebtPayments,
        activeMonthlyRecurringIncome,
        activeMonthlyRecurringExpenses,
        activeMonthlyRecurringDebtPayments,
        baseMonthlyIncome,
        baseMonthlyExpenses,
        baseMonthlyCommonExpenses,
        baseMonthlyDebtPayments,
      },
      scenarioInputs: {
        expenseReductionPercentage,
        reducedExpensesAmount,
        extraDebtPayment,
        monthlySaving,
      },
      scenarios: {
        baseline: {
          name: 'Escenario base',
          description: 'Proyección usando promedios históricos y recurrentes activos.',
          finalBalance: baselineProjection.at(-1)?.cumulativeBalance ?? 0,
          monthly: baselineProjection,
        },
        reducedExpenses: {
          name: 'Reducir gastos',
          description: `Simula reducir ${expenseReductionPercentage}% de gastos comunes mensuales.`,
          monthlySavingsImpact: reducedExpensesAmount,
          finalBalance: reducedExpensesProjection.at(-1)?.cumulativeBalance ?? 0,
          monthly: reducedExpensesProjection,
        },
        savingsPlan: {
          name: 'Plan de ahorro',
          description: 'Simula separar un monto fijo mensual para ahorro.',
          projectedSavedAmount: monthlySaving * monthsAhead,
          finalBalanceAfterSaving: savingsProjection.at(-1)?.cumulativeBalanceAfterSaving ?? 0,
          monthly: savingsProjection,
        },
        acceleratedDebtPayment: {
          name: 'Pago acelerado de deudas',
          description: 'Simula abonar un monto extra mensual a las deudas activas.',
          totalDebtBefore: debtSimulation.totalDebtBefore,
          totalDebtAfter: debtSimulation.totalDebtAfter,
          totalDebtPaidInProjection: debtSimulation.totalDebtPaidInProjection,
          monthlyPaymentCapacity: debtSimulation.monthlyPaymentCapacity,
          debts: debtSimulation.debts,
          monthly: debtSimulation.monthly,
        },
      },
      recommendations,
    };
  }

  private normalizeRecurringAmountToMonthly(amount: number, frequency: string) {
    if (frequency === 'WEEKLY') return Math.round(amount * 4.33);
    if (frequency === 'BIWEEKLY') return Math.round(amount * 2.16);
    if (frequency === 'YEARLY') return Math.round(amount / 12);
    return amount;
  }

  private buildMonthlyProjection(year: number, month: number, monthsAhead: number, income: number, expenses: number): MonthlyProjection[] {
    let cumulativeBalance = 0;

    return Array.from({ length: monthsAhead }, (_, index) => {
      const period = addMonths(year, month, index);
      const projectedBalance = income - expenses;
      cumulativeBalance += projectedBalance;

      return {
        month: period.month,
        year: period.year,
        label: period.label,
        projectedIncome: income,
        projectedExpenses: expenses,
        projectedBalance,
        cumulativeBalance,
      };
    });
  }

  private buildSavingsProjection(year: number, month: number, monthsAhead: number, income: number, expenses: number, monthlySaving: number) {
    let cumulativeBalance = 0;
    let cumulativeSavings = 0;

    return Array.from({ length: monthsAhead }, (_, index) => {
      const period = addMonths(year, month, index);
      const projectedBalance = income - expenses;
      cumulativeBalance += projectedBalance - monthlySaving;
      cumulativeSavings += monthlySaving;

      return {
        month: period.month,
        year: period.year,
        label: period.label,
        projectedIncome: income,
        projectedExpenses: expenses,
        monthlySaving,
        projectedBalanceBeforeSaving: projectedBalance,
        cumulativeSavedAmount: cumulativeSavings,
        cumulativeBalanceAfterSaving: cumulativeBalance,
      };
    });
  }

  private simulateDebtPayoff(year: number, month: number, monthsAhead: number, debts: Array<{ id: string; name: string; pendingAmount: number }>, monthlyPaymentCapacity: number) {
    const simulatedDebts: SimulatedDebt[] = debts.map((debt) => ({
      id: debt.id,
      name: debt.name,
      initialPendingAmount: debt.pendingAmount,
      projectedPendingAmount: debt.pendingAmount,
      projectedPaidAmount: 0,
      estimatedPaidInMonth: null,
    }));

    const totalDebtBefore = simulatedDebts.reduce((sum, debt) => sum + debt.initialPendingAmount, 0);
    const monthly = Array.from({ length: monthsAhead }, (_, index) => {
      const period = addMonths(year, month, index);
      let availablePayment = monthlyPaymentCapacity;
      let paidThisMonth = 0;

      for (const debt of simulatedDebts) {
        if (availablePayment <= 0) break;
        if (debt.projectedPendingAmount <= 0) continue;

        const payment = Math.min(debt.projectedPendingAmount, availablePayment);
        debt.projectedPendingAmount -= payment;
        debt.projectedPaidAmount += payment;
        availablePayment -= payment;
        paidThisMonth += payment;

        if (debt.projectedPendingAmount === 0 && !debt.estimatedPaidInMonth) {
          debt.estimatedPaidInMonth = period.label;
        }
      }

      return {
        month: period.month,
        year: period.year,
        label: period.label,
        paidThisMonth,
        remainingDebt: simulatedDebts.reduce((sum, debt) => sum + debt.projectedPendingAmount, 0),
      };
    });

    const totalDebtAfter = simulatedDebts.reduce((sum, debt) => sum + debt.projectedPendingAmount, 0);

    return {
      totalDebtBefore,
      totalDebtAfter,
      totalDebtPaidInProjection: totalDebtBefore - totalDebtAfter,
      monthlyPaymentCapacity,
      debts: simulatedDebts,
      monthly,
    };
  }

  private buildRecommendations(input: {
    baseMonthlyIncome: number;
    baseMonthlyExpenses: number;
    baselineProjection: MonthlyProjection[];
    reducedExpensesProjection: MonthlyProjection[];
    savingsProjection: Array<{ cumulativeSavedAmount: number; cumulativeBalanceAfterSaving: number }>;
    debtSimulation: ReturnType<FinancialProjectionsService['simulateDebtPayoff']>;
    expenseReductionPercentage: number;
    reducedExpensesAmount: number;
    extraDebtPayment: number;
    monthlySaving: number;
    activeDebtsCount: number;
    activeGoalsCount: number;
    budgetsCount: number;
  }) {
    const recommendations: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; description: string }> = [];
    const monthlyBalance = input.baseMonthlyIncome - input.baseMonthlyExpenses;
    const baselineFinal = input.baselineProjection.at(-1)?.cumulativeBalance ?? 0;
    const reducedFinal = input.reducedExpensesProjection.at(-1)?.cumulativeBalance ?? 0;
    const savingsFinal = input.savingsProjection.at(-1)?.cumulativeBalanceAfterSaving ?? 0;

    if (monthlyBalance < 0) {
      recommendations.push({
        type: 'danger',
        title: 'Tu escenario base proyecta déficit mensual',
        description: 'Antes de aumentar ahorro o pagos extra, conviene reducir gastos comunes o revisar recurrentes para evitar cerrar meses en negativo.',
      });
    } else {
      recommendations.push({
        type: 'success',
        title: 'Tu escenario base proyecta balance positivo',
        description: 'Puedes usar el excedente mensual para acelerar deudas, fortalecer ahorro o crear un fondo de emergencia.',
      });
    }

    if (input.reducedExpensesAmount > 0 && reducedFinal > baselineFinal) {
      recommendations.push({
        type: 'info',
        title: `Reducir ${input.expenseReductionPercentage}% de gastos comunes mejora tu proyección`,
        description: `Esta simulación libera aproximadamente ${input.reducedExpensesAmount.toLocaleString('es-CL')} al mes frente al escenario base.`,
      });
    }

    if (input.activeDebtsCount > 0) {
      recommendations.push({
        type: input.extraDebtPayment > 0 ? 'success' : 'warning',
        title: input.extraDebtPayment > 0 ? 'El pago extra acelera la reducción de deuda' : 'Tienes deudas activas sin pago extra simulado',
        description: `La simulación terminaría con ${input.debtSimulation.totalDebtAfter.toLocaleString('es-CL')} pendientes después del periodo proyectado.`,
      });
    }

    if (input.monthlySaving > 0) {
      recommendations.push({
        type: savingsFinal >= 0 ? 'success' : 'warning',
        title: 'Plan de ahorro simulado',
        description: `Separar ${input.monthlySaving.toLocaleString('es-CL')} al mes acumularía ${input.savingsProjection.at(-1)?.cumulativeSavedAmount.toLocaleString('es-CL') ?? '0'} en el periodo.`,
      });
    }

    if (input.budgetsCount === 0) {
      recommendations.push({
        type: 'info',
        title: 'Agrega presupuestos para mejorar la precisión',
        description: 'Las proyecciones serán más útiles si defines límites mensuales para tus categorías principales.',
      });
    }

    if (input.activeGoalsCount === 0) {
      recommendations.push({
        type: 'info',
        title: 'Agrega metas de ahorro',
        description: 'Las metas permiten convertir el excedente mensual en objetivos concretos y medibles.',
      });
    }

    return recommendations;
  }
}
