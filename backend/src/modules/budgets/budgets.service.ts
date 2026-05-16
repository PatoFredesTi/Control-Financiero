import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

type BudgetFilters = {
  month?: string;
  year?: string;
  category?: string;
};

function parsePositiveInt(value: string | undefined, name: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException(`${name} debe ser un número entero positivo.`);
  }
  return parsed;
}

function monthRange(month: number, year: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

function normalizeText(value?: string | null) {
  const text = value?.trim();
  return text ? text : undefined;
}

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    try {
      return await this.prisma.budget.create({
        data: {
          category: createBudgetDto.category.trim(),
          amount: createBudgetDto.amount,
          month: createBudgetDto.month,
          year: createBudgetDto.year,
          notes: normalizeText(createBudgetDto.notes),
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un presupuesto para esa categoría en el mes seleccionado.');
      }
      throw error;
    }
  }

  async findAll(filters: BudgetFilters = {}) {
    const month = parsePositiveInt(filters.month, 'month');
    const year = parsePositiveInt(filters.year, 'year');

    const where: Prisma.BudgetWhereInput = {
      ...(month ? { month } : {}),
      ...(year ? { year } : {}),
      ...(filters.category
        ? { category: { equals: filters.category.trim(), mode: 'insensitive' } }
        : {}),
    };

    const budgets = await this.prisma.budget.findMany({
      where,
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { category: 'asc' }],
    });

    return Promise.all(budgets.map((budget) => this.withUsage(budget)));
  }

  async getSummary(filters: Pick<BudgetFilters, 'month' | 'year'> = {}) {
    const now = new Date();
    const month = parsePositiveInt(filters.month, 'month') ?? now.getMonth() + 1;
    const year = parsePositiveInt(filters.year, 'year') ?? now.getFullYear();

    const budgets = await this.prisma.budget.findMany({
      where: { month, year },
      orderBy: { category: 'asc' },
    });

    const budgetsWithUsage = await Promise.all(budgets.map((budget) => this.withUsage(budget)));
    const totalBudgeted = budgetsWithUsage.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgetsWithUsage.reduce((sum, budget) => sum + budget.spentAmount, 0);
    const exceededBudgets = budgetsWithUsage.filter((budget) => budget.remainingAmount < 0).length;

    return {
      period: { month, year },
      totalBudgeted,
      totalSpent,
      remainingAmount: totalBudgeted - totalSpent,
      usagePercentage: totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0,
      exceededBudgets,
      budgets: budgetsWithUsage,
    };
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });

    if (!budget) {
      throw new NotFoundException('El presupuesto solicitado no existe.');
    }

    return this.withUsage(budget);
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id);

    try {
      const updated = await this.prisma.budget.update({
        where: { id },
        data: {
          category: updateBudgetDto.category?.trim(),
          amount: updateBudgetDto.amount,
          month: updateBudgetDto.month,
          year: updateBudgetDto.year,
          notes: updateBudgetDto.notes !== undefined ? normalizeText(updateBudgetDto.notes) : undefined,
        },
      });
      return this.withUsage(updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe un presupuesto para esa categoría en el mes seleccionado.');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.budget.delete({ where: { id } });
    return { message: 'Presupuesto eliminado correctamente.' };
  }

  private async withUsage<T extends { category: string; month: number; year: number; amount: number }>(budget: T) {
    const { start, end } = monthRange(budget.month, budget.year);
    const spent = await this.prisma.expense.aggregate({
      where: {
        type: ExpenseType.COMMON,
        category: { equals: budget.category, mode: 'insensitive' },
        spentAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
    });

    const spentAmount = spent._sum.amount ?? 0;
    return {
      ...budget,
      spentAmount,
      remainingAmount: budget.amount - spentAmount,
      usagePercentage: budget.amount > 0 ? Math.round((spentAmount / budget.amount) * 100) : 0,
    };
  }
}
