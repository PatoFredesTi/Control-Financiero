import { BadRequestException, Injectable } from '@nestjs/common';
import { DebtStatus, ExpenseType, GoalStatus, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type NotificationSeverity = 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL';
type NotificationCategory = 'BALANCE' | 'BUDGET' | 'DEBT' | 'RECURRING' | 'GOAL' | 'IMPORT' | 'SYSTEM';

type NotificationAction = {
  label: string;
  href: string;
};

type FinancialNotification = {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  sourceType: string;
  sourceId?: string;
  amount?: number;
  dueDate?: string;
  createdAt: string;
  action?: NotificationAction;
};

type NotificationQuery = {
  month?: string;
  year?: string;
  daysAhead?: string;
  severity?: string;
  category?: string;
};

const SEVERITY_WEIGHT: Record<NotificationSeverity, number> = {
  CRITICAL: 4,
  WARNING: 3,
  INFO: 2,
  SUCCESS: 1,
};

const CATEGORY_VALUES: NotificationCategory[] = ['BALANCE', 'BUDGET', 'DEBT', 'RECURRING', 'GOAL', 'IMPORT', 'SYSTEM'];
const SEVERITY_VALUES: NotificationSeverity[] = ['SUCCESS', 'INFO', 'WARNING', 'CRITICAL'];

function parseInteger(value: string | undefined, fallback: number, min: number, max: number, fieldName: string) {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new BadRequestException(`${fieldName} debe ser un número entero entre ${min} y ${max}.`);
  }
  return parsed;
}

function parseOptionalSeverity(value?: string): NotificationSeverity | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase() as NotificationSeverity;
  if (!SEVERITY_VALUES.includes(normalized)) {
    throw new BadRequestException('Severidad de notificación inválida.');
  }
  return normalized;
}

function parseOptionalCategory(value?: string): NotificationCategory | undefined {
  if (!value) return undefined;
  const normalized = value.toUpperCase() as NotificationCategory;
  if (!CATEGORY_VALUES.includes(normalized)) {
    throw new BadRequestException('Categoría de notificación inválida.');
  }
  return normalized;
}

function monthRange(month: number, year: number) {
  return {
    startDate: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    endDate: new Date(Date.UTC(year, month, 1, 0, 0, 0, 0)),
  };
}

function toISODate(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : undefined;
}

function daysBetween(from: Date, to: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const fromDate = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const toDate = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.ceil((toDate - fromDate) / dayMs);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: Pick<NotificationQuery, 'month' | 'year' | 'daysAhead'>) {
    const center = await this.getNotificationCenter(query);
    return center.summary;
  }

  async getNotificationCenter(query: NotificationQuery = {}) {
    const now = new Date();
    const month = parseInteger(query.month, now.getUTCMonth() + 1, 1, 12, 'El mes');
    const year = parseInteger(query.year, now.getUTCFullYear(), 2000, 2100, 'El año');
    const daysAhead = parseInteger(query.daysAhead, 7, 1, 90, 'Los días de anticipación');
    const severityFilter = parseOptionalSeverity(query.severity);
    const categoryFilter = parseOptionalCategory(query.category);
    const { startDate, endDate } = monthRange(month, year);
    const reminderEndDate = new Date(now);
    reminderEndDate.setUTCDate(reminderEndDate.getUTCDate() + daysAhead);

    const notifications = [
      ...(await this.buildBalanceAlerts(month, year, startDate, endDate, now)),
      ...(await this.buildBudgetAlerts(month, year, startDate, endDate, now)),
      ...(await this.buildDebtAlerts(now, reminderEndDate)),
      ...(await this.buildRecurringAlerts(now, reminderEndDate)),
      ...(await this.buildGoalAlerts(now, reminderEndDate)),
      ...(await this.buildImportAlerts(now)),
    ]
      .filter((notification) => (severityFilter ? notification.severity === severityFilter : true))
      .filter((notification) => (categoryFilter ? notification.category === categoryFilter : true))
      .sort((a, b) => {
        const severityDiff = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
        if (severityDiff !== 0) return severityDiff;
        return (a.dueDate ?? a.createdAt).localeCompare(b.dueDate ?? b.createdAt);
      });

    const summary = this.buildSummary(notifications);

    return {
      period: {
        month,
        year,
        daysAhead,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reminderStartDate: now.toISOString(),
        reminderEndDate: reminderEndDate.toISOString(),
      },
      summary,
      notifications,
      generatedAt: now.toISOString(),
    };
  }

  private async buildBalanceAlerts(month: number, year: number, startDate: Date, endDate: Date, now: Date): Promise<FinancialNotification[]> {
    const [incomeAggregate, expenseAggregate, commonExpenseAggregate, debtPaymentAggregate] = await Promise.all([
      this.prisma.income.aggregate({ where: { receivedAt: { gte: startDate, lt: endDate } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { spentAt: { gte: startDate, lt: endDate } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { type: ExpenseType.COMMON, spentAt: { gte: startDate, lt: endDate } }, _sum: { amount: true } }),
      this.prisma.expense.aggregate({ where: { type: ExpenseType.DEBT_PAYMENT, spentAt: { gte: startDate, lt: endDate } }, _sum: { amount: true } }),
    ]);

    const monthlyIncome = incomeAggregate._sum.amount ?? 0;
    const monthlyExpenses = expenseAggregate._sum.amount ?? 0;
    const commonExpenses = commonExpenseAggregate._sum.amount ?? 0;
    const debtPayments = debtPaymentAggregate._sum.amount ?? 0;
    const balance = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? Math.round((balance / monthlyIncome) * 100) : 0;
    const alerts: FinancialNotification[] = [];

    if (monthlyIncome === 0 && monthlyExpenses === 0) {
      alerts.push(this.createNotification({
        id: `balance-no-data-${year}-${month}`,
        title: 'Sin movimientos este mes',
        message: 'Aún no hay ingresos ni gastos registrados para el período seleccionado. Registra movimientos o importa un CSV para activar el análisis.',
        severity: 'INFO',
        category: 'BALANCE',
        sourceType: 'MONTHLY_BALANCE',
        createdAt: now,
        action: { label: 'Importar movimientos', href: '/financial-imports' },
      }));
      return alerts;
    }

    if (balance < 0) {
      alerts.push(this.createNotification({
        id: `balance-negative-${year}-${month}`,
        title: 'Balance mensual negativo',
        message: `Los gastos del mes superan a los ingresos. Revisa gastos variables y pagos recurrentes antes de cerrar el período.`,
        severity: 'CRITICAL',
        category: 'BALANCE',
        sourceType: 'MONTHLY_BALANCE',
        amount: Math.abs(balance),
        createdAt: now,
        action: { label: 'Ver dashboard', href: '/dashboard' },
      }));
    } else if (monthlyIncome > 0 && savingsRate < 5) {
      alerts.push(this.createNotification({
        id: `balance-low-savings-${year}-${month}`,
        title: 'Tasa de ahorro muy baja',
        message: `El balance positivo existe, pero representa solo ${savingsRate}% de tus ingresos. Intenta liberar margen antes de asumir nuevos compromisos.`,
        severity: 'WARNING',
        category: 'BALANCE',
        sourceType: 'MONTHLY_BALANCE',
        amount: balance,
        createdAt: now,
        action: { label: 'Ver proyecciones', href: '/financial-projections' },
      }));
    } else if (monthlyIncome > 0 && savingsRate >= 20) {
      alerts.push(this.createNotification({
        id: `balance-healthy-${year}-${month}`,
        title: 'Buen margen financiero',
        message: `Tu balance mensual va positivo y equivale aproximadamente al ${savingsRate}% de tus ingresos. Es un buen momento para reforzar ahorro o acelerar deudas.`,
        severity: 'SUCCESS',
        category: 'BALANCE',
        sourceType: 'MONTHLY_BALANCE',
        amount: balance,
        createdAt: now,
        action: { label: 'Ver metas', href: '/savings-goals' },
      }));
    }

    if (monthlyIncome > 0 && debtPayments > monthlyIncome * 0.35) {
      alerts.push(this.createNotification({
        id: `balance-high-debt-payments-${year}-${month}`,
        title: 'Carga de pagos de deuda elevada',
        message: 'Los pagos de deuda del mes superan el 35% de tus ingresos. Revisa si puedes refinanciar, priorizar o evitar nuevos compromisos.',
        severity: 'WARNING',
        category: 'DEBT',
        sourceType: 'DEBT_PAYMENT_RATIO',
        amount: debtPayments,
        createdAt: now,
        action: { label: 'Ver deudas', href: '/debts' },
      }));
    }

    if (monthlyIncome > 0 && commonExpenses > monthlyIncome * 0.75) {
      alerts.push(this.createNotification({
        id: `balance-high-common-expenses-${year}-${month}`,
        title: 'Gastos comunes muy altos',
        message: 'Los gastos comunes están consumiendo más del 75% de tus ingresos del mes. Revisa categorías variables y presupuestos.',
        severity: 'WARNING',
        category: 'BUDGET',
        sourceType: 'COMMON_EXPENSE_RATIO',
        amount: commonExpenses,
        createdAt: now,
        action: { label: 'Ver presupuestos', href: '/budgets' },
      }));
    }

    return alerts;
  }

  private async buildBudgetAlerts(month: number, year: number, startDate: Date, endDate: Date, now: Date): Promise<FinancialNotification[]> {
    const budgets = await this.prisma.budget.findMany({ where: { month, year }, orderBy: { category: 'asc' } });

    if (!budgets.length) {
      return [this.createNotification({
        id: `budget-empty-${year}-${month}`,
        title: 'Sin presupuestos para este mes',
        message: 'Define límites por categoría para recibir alertas preventivas antes de excederte.',
        severity: 'INFO',
        category: 'BUDGET',
        sourceType: 'BUDGET_SETUP',
        createdAt: now,
        action: { label: 'Crear presupuesto', href: '/budgets' },
      })];
    }

    const alerts: FinancialNotification[] = [];

    for (const budget of budgets) {
      const spentAggregate = await this.prisma.expense.aggregate({
        where: {
          type: ExpenseType.COMMON,
          category: { equals: budget.category, mode: 'insensitive' },
          spentAt: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      });
      const spent = spentAggregate._sum.amount ?? 0;
      const usage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      if (usage >= 100) {
        alerts.push(this.createNotification({
          id: `budget-exceeded-${budget.id}`,
          title: `Presupuesto excedido: ${budget.category}`,
          message: `Ya usaste el ${usage}% del presupuesto de ${budget.category}. El exceso puede afectar el balance mensual.`,
          severity: 'CRITICAL',
          category: 'BUDGET',
          sourceType: 'BUDGET',
          sourceId: budget.id,
          amount: spent - budget.amount,
          createdAt: now,
          action: { label: 'Ver presupuestos', href: '/budgets' },
        }));
      } else if (usage >= 80) {
        alerts.push(this.createNotification({
          id: `budget-near-limit-${budget.id}`,
          title: `Presupuesto cerca del límite: ${budget.category}`,
          message: `Llevas usado el ${usage}% del presupuesto de ${budget.category}. Queda poco margen para el resto del mes.`,
          severity: 'WARNING',
          category: 'BUDGET',
          sourceType: 'BUDGET',
          sourceId: budget.id,
          amount: budget.amount - spent,
          createdAt: now,
          action: { label: 'Ver gastos', href: '/expenses' },
        }));
      }
    }

    return alerts;
  }

  private async buildDebtAlerts(now: Date, reminderEndDate: Date): Promise<FinancialNotification[]> {
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const activeDebts = await this.prisma.debt.findMany({
      where: { status: { in: [DebtStatus.ACTIVE, DebtStatus.OVERDUE] }, pendingAmount: { gt: 0 } },
      orderBy: [{ estimatedEndDate: 'asc' }, { pendingAmount: 'desc' }],
    });

    const alerts: FinancialNotification[] = [];

    for (const debt of activeDebts) {
      if (debt.estimatedEndDate && debt.estimatedEndDate < now) {
        alerts.push(this.createNotification({
          id: `debt-overdue-${debt.id}`,
          title: `Deuda vencida o atrasada: ${debt.name}`,
          message: `La fecha estimada de término ya pasó y aún queda saldo pendiente. Prioriza revisar esta deuda.`,
          severity: 'CRITICAL',
          category: 'DEBT',
          sourceType: 'DEBT',
          sourceId: debt.id,
          amount: debt.pendingAmount,
          dueDate: debt.estimatedEndDate,
          createdAt: now,
          action: { label: 'Ver deudas', href: '/debts' },
        }));
      } else if (debt.estimatedEndDate && debt.estimatedEndDate <= reminderEndDate) {
        const remainingDays = Math.max(daysBetween(now, debt.estimatedEndDate), 0);
        alerts.push(this.createNotification({
          id: `debt-due-soon-${debt.id}`,
          title: `Deuda próxima a vencer: ${debt.name}`,
          message: `Quedan ${remainingDays} día(s) para la fecha estimada de término y aún hay saldo pendiente.`,
          severity: 'WARNING',
          category: 'DEBT',
          sourceType: 'DEBT',
          sourceId: debt.id,
          amount: debt.pendingAmount,
          dueDate: debt.estimatedEndDate,
          createdAt: now,
          action: { label: 'Registrar pago', href: '/expenses' },
        }));
      }

      const paymentsThisMonth = await this.prisma.expense.aggregate({
        where: {
          type: ExpenseType.DEBT_PAYMENT,
          debtId: debt.id,
          spentAt: { gte: currentMonthStart, lt: nextMonthStart },
        },
        _sum: { amount: true },
      });

      if ((paymentsThisMonth._sum.amount ?? 0) === 0 && debt.pendingAmount > 0) {
        alerts.push(this.createNotification({
          id: `debt-no-payment-${debt.id}`,
          title: `Sin pago registrado este mes: ${debt.name}`,
          message: 'Esta deuda activa no tiene pagos registrados durante el mes actual. Verifica si corresponde programar un pago.',
          severity: 'INFO',
          category: 'DEBT',
          sourceType: 'DEBT_PAYMENT_REMINDER',
          sourceId: debt.id,
          amount: debt.pendingAmount,
          createdAt: now,
          action: { label: 'Ver deudas', href: '/debts' },
        }));
      }
    }

    return alerts;
  }

  private async buildRecurringAlerts(now: Date, reminderEndDate: Date): Promise<FinancialNotification[]> {
    const recurringMovements = await this.prisma.recurringMovement.findMany({
      where: {
        status: RecurringStatus.ACTIVE,
        nextRunAt: { lte: reminderEndDate },
      },
      orderBy: { nextRunAt: 'asc' },
    });

    return recurringMovements.map((movement) => {
      const isOverdue = movement.nextRunAt < now;
      const remainingDays = Math.max(daysBetween(now, movement.nextRunAt), 0);
      return this.createNotification({
        id: `recurring-${isOverdue ? 'overdue' : 'due-soon'}-${movement.id}`,
        title: isOverdue ? `Recurrente pendiente: ${movement.description}` : `Recurrente próximo: ${movement.description}`,
        message: isOverdue
          ? 'Este movimiento recurrente ya está vencido. Puedes generarlo para registrar el ingreso/gasto correspondiente.'
          : `Este movimiento recurrente vence en ${remainingDays} día(s).`,
        severity: isOverdue ? 'WARNING' : 'INFO',
        category: 'RECURRING',
        sourceType: 'RECURRING_MOVEMENT',
        sourceId: movement.id,
        amount: movement.amount,
        dueDate: movement.nextRunAt,
        createdAt: now,
        action: { label: 'Ver recurrentes', href: '/recurring-movements' },
      });
    });
  }

  private async buildGoalAlerts(now: Date, reminderEndDate: Date): Promise<FinancialNotification[]> {
    const activeGoals = await this.prisma.savingsGoal.findMany({
      where: { status: { in: [GoalStatus.ACTIVE, GoalStatus.PAUSED] } },
      orderBy: [{ targetDate: 'asc' }, { targetAmount: 'desc' }],
    });

    const alerts: FinancialNotification[] = [];

    for (const goal of activeGoals) {
      const pendingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
      const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

      if (pendingAmount === 0) continue;

      if (goal.targetDate && goal.targetDate < now) {
        alerts.push(this.createNotification({
          id: `goal-overdue-${goal.id}`,
          title: `Meta atrasada: ${goal.name}`,
          message: `La fecha objetivo ya pasó y la meta lleva ${progress}% de avance. Ajusta la fecha o registra nuevos aportes.`,
          severity: 'WARNING',
          category: 'GOAL',
          sourceType: 'SAVINGS_GOAL',
          sourceId: goal.id,
          amount: pendingAmount,
          dueDate: goal.targetDate,
          createdAt: now,
          action: { label: 'Ver metas', href: '/savings-goals' },
        }));
      } else if (goal.targetDate && goal.targetDate <= reminderEndDate) {
        alerts.push(this.createNotification({
          id: `goal-due-soon-${goal.id}`,
          title: `Meta próxima: ${goal.name}`,
          message: `La fecha objetivo está cerca y aún faltan fondos para completar la meta.`,
          severity: progress >= 80 ? 'INFO' : 'WARNING',
          category: 'GOAL',
          sourceType: 'SAVINGS_GOAL',
          sourceId: goal.id,
          amount: pendingAmount,
          dueDate: goal.targetDate,
          createdAt: now,
          action: { label: 'Registrar aporte', href: '/savings-goals' },
        }));
      }
    }

    return alerts;
  }

  private async buildImportAlerts(now: Date): Promise<FinancialNotification[]> {
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30);

    const pendingBatches = await this.prisma.importBatch.findMany({
      where: {
        status: { in: ['PREVIEW', 'PARTIAL'] },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return pendingBatches.map((batch) => this.createNotification({
      id: `import-pending-${batch.id}`,
      title: 'Importación pendiente de revisar',
      message: `El lote ${batch.fileName ?? batch.source ?? 'sin nombre'} tiene movimientos pendientes de conciliación o confirmación.`,
      severity: 'INFO',
      category: 'IMPORT',
      sourceType: 'IMPORT_BATCH',
      sourceId: batch.id,
      amount: batch.totalRows,
      dueDate: batch.createdAt,
      createdAt: now,
      action: { label: 'Ver importaciones', href: '/financial-imports' },
    }));
  }

  private buildSummary(notifications: FinancialNotification[]) {
    const critical = notifications.filter((notification) => notification.severity === 'CRITICAL').length;
    const warning = notifications.filter((notification) => notification.severity === 'WARNING').length;
    const info = notifications.filter((notification) => notification.severity === 'INFO').length;
    const success = notifications.filter((notification) => notification.severity === 'SUCCESS').length;

    return {
      total: notifications.length,
      critical,
      warning,
      info,
      success,
      requiresAttention: critical + warning,
      categories: CATEGORY_VALUES.map((category) => ({
        category,
        count: notifications.filter((notification) => notification.category === category).length,
      })).filter((item) => item.count > 0),
      topPriority: notifications[0] ?? null,
      healthLabel: critical > 0 ? 'Requiere atención urgente' : warning > 0 ? 'Requiere revisión' : 'Sin alertas críticas',
      estimatedUnread: notifications.length,
    };
  }

  private createNotification(input: {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    category: NotificationCategory;
    sourceType: string;
    sourceId?: string;
    amount?: number;
    dueDate?: Date;
    createdAt: Date;
    action?: NotificationAction;
  }): FinancialNotification {
    return {
      id: input.id,
      title: input.title,
      message: input.message,
      severity: input.severity,
      category: input.category,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      amount: input.amount,
      dueDate: toISODate(input.dueDate),
      createdAt: input.createdAt.toISOString(),
      action: input.action,
    };
  }
}
