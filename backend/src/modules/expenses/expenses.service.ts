import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, Expense, ExpenseType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

type ExpenseFilters = {
  category?: string;
  type?: ExpenseType;
  startDate?: string;
  endDate?: string;
};

type ExpenseWithDebt = Prisma.ExpenseGetPayload<{
  include: { debt: true };
}>;

function parseStartDate(value?: string) {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Fecha inicial inválida. Usa formato YYYY-MM-DD.');
  }

  return date;
}

function parseEndDate(value?: string) {
  if (!value) return undefined;

  const date = new Date(`${value}T23:59:59.999Z`);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Fecha final inválida. Usa formato YYYY-MM-DD.');
  }

  return date;
}

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createExpenseDto: CreateExpenseDto) {
    const type = createExpenseDto.type ?? ExpenseType.COMMON;

    if (type === ExpenseType.DEBT_PAYMENT) {
      return this.createDebtPaymentExpense(createExpenseDto);
    }

    if (createExpenseDto.debtId) {
      throw new BadRequestException(
        'Un gasto común no debe tener una deuda asociada.',
      );
    }

    return this.prisma.expense.create({
      data: {
        description: createExpenseDto.description.trim(),
        amount: createExpenseDto.amount,
        category: createExpenseDto.category.trim(),
        spentAt: new Date(createExpenseDto.spentAt),
        paymentMethod: normalizeOptionalText(createExpenseDto.paymentMethod),
        type,
        debtId: null,
        notes: normalizeOptionalText(createExpenseDto.notes),
      },
      include: {
        debt: true,
      },
    });
  }

  private async createDebtPaymentExpense(createExpenseDto: CreateExpenseDto) {
    if (!createExpenseDto.debtId) {
      throw new BadRequestException(
        'Debes seleccionar una deuda asociada para registrar un pago de deuda.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDebt = await this.applyDebtPayment(
        tx,
        createExpenseDto.debtId!,
        createExpenseDto.amount,
      );

      const expense = await tx.expense.create({
        data: {
          description: createExpenseDto.description.trim(),
          amount: createExpenseDto.amount,
          category: 'Pago de deuda',
          spentAt: new Date(createExpenseDto.spentAt),
          paymentMethod: normalizeOptionalText(createExpenseDto.paymentMethod),
          type: ExpenseType.DEBT_PAYMENT,
          debtId: updatedDebt.id,
          notes: normalizeOptionalText(createExpenseDto.notes),
        },
      });

      return {
        ...expense,
        debt: updatedDebt,
      };
    });
  }

  async findAll(filters: ExpenseFilters = {}) {
    if (filters.type && !Object.values(ExpenseType).includes(filters.type)) {
      throw new BadRequestException('Tipo de gasto inválido.');
    }

    const startDate = parseStartDate(filters.startDate);
    const endDate = parseEndDate(filters.endDate);

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('La fecha inicial no puede ser mayor que la fecha final.');
    }

    const where: Prisma.ExpenseWhereInput = {
      ...(filters.category
        ? {
            category: {
              equals: filters.category.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(startDate || endDate
        ? {
            spentAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    return this.prisma.expense.findMany({
      where,
      include: {
        debt: true,
      },
      orderBy: {
        spentAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        debt: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('El gasto solicitado no existe.');
    }

    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto) {
    return this.prisma.$transaction(async (tx) => {
      const currentExpense = await tx.expense.findUnique({
        where: { id },
        include: { debt: true },
      });

      if (!currentExpense) {
        throw new NotFoundException('El gasto solicitado no existe.');
      }

      const nextType = updateExpenseDto.type ?? currentExpense.type;
      const nextAmount = updateExpenseDto.amount ?? currentExpense.amount;
      const nextSpentAt = updateExpenseDto.spentAt
        ? new Date(updateExpenseDto.spentAt)
        : currentExpense.spentAt;
      const nextDescription = updateExpenseDto.description?.trim() ?? currentExpense.description;
      const nextPaymentMethod = updateExpenseDto.paymentMethod !== undefined
        ? normalizeOptionalText(updateExpenseDto.paymentMethod)
        : currentExpense.paymentMethod;
      const nextNotes = updateExpenseDto.notes !== undefined
        ? normalizeOptionalText(updateExpenseDto.notes)
        : currentExpense.notes;

      if (nextType === ExpenseType.COMMON) {
        return this.updateAsCommonExpense(tx, currentExpense, {
          description: nextDescription,
          amount: nextAmount,
          category: updateExpenseDto.category?.trim() ?? currentExpense.category,
          spentAt: nextSpentAt,
          paymentMethod: nextPaymentMethod,
          notes: nextNotes,
        });
      }

      const nextDebtId = updateExpenseDto.debtId ?? currentExpense.debtId;

      if (!nextDebtId) {
        throw new BadRequestException(
          'Debes seleccionar una deuda asociada para registrar un pago de deuda.',
        );
      }

      return this.updateAsDebtPaymentExpense(tx, currentExpense, {
        description: nextDescription,
        amount: nextAmount,
        spentAt: nextSpentAt,
        paymentMethod: nextPaymentMethod,
        notes: nextNotes,
        debtId: nextDebtId,
      });
    });
  }

  async remove(id: string) {
    const expense = await this.findOne(id);

    if (expense.type !== ExpenseType.DEBT_PAYMENT || !expense.debtId) {
      await this.prisma.expense.delete({
        where: { id },
      });

      return {
        message: 'Gasto eliminado correctamente.',
      };
    }

    await this.prisma.$transaction(async (tx) => {
      await this.revertDebtPayment(tx, expense.debtId!, expense.amount);

      await tx.expense.delete({
        where: { id },
      });
    });

    return {
      message:
        'Pago de deuda eliminado correctamente. El saldo de la deuda fue recalculado.',
    };
  }

  private async updateAsCommonExpense(
    tx: Prisma.TransactionClient,
    currentExpense: ExpenseWithDebt,
    input: {
      description: string;
      amount: number;
      category: string;
      spentAt: Date;
      paymentMethod?: string | null;
      notes?: string | null;
    },
  ) {
    if (!input.category || input.category === 'Pago de deuda') {
      throw new BadRequestException(
        'Un gasto común debe tener una categoría válida distinta de Pago de deuda.',
      );
    }

    if (currentExpense.type === ExpenseType.DEBT_PAYMENT && currentExpense.debtId) {
      await this.revertDebtPayment(tx, currentExpense.debtId, currentExpense.amount);
    }

    return tx.expense.update({
      where: { id: currentExpense.id },
      data: {
        description: input.description,
        amount: input.amount,
        category: input.category,
        spentAt: input.spentAt,
        paymentMethod: input.paymentMethod,
        type: ExpenseType.COMMON,
        debtId: null,
        notes: input.notes,
      },
      include: { debt: true },
    });
  }

  private async updateAsDebtPaymentExpense(
    tx: Prisma.TransactionClient,
    currentExpense: ExpenseWithDebt,
    input: {
      description: string;
      amount: number;
      spentAt: Date;
      paymentMethod?: string | null;
      notes?: string | null;
      debtId: string;
    },
  ) {
    if (currentExpense.type === ExpenseType.DEBT_PAYMENT && currentExpense.debtId) {
      await this.revertDebtPayment(tx, currentExpense.debtId, currentExpense.amount);
    }

    const updatedDebt = await this.applyDebtPayment(tx, input.debtId, input.amount);

    const updatedExpense = await tx.expense.update({
      where: { id: currentExpense.id },
      data: {
        description: input.description,
        amount: input.amount,
        category: 'Pago de deuda',
        spentAt: input.spentAt,
        paymentMethod: input.paymentMethod,
        type: ExpenseType.DEBT_PAYMENT,
        debtId: updatedDebt.id,
        notes: input.notes,
      },
    });

    return {
      ...updatedExpense,
      debt: updatedDebt,
    };
  }

  private async applyDebtPayment(
    tx: Prisma.TransactionClient,
    debtId: string,
    amount: number,
  ) {
    const debt = await tx.debt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      throw new NotFoundException('La deuda asociada no existe.');
    }

    if (debt.status === DebtStatus.PAID) {
      throw new BadRequestException(
        'No puedes registrar pagos sobre una deuda que ya está pagada.',
      );
    }

    if (debt.status === DebtStatus.PAUSED) {
      throw new BadRequestException(
        'No puedes registrar pagos sobre una deuda pausada. Primero cambia su estado a activa.',
      );
    }

    if (amount > debt.pendingAmount) {
      throw new BadRequestException(
        `El pago no puede superar el saldo pendiente de la deuda. Saldo pendiente: ${debt.pendingAmount}.`,
      );
    }

    const nextPaidAmount = debt.paidAmount + amount;
    const nextPendingAmount = debt.pendingAmount - amount;
    const nextStatus = nextPendingAmount === 0 ? DebtStatus.PAID : DebtStatus.ACTIVE;

    return tx.debt.update({
      where: { id: debt.id },
      data: {
        paidAmount: nextPaidAmount,
        pendingAmount: nextPendingAmount,
        status: nextStatus,
      },
    });
  }

  private async revertDebtPayment(
    tx: Prisma.TransactionClient,
    debtId: string,
    amount: number,
  ) {
    const debt = await tx.debt.findUnique({
      where: { id: debtId },
    });

    if (!debt) {
      return;
    }

    const nextPaidAmount = Math.max(debt.paidAmount - amount, 0);
    const nextPendingAmount = Math.min(
      debt.pendingAmount + amount,
      debt.initialAmount,
    );

    await tx.debt.update({
      where: { id: debt.id },
      data: {
        paidAmount: nextPaidAmount,
        pendingAmount: nextPendingAmount,
        status: nextPendingAmount === 0 ? DebtStatus.PAID : DebtStatus.ACTIVE,
      },
    });
  }
}
