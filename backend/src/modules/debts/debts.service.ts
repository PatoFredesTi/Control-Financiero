import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus, ExpenseType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

type DebtFilters = {
  status?: DebtStatus;
  startDate?: string;
  endDate?: string;
};

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
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDebtDto: CreateDebtDto) {
    const initialAmount = createDebtDto.initialAmount;

    if (createDebtDto.status === DebtStatus.PAID) {
      throw new BadRequestException(
        'Una deuda nueva no puede crearse como pagada. Créala como activa y registra sus pagos desde gastos.',
      );
    }

    return this.prisma.debt.create({
      data: {
        name: createDebtDto.name.trim(),
        description: normalizeOptionalText(createDebtDto.description),
        creditor: normalizeOptionalText(createDebtDto.creditor),
        initialAmount,
        pendingAmount: initialAmount,
        paidAmount: 0,
        startDate: new Date(createDebtDto.startDate),
        estimatedEndDate: createDebtDto.estimatedEndDate
          ? new Date(createDebtDto.estimatedEndDate)
          : undefined,
        status: createDebtDto.status ?? DebtStatus.ACTIVE,
        notes: normalizeOptionalText(createDebtDto.notes),
      },
    });
  }

  async findAll(filters: DebtFilters = {}) {
    if (filters.status && !Object.values(DebtStatus).includes(filters.status)) {
      throw new BadRequestException('Estado de deuda inválido.');
    }

    const startDate = parseStartDate(filters.startDate);
    const endDate = parseEndDate(filters.endDate);

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('La fecha inicial no puede ser mayor que la fecha final.');
    }

    const where: Prisma.DebtWhereInput = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(startDate || endDate
        ? {
            startDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    return this.prisma.debt.findMany({
      where,
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });

    if (!debt) {
      throw new NotFoundException('La deuda solicitada no existe.');
    }

    return debt;
  }

  async findPayments(id: string) {
    await this.findOne(id);

    return this.prisma.expense.findMany({
      where: {
        debtId: id,
        type: ExpenseType.DEBT_PAYMENT,
      },
      orderBy: {
        spentAt: 'desc',
      },
    });
  }

  async update(id: string, updateDebtDto: UpdateDebtDto) {
    const currentDebt = await this.findOne(id);

    if (
      updateDebtDto.initialAmount !== undefined &&
      updateDebtDto.initialAmount < currentDebt.paidAmount
    ) {
      throw new BadRequestException(
        'El monto inicial no puede ser menor al monto ya pagado.',
      );
    }

    if (updateDebtDto.status === DebtStatus.PAID && currentDebt.pendingAmount > 0) {
      throw new BadRequestException(
        'No puedes marcar como pagada una deuda que todavía tiene saldo pendiente. Registra el pago restante desde gastos.',
      );
    }

    const nextInitialAmount =
      updateDebtDto.initialAmount ?? currentDebt.initialAmount;
    const nextPendingAmount = Math.max(
      nextInitialAmount - currentDebt.paidAmount,
      0,
    );

    const nextStatus =
      nextPendingAmount === 0
        ? DebtStatus.PAID
        : updateDebtDto.status === DebtStatus.PAID
          ? DebtStatus.ACTIVE
          : updateDebtDto.status ?? currentDebt.status;

    return this.prisma.debt.update({
      where: { id },
      data: {
        name: updateDebtDto.name?.trim(),
        description: updateDebtDto.description !== undefined
          ? normalizeOptionalText(updateDebtDto.description)
          : undefined,
        creditor: updateDebtDto.creditor !== undefined
          ? normalizeOptionalText(updateDebtDto.creditor)
          : undefined,
        initialAmount: updateDebtDto.initialAmount,
        pendingAmount:
          updateDebtDto.initialAmount !== undefined ? nextPendingAmount : undefined,
        startDate: updateDebtDto.startDate
          ? new Date(updateDebtDto.startDate)
          : undefined,
        estimatedEndDate: updateDebtDto.estimatedEndDate
          ? new Date(updateDebtDto.estimatedEndDate)
          : undefined,
        status: nextStatus,
        notes: updateDebtDto.notes !== undefined
          ? normalizeOptionalText(updateDebtDto.notes)
          : undefined,
      },
      include: {
        _count: {
          select: {
            expenses: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const debt = await this.findOne(id);

    if (debt._count.expenses > 0) {
      throw new BadRequestException(
        'No puedes eliminar una deuda con pagos asociados. Primero elimina sus pagos desde el módulo de gastos para recalcular correctamente el saldo.',
      );
    }

    await this.prisma.debt.delete({
      where: { id },
    });

    return {
      message: 'Deuda eliminada correctamente.',
    };
  }
}
