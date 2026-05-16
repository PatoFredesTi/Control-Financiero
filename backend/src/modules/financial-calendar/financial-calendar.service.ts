import { BadRequestException, Injectable } from '@nestjs/common';
import { ExpenseType, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type CalendarParams = {
  month?: string;
  year?: string;
};

type CalendarEventDirection = 'IN' | 'OUT' | 'NEUTRAL';

type CalendarEvent = {
  id: string;
  sourceId: string;
  sourceType:
    | 'INCOME'
    | 'EXPENSE'
    | 'DEBT_PAYMENT'
    | 'RECURRING_INCOME'
    | 'RECURRING_EXPENSE'
    | 'RECURRING_DEBT_PAYMENT'
    | 'DEBT_DUE'
    | 'GOAL_TARGET';
  title: string;
  amount: number;
  date: string;
  category?: string | null;
  status?: string | null;
  direction: CalendarEventDirection;
};

function parseMonthYear(params: CalendarParams) {
  const now = new Date();
  const month = params.month ? Number(params.month) : now.getUTCMonth() + 1;
  const year = params.year ? Number(params.year) : now.getUTCFullYear();

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BadRequestException('El mes debe estar entre 1 y 12.');
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new BadRequestException('El año debe estar entre 2000 y 2100.');
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return { month, year, startDate, endDate, daysInMonth };
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function sortEvents(events: CalendarEvent[]) {
  return events.sort((a, b) => {
    if (a.date === b.date) return a.title.localeCompare(b.title);
    return a.date.localeCompare(b.date);
  });
}

@Injectable()
export class FinancialCalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthlyCalendar(params: CalendarParams) {
    const { month, year, startDate, endDate, daysInMonth } = parseMonthYear(params);

    const [incomes, expenses, debtsDue, goalsDue, recurringMovements] = await Promise.all([
      this.prisma.income.findMany({
        where: { receivedAt: { gte: startDate, lte: endDate } },
        orderBy: { receivedAt: 'asc' },
      }),
      this.prisma.expense.findMany({
        where: { spentAt: { gte: startDate, lte: endDate } },
        include: { debt: true },
        orderBy: { spentAt: 'asc' },
      }),
      this.prisma.debt.findMany({
        where: { estimatedEndDate: { gte: startDate, lte: endDate } },
        orderBy: { estimatedEndDate: 'asc' },
      }),
      this.prisma.savingsGoal.findMany({
        where: { targetDate: { gte: startDate, lte: endDate } },
        orderBy: { targetDate: 'asc' },
      }),
      this.prisma.recurringMovement.findMany({
        where: {
          status: RecurringStatus.ACTIVE,
          nextRunAt: { gte: startDate, lte: endDate },
        },
        include: { debt: true },
        orderBy: { nextRunAt: 'asc' },
      }),
    ]);

    const events: CalendarEvent[] = [
      ...incomes.map((income) => ({
        id: `income-${income.id}`,
        sourceId: income.id,
        sourceType: 'INCOME' as const,
        title: income.description,
        amount: income.amount,
        date: toISODate(income.receivedAt),
        category: income.category,
        direction: 'IN' as const,
      })),
      ...expenses.map((expense) => ({
        id: `expense-${expense.id}`,
        sourceId: expense.id,
        sourceType: expense.type === ExpenseType.DEBT_PAYMENT ? ('DEBT_PAYMENT' as const) : ('EXPENSE' as const),
        title: expense.description,
        amount: expense.amount,
        date: toISODate(expense.spentAt),
        category: expense.category,
        status: expense.debt?.name ?? null,
        direction: 'OUT' as const,
      })),
      ...debtsDue.map((debt) => ({
        id: `debt-due-${debt.id}`,
        sourceId: debt.id,
        sourceType: 'DEBT_DUE' as const,
        title: `Vencimiento estimado: ${debt.name}`,
        amount: debt.pendingAmount,
        date: toISODate(debt.estimatedEndDate!),
        category: 'Deuda',
        status: debt.status,
        direction: 'NEUTRAL' as const,
      })),
      ...goalsDue.map((goal) => ({
        id: `goal-target-${goal.id}`,
        sourceId: goal.id,
        sourceType: 'GOAL_TARGET' as const,
        title: `Meta objetivo: ${goal.name}`,
        amount: Math.max(goal.targetAmount - goal.currentAmount, 0),
        date: toISODate(goal.targetDate!),
        category: 'Meta de ahorro',
        status: goal.status,
        direction: 'NEUTRAL' as const,
      })),
      ...recurringMovements.map((recurring) => ({
        id: `recurring-${recurring.id}`,
        sourceId: recurring.id,
        sourceType:
          recurring.kind === RecurringMovementKind.INCOME
            ? ('RECURRING_INCOME' as const)
            : recurring.kind === RecurringMovementKind.DEBT_PAYMENT
              ? ('RECURRING_DEBT_PAYMENT' as const)
              : ('RECURRING_EXPENSE' as const),
        title: `Recurrente: ${recurring.description}`,
        amount: recurring.amount,
        date: toISODate(recurring.nextRunAt),
        category: recurring.category,
        status: recurring.frequency,
        direction: recurring.kind === RecurringMovementKind.INCOME ? ('IN' as const) : ('OUT' as const),
      })),
    ];

    const sortedEvents = sortEvents(events);
    const eventsByDate = sortedEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      acc[event.date] = acc[event.date] ?? [];
      acc[event.date].push(event);
      return acc;
    }, {});

    const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = toISODate(new Date(Date.UTC(year, month - 1, day)));
      const dayEvents = eventsByDate[date] ?? [];
      const incomeAmount = dayEvents.filter((event) => event.direction === 'IN').reduce((sum, event) => sum + event.amount, 0);
      const outcomeAmount = dayEvents.filter((event) => event.direction === 'OUT').reduce((sum, event) => sum + event.amount, 0);

      return {
        date,
        day,
        events: dayEvents,
        incomeAmount,
        outcomeAmount,
        netAmount: incomeAmount - outcomeAmount,
      };
    });

    const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const expectedRecurringIncome = recurringMovements
      .filter((item) => item.kind === RecurringMovementKind.INCOME)
      .reduce((sum, item) => sum + item.amount, 0);
    const expectedRecurringExpenses = recurringMovements
      .filter((item) => item.kind !== RecurringMovementKind.INCOME)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      month,
      year,
      range: {
        startDate: toISODate(startDate),
        endDate: toISODate(endDate),
      },
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        expectedRecurringIncome,
        expectedRecurringExpenses,
        projectedBalance: totalIncome + expectedRecurringIncome - totalExpenses - expectedRecurringExpenses,
        eventsCount: sortedEvents.length,
        criticalDays: calendarDays.filter((day) => day.netAmount < 0).length,
      },
      days: calendarDays,
      events: sortedEvents,
    };
  }
}
