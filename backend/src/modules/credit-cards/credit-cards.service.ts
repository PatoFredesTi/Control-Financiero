import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreditCardStatus, ExpenseType, InstallmentPurchaseStatus, InstallmentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { CreateInstallmentPurchaseDto } from './dto/create-installment-purchase.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function parseDate(value: string, fieldName: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${fieldName} inválida.`);
  }
  return date;
}

function monthRange(month?: string, year?: string) {
  const now = new Date();
  const parsedMonth = month ? Number(month) : now.getUTCMonth() + 1;
  const parsedYear = year ? Number(year) : now.getUTCFullYear();

  if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw new BadRequestException('Mes inválido. Debe estar entre 1 y 12.');
  }

  if (!Number.isInteger(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
    throw new BadRequestException('Año inválido.');
  }

  const start = new Date(Date.UTC(parsedYear, parsedMonth - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(parsedYear, parsedMonth, 0, 23, 59, 59, 999));
  return { start, end, month: parsedMonth, year: parsedYear };
}

@Injectable()
export class CreditCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCreditCardDto) {
    return this.prisma.creditCard.create({
      data: {
        name: dto.name.trim(),
        issuer: normalizeOptionalText(dto.issuer),
        limitAmount: dto.limitAmount,
        usedAmount: 0,
        billingDay: dto.billingDay,
        paymentDueDay: dto.paymentDueDay,
        status: dto.status ?? CreditCardStatus.ACTIVE,
        notes: normalizeOptionalText(dto.notes),
      },
      include: this.cardInclude(),
    });
  }

  async findAll(status?: string) {
    if (status && !Object.values(CreditCardStatus).includes(status as CreditCardStatus)) {
      throw new BadRequestException('Estado de tarjeta inválido.');
    }

    return this.prisma.creditCard.findMany({
      where: status ? { status: status as CreditCardStatus } : undefined,
      include: this.cardInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const card = await this.prisma.creditCard.findUnique({
      where: { id },
      include: {
        ...this.cardInclude(),
        purchases: {
          include: { installments: { orderBy: { number: 'asc' } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!card) {
      throw new NotFoundException('La tarjeta solicitada no existe.');
    }

    return card;
  }

  async update(id: string, dto: UpdateCreditCardDto) {
    const current = await this.findOne(id);

    if (dto.limitAmount !== undefined && dto.limitAmount < current.usedAmount) {
      throw new BadRequestException(
        'El cupo total no puede ser menor al cupo utilizado actualmente.',
      );
    }

    return this.prisma.creditCard.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        issuer: dto.issuer !== undefined ? normalizeOptionalText(dto.issuer) : undefined,
        limitAmount: dto.limitAmount,
        billingDay: dto.billingDay,
        paymentDueDay: dto.paymentDueDay,
        status: dto.status,
        notes: dto.notes !== undefined ? normalizeOptionalText(dto.notes) : undefined,
      },
      include: this.cardInclude(),
    });
  }

  async remove(id: string) {
    const card = await this.prisma.creditCard.findUnique({
      where: { id },
      include: { _count: { select: { purchases: true } } },
    });

    if (!card) {
      throw new NotFoundException('La tarjeta solicitada no existe.');
    }

    if (card._count.purchases > 0) {
      throw new BadRequestException(
        'No puedes eliminar una tarjeta con compras en cuotas. Ciérrala o elimina primero sus compras si corresponde.',
      );
    }

    await this.prisma.creditCard.delete({ where: { id } });
    return { message: 'Tarjeta eliminada correctamente.' };
  }

  async createInstallmentPurchase(dto: CreateInstallmentPurchaseDto) {
    const firstInstallmentAt = parseDate(dto.firstInstallmentAt, 'Fecha de primera cuota');

    return this.prisma.$transaction(async (tx) => {
      const card = await tx.creditCard.findUnique({ where: { id: dto.creditCardId } });

      if (!card) {
        throw new NotFoundException('La tarjeta asociada no existe.');
      }

      if (card.status !== CreditCardStatus.ACTIVE) {
        throw new BadRequestException('Solo puedes registrar compras en una tarjeta activa.');
      }

      const availableLimit = card.limitAmount - card.usedAmount;
      if (dto.totalAmount > availableLimit) {
        throw new BadRequestException(
          `La compra supera el cupo disponible. Cupo disponible: ${availableLimit}.`,
        );
      }

      const baseAmount = Math.floor(dto.totalAmount / dto.installmentsCount);
      const remainder = dto.totalAmount % dto.installmentsCount;
      const installmentsData = Array.from({ length: dto.installmentsCount }, (_, index) => ({
        number: index + 1,
        amount: baseAmount + (index === dto.installmentsCount - 1 ? remainder : 0),
        dueAt: addMonths(firstInstallmentAt, index),
        status: InstallmentStatus.PENDING,
      }));

      const purchase = await tx.installmentPurchase.create({
        data: {
          creditCardId: card.id,
          description: dto.description.trim(),
          category: dto.category.trim(),
          totalAmount: dto.totalAmount,
          installmentsCount: dto.installmentsCount,
          monthlyAmount: baseAmount,
          pendingAmount: dto.totalAmount,
          firstInstallmentAt,
          status: InstallmentPurchaseStatus.ACTIVE,
          notes: normalizeOptionalText(dto.notes),
          installments: { create: installmentsData },
        },
        include: { creditCard: true, installments: { orderBy: { number: 'asc' } } },
      });

      await tx.creditCard.update({
        where: { id: card.id },
        data: { usedAmount: card.usedAmount + dto.totalAmount },
      });

      return purchase;
    });
  }

  async findPurchases(cardId: string) {
    await this.findOne(cardId);

    return this.prisma.installmentPurchase.findMany({
      where: { creditCardId: cardId },
      include: {
        creditCard: true,
        installments: { orderBy: { number: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upcomingInstallments(filters: { month?: string; year?: string; status?: string }) {
    const { start, end, month, year } = monthRange(filters.month, filters.year);
    const status = filters.status as InstallmentStatus | undefined;

    if (filters.status && !Object.values(InstallmentStatus).includes(status!)) {
      throw new BadRequestException('Estado de cuota inválido.');
    }

    const installments = await this.prisma.installment.findMany({
      where: {
        dueAt: { gte: start, lte: end },
        ...(status ? { status } : {}),
      },
      include: {
        purchase: { include: { creditCard: true } },
        expense: true,
      },
      orderBy: { dueAt: 'asc' },
    });

    const total = installments.reduce((acc, item) => acc + item.amount, 0);
    const pending = installments
      .filter((item) => item.status === InstallmentStatus.PENDING)
      .reduce((acc, item) => acc + item.amount, 0);
    const paid = installments
      .filter((item) => item.status === InstallmentStatus.PAID)
      .reduce((acc, item) => acc + item.amount, 0);

    return { month, year, total, pending, paid, installments };
  }

  async payInstallment(id: string, dto: PayInstallmentDto) {
    const paidAt = dto.paidAt ? parseDate(dto.paidAt, 'Fecha de pago') : new Date();

    return this.prisma.$transaction(async (tx) => {
      const installment = await tx.installment.findUnique({
        where: { id },
        include: { purchase: { include: { creditCard: true } } },
      });

      if (!installment) {
        throw new NotFoundException('La cuota solicitada no existe.');
      }

      if (installment.status !== InstallmentStatus.PENDING) {
        throw new BadRequestException('Solo puedes pagar cuotas pendientes.');
      }

      const purchase = installment.purchase;
      const card = purchase.creditCard;
      const paymentMethod = normalizeOptionalText(dto.paymentMethod) ?? `Tarjeta ${card.name}`;

      const expense = await tx.expense.create({
        data: {
          description: `Cuota ${installment.number}/${purchase.installmentsCount} - ${purchase.description}`,
          amount: installment.amount,
          category: purchase.category,
          spentAt: paidAt,
          paymentMethod,
          type: ExpenseType.COMMON,
          notes: normalizeOptionalText(dto.notes) ?? `Pago generado desde tarjeta ${card.name}.`,
        },
      });

      const updatedInstallment = await tx.installment.update({
        where: { id: installment.id },
        data: {
          status: InstallmentStatus.PAID,
          paidAt,
          expenseId: expense.id,
        },
        include: {
          purchase: { include: { creditCard: true } },
          expense: true,
        },
      });

      const nextPaidAmount = purchase.paidAmount + installment.amount;
      const nextPendingAmount = Math.max(purchase.pendingAmount - installment.amount, 0);

      await tx.installmentPurchase.update({
        where: { id: purchase.id },
        data: {
          paidAmount: nextPaidAmount,
          pendingAmount: nextPendingAmount,
          status: nextPendingAmount === 0 ? InstallmentPurchaseStatus.COMPLETED : InstallmentPurchaseStatus.ACTIVE,
        },
      });

      await tx.creditCard.update({
        where: { id: card.id },
        data: { usedAmount: Math.max(card.usedAmount - installment.amount, 0) },
      });

      return updatedInstallment;
    });
  }

  async summary() {
    const cards = await this.prisma.creditCard.findMany({ include: this.cardInclude() });
    const activeCards = cards.filter((card) => card.status === CreditCardStatus.ACTIVE);
    const totalLimit = cards.reduce((acc, card) => acc + card.limitAmount, 0);
    const totalUsed = cards.reduce((acc, card) => acc + card.usedAmount, 0);
    const totalAvailable = totalLimit - totalUsed;
    const totalPurchases = cards.reduce((acc, card) => acc + card._count.purchases, 0);

    const { pending: currentMonthPending } = await this.upcomingInstallments({});

    return {
      totalCards: cards.length,
      activeCards: activeCards.length,
      totalLimit,
      totalUsed,
      totalAvailable,
      utilizationPercentage: totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0,
      totalPurchases,
      currentMonthPending,
      cards,
    };
  }

  private cardInclude() {
    return {
      _count: {
        select: {
          purchases: true,
        },
      },
    } satisfies Prisma.CreditCardInclude;
  }
}
