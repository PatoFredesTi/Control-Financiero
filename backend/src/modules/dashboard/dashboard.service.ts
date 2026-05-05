import { Injectable } from '@nestjs/common';
import { DebtStatus, ExpenseType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      monthIncomeAggregate,
      monthExpenseAggregate,
      monthCommonExpenseAggregate,
      monthDebtPaymentAggregate,
      totalDebtAggregate,
      activeDebts,
      paidDebts,
      incomesCount,
      expensesCount,
      debtsCount,
      recentIncomes,
      recentExpenses,
    ] = await Promise.all([
      this.prisma.income.aggregate({
        where: {
          receivedAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.expense.aggregate({
        where: {
          spentAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.expense.aggregate({
        where: {
          type: ExpenseType.COMMON,
          spentAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.expense.aggregate({
        where: {
          type: ExpenseType.DEBT_PAYMENT,
          spentAt: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.debt.aggregate({
        _sum: {
          initialAmount: true,
          pendingAmount: true,
          paidAmount: true,
        },
      }),
      this.prisma.debt.count({
        where: {
          status: DebtStatus.ACTIVE,
        },
      }),
      this.prisma.debt.count({
        where: {
          status: DebtStatus.PAID,
        },
      }),
      this.prisma.income.count(),
      this.prisma.expense.count(),
      this.prisma.debt.count(),
      this.prisma.income.findMany({
        take: 6,
        orderBy: {
          receivedAt: 'desc',
        },
      }),
      this.prisma.expense.findMany({
        take: 6,
        orderBy: {
          spentAt: 'desc',
        },
        include: {
          debt: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalIncomeThisMonth = monthIncomeAggregate._sum.amount ?? 0;
    const totalExpenseThisMonth = monthExpenseAggregate._sum.amount ?? 0;
    const totalCommonExpensesThisMonth = monthCommonExpenseAggregate._sum.amount ?? 0;
    const totalDebtPaymentsThisMonth = monthDebtPaymentAggregate._sum.amount ?? 0;
    const totalDebtInitial = totalDebtAggregate._sum.initialAmount ?? 0;
    const totalDebtPending = totalDebtAggregate._sum.pendingAmount ?? 0;
    const totalDebtPaid = totalDebtAggregate._sum.paidAmount ?? 0;
    const debtProgressPercentage =
      totalDebtInitial > 0 ? Math.round((totalDebtPaid / totalDebtInitial) * 100) : 0;

    const recentMovements = [
      ...recentIncomes.map((income) => ({
        id: income.id,
        type: 'INCOME' as const,
        description: income.description,
        amount: income.amount,
        category: income.category,
        date: income.receivedAt,
      })),
      ...recentExpenses.map((expense) => ({
        id: expense.id,
        type: 'EXPENSE' as const,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.spentAt,
        expenseType: expense.type,
        debtName: expense.debt?.name ?? null,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);

    return {
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        monthStart: monthStart.toISOString(),
        nextMonthStart: nextMonthStart.toISOString(),
      },
      totals: {
        totalIncomeThisMonth,
        totalExpenseThisMonth,
        totalCommonExpensesThisMonth,
        totalDebtPaymentsThisMonth,
        balanceThisMonth: totalIncomeThisMonth - totalExpenseThisMonth,
        totalDebtInitial,
        totalDebtPending,
        totalDebtPaid,
        debtProgressPercentage,
      },
      counts: {
        incomes: incomesCount,
        expenses: expensesCount,
        debts: debtsCount,
        activeDebts,
        paidDebts,
      },
      recentMovements,
    };
  }

  async getCharts() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [incomes, expenses, expensesByCategory, debts] = await Promise.all([
      this.prisma.income.findMany({
        where: {
          receivedAt: {
            gte: sixMonthsAgoStart,
            lt: nextMonthStart,
          },
        },
        select: {
          amount: true,
          receivedAt: true,
        },
      }),
      this.prisma.expense.findMany({
        where: {
          spentAt: {
            gte: sixMonthsAgoStart,
            lt: nextMonthStart,
          },
        },
        select: {
          amount: true,
          spentAt: true,
          type: true,
        },
      }),
      this.prisma.expense.groupBy({
        by: ['category'],
        where: {
          spentAt: {
            gte: currentMonthStart,
            lt: nextMonthStart,
          },
        },
        _sum: {
          amount: true,
        },
        _count: {
          id: true,
        },
        orderBy: {
          _sum: {
            amount: 'desc',
          },
        },
      }),
      this.prisma.debt.findMany({
        orderBy: [{ status: 'asc' }, { pendingAmount: 'desc' }],
        select: {
          id: true,
          name: true,
          initialAmount: true,
          paidAmount: true,
          pendingAmount: true,
          status: true,
        },
      }),
    ]);

    const monthFormatter = new Intl.DateTimeFormat('es-CL', {
      month: 'short',
      year: '2-digit',
    });

    const monthlyComparison = Array.from({ length: 6 }, (_, index) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();

      const income = incomes
        .filter((item) => item.receivedAt.getMonth() === month && item.receivedAt.getFullYear() === year)
        .reduce((sum, item) => sum + item.amount, 0);

      const expense = expenses
        .filter((item) => item.spentAt.getMonth() === month && item.spentAt.getFullYear() === year)
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        month: monthFormatter.format(monthDate),
        income,
        expense,
        balance: income - expense,
      };
    });

    const currentMonthExpenses = expenses.filter(
      (expense) => expense.spentAt >= currentMonthStart && expense.spentAt < nextMonthStart,
    );

    const commonExpenses = currentMonthExpenses
      .filter((expense) => expense.type === ExpenseType.COMMON)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const debtPayments = currentMonthExpenses
      .filter((expense) => expense.type === ExpenseType.DEBT_PAYMENT)
      .reduce((sum, expense) => sum + expense.amount, 0);

    return {
      period: {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        currentMonthStart: currentMonthStart.toISOString(),
        nextMonthStart: nextMonthStart.toISOString(),
        sixMonthsAgoStart: sixMonthsAgoStart.toISOString(),
      },
      monthlyComparison,
      expensesByCategory: expensesByCategory.map((category) => ({
        category: category.category,
        amount: category._sum.amount ?? 0,
        count: category._count.id,
      })),
      expenseTypeBreakdown: [
        {
          type: 'Gastos comunes',
          amount: commonExpenses,
        },
        {
          type: 'Pagos de deuda',
          amount: debtPayments,
        },
      ],
      debtProgress: debts.map((debt) => ({
        id: debt.id,
        name: debt.name,
        initialAmount: debt.initialAmount,
        paidAmount: debt.paidAmount,
        pendingAmount: debt.pendingAmount,
        status: debt.status,
        progressPercentage:
          debt.initialAmount > 0 ? Math.round((debt.paidAmount / debt.initialAmount) * 100) : 0,
      })),
    };
  }
}
