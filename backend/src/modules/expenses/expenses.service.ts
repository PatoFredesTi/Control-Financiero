import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, ExpenseType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

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
        paymentMethod: createExpenseDto.paymentMethod?.trim(),
        type,
        debtId: null,
        notes: createExpenseDto.notes?.trim(),
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
      const debt = await tx.debt.findUnique({
        where: { id: createExpenseDto.debtId },
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

      if (createExpenseDto.amount > debt.pendingAmount) {
        throw new BadRequestException(
          `El pago no puede superar el saldo pendiente de la deuda. Saldo pendiente: ${debt.pendingAmount}.`,
        );
      }

      const nextPaidAmount = debt.paidAmount + createExpenseDto.amount;
      const nextPendingAmount = debt.pendingAmount - createExpenseDto.amount;
      const nextStatus =
        nextPendingAmount === 0 ? DebtStatus.PAID : debt.status;

      const expense = await tx.expense.create({
        data: {
          description: createExpenseDto.description.trim(),
          amount: createExpenseDto.amount,
          category: 'Pago de deuda',
          spentAt: new Date(createExpenseDto.spentAt),
          paymentMethod: createExpenseDto.paymentMethod?.trim(),
          type: ExpenseType.DEBT_PAYMENT,
          debtId: debt.id,
          notes: createExpenseDto.notes?.trim(),
        },
      });

      const updatedDebt = await tx.debt.update({
        where: { id: debt.id },
        data: {
          paidAmount: nextPaidAmount,
          pendingAmount: nextPendingAmount,
          status: nextStatus,
        },
      });

      return {
        ...expense,
        debt: updatedDebt,
      };
    });
  }

  async findAll(category?: string, type?: ExpenseType) {
    if (type && !Object.values(ExpenseType).includes(type)) {
      throw new BadRequestException('Tipo de gasto inválido.');
    }

    return this.prisma.expense.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(type ? { type } : {}),
      },
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
    const currentExpense = await this.findOne(id);

    if (currentExpense.type === ExpenseType.DEBT_PAYMENT) {
      const isTryingToChangeFinancialImpact =
        updateExpenseDto.amount !== undefined ||
        updateExpenseDto.type !== undefined ||
        updateExpenseDto.debtId !== undefined ||
        updateExpenseDto.category !== undefined;

      if (isTryingToChangeFinancialImpact) {
        throw new BadRequestException(
          'En v0.5 no se permite cambiar monto, tipo, categoría o deuda asociada de un pago de deuda. Elimina el pago y créalo nuevamente para recalcular la deuda correctamente.',
        );
      }
    }

    if (currentExpense.type === ExpenseType.COMMON) {
      const nextType = updateExpenseDto.type ?? currentExpense.type;

      if (nextType === ExpenseType.DEBT_PAYMENT) {
        throw new BadRequestException(
          'En v0.5 no se permite convertir un gasto común en pago de deuda. Elimina el gasto y créalo nuevamente como pago de deuda.',
        );
      }

      if (updateExpenseDto.debtId) {
        throw new BadRequestException(
          'Un gasto común no debe tener una deuda asociada.',
        );
      }
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        description: updateExpenseDto.description?.trim(),
        amount: updateExpenseDto.amount,
        category: updateExpenseDto.category?.trim(),
        spentAt: updateExpenseDto.spentAt
          ? new Date(updateExpenseDto.spentAt)
          : undefined,
        paymentMethod: updateExpenseDto.paymentMethod?.trim(),
        type: updateExpenseDto.type,
        debtId: updateExpenseDto.debtId,
        notes: updateExpenseDto.notes?.trim(),
      },
      include: {
        debt: true,
      },
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
      await tx.expense.delete({
        where: { id },
      });

      await this.revertDebtPayment(tx, expense.debtId!, expense.amount);
    });

    return {
      message:
        'Pago de deuda eliminado correctamente. El saldo de la deuda fue recalculado.',
    };
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
        status: debt.status === DebtStatus.PAID ? DebtStatus.ACTIVE : debt.status,
      },
    });
  }
}
