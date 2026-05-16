import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseType, RecurringFrequency, RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
import { CreateRecurringMovementDto } from './dto/create-recurring-movement.dto';
import { UpdateRecurringMovementDto } from './dto/update-recurring-movement.dto';

type RecurringFilters = {
  kind?: RecurringMovementKind;
  status?: RecurringStatus;
};

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function parseDate(value: string, label = 'fecha') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`La ${label} es inválida.`);
  }
  return date;
}

function getNextRunDate(current: Date, frequency: RecurringFrequency) {
  const next = new Date(current);
  if (frequency === RecurringFrequency.WEEKLY) next.setDate(next.getDate() + 7);
  if (frequency === RecurringFrequency.BIWEEKLY) next.setDate(next.getDate() + 14);
  if (frequency === RecurringFrequency.MONTHLY) next.setMonth(next.getMonth() + 1);
  if (frequency === RecurringFrequency.YEARLY) next.setFullYear(next.getFullYear() + 1);
  return next;
}

@Injectable()
export class RecurringMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expensesService: ExpensesService,
  ) {}

  async create(dto: CreateRecurringMovementDto) {
    await this.validateDebtAssociation(dto.kind, dto.debtId);

    return this.prisma.recurringMovement.create({
      data: {
        description: dto.description.trim(),
        amount: dto.amount,
        category: dto.kind === RecurringMovementKind.DEBT_PAYMENT ? 'Pago de deuda' : dto.category.trim(),
        paymentMethod: normalizeOptionalText(dto.paymentMethod),
        kind: dto.kind,
        frequency: dto.frequency,
        nextRunAt: parseDate(dto.nextRunAt, 'próxima ejecución'),
        debtId: dto.debtId ?? null,
        status: dto.status ?? RecurringStatus.ACTIVE,
        notes: normalizeOptionalText(dto.notes),
      },
      include: { debt: true },
    });
  }

  async findAll(filters: RecurringFilters = {}) {
    if (filters.kind && !Object.values(RecurringMovementKind).includes(filters.kind)) {
      throw new BadRequestException('Tipo de movimiento recurrente inválido.');
    }

    if (filters.status && !Object.values(RecurringStatus).includes(filters.status)) {
      throw new BadRequestException('Estado de movimiento recurrente inválido.');
    }

    return this.prisma.recurringMovement.findMany({
      where: {
        ...(filters.kind ? { kind: filters.kind } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include: { debt: true },
      orderBy: { nextRunAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const recurring = await this.prisma.recurringMovement.findUnique({
      where: { id },
      include: { debt: true },
    });

    if (!recurring) throw new NotFoundException('El movimiento recurrente no existe.');
    return recurring;
  }

  async update(id: string, dto: UpdateRecurringMovementDto) {
    const current = await this.findOne(id);
    const nextKind = dto.kind ?? current.kind;
    const nextDebtId = dto.debtId !== undefined ? dto.debtId : current.debtId ?? undefined;

    await this.validateDebtAssociation(nextKind, nextDebtId);

    return this.prisma.recurringMovement.update({
      where: { id },
      data: {
        ...(dto.description !== undefined ? { description: dto.description.trim() } : {}),
        ...(dto.amount !== undefined ? { amount: dto.amount } : {}),
        ...(dto.category !== undefined ? { category: nextKind === RecurringMovementKind.DEBT_PAYMENT ? 'Pago de deuda' : dto.category.trim() } : {}),
        ...(dto.paymentMethod !== undefined ? { paymentMethod: normalizeOptionalText(dto.paymentMethod) } : {}),
        ...(dto.kind !== undefined ? { kind: dto.kind } : {}),
        ...(dto.frequency !== undefined ? { frequency: dto.frequency } : {}),
        ...(dto.nextRunAt !== undefined ? { nextRunAt: parseDate(dto.nextRunAt, 'próxima ejecución') } : {}),
        ...(dto.debtId !== undefined ? { debtId: dto.debtId ?? null } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.notes !== undefined ? { notes: normalizeOptionalText(dto.notes) } : {}),
      },
      include: { debt: true },
    });
  }

  async generate(id: string) {
    const recurring = await this.findOne(id);

    if (recurring.status !== RecurringStatus.ACTIVE) {
      throw new BadRequestException('Solo se pueden generar movimientos recurrentes activos.');
    }

    const generatedAt = recurring.nextRunAt;
    let createdMovement: unknown;

    if (recurring.kind === RecurringMovementKind.INCOME) {
      createdMovement = await this.prisma.income.create({
        data: {
          description: recurring.description,
          amount: recurring.amount,
          category: recurring.category,
          receivedAt: generatedAt,
          paymentMethod: recurring.paymentMethod,
          notes: recurring.notes,
        },
      });
    } else {
      createdMovement = await this.expensesService.create({
        description: recurring.description,
        amount: recurring.amount,
        category: recurring.category,
        spentAt: generatedAt.toISOString(),
        paymentMethod: recurring.paymentMethod ?? undefined,
        type: recurring.kind === RecurringMovementKind.DEBT_PAYMENT ? ExpenseType.DEBT_PAYMENT : ExpenseType.COMMON,
        debtId: recurring.debtId ?? undefined,
        notes: recurring.notes ?? undefined,
      });
    }

    const updatedRecurring = await this.prisma.recurringMovement.update({
      where: { id },
      data: {
        lastRunAt: generatedAt,
        nextRunAt: getNextRunDate(generatedAt, recurring.frequency),
      },
      include: { debt: true },
    });

    return { recurringMovement: updatedRecurring, createdMovement };
  }

  async generateDue() {
    const now = new Date();
    const due = await this.prisma.recurringMovement.findMany({
      where: {
        status: RecurringStatus.ACTIVE,
        nextRunAt: { lte: now },
      },
      orderBy: { nextRunAt: 'asc' },
    });

    const results = [];
    for (const item of due) {
      try {
        results.push(await this.generate(item.id));
      } catch (error) {
        results.push({ recurringMovementId: item.id, error: error instanceof Error ? error.message : 'Error desconocido' });
      }
    }

    return { generated: results.length, results };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.recurringMovement.delete({ where: { id } });
    return { message: 'Movimiento recurrente eliminado correctamente.' };
  }

  private async validateDebtAssociation(kind: RecurringMovementKind, debtId?: string | null) {
    if (kind === RecurringMovementKind.DEBT_PAYMENT && !debtId) {
      throw new BadRequestException('Un pago recurrente de deuda debe tener una deuda asociada.');
    }

    if (kind !== RecurringMovementKind.DEBT_PAYMENT && debtId) {
      throw new BadRequestException('Solo los pagos de deuda pueden tener una deuda asociada.');
    }

    if (debtId) {
      const debt = await this.prisma.debt.findUnique({ where: { id: debtId } });
      if (!debt) throw new NotFoundException('La deuda asociada no existe.');
    }
  }
}
