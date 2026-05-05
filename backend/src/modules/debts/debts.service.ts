import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DebtStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';

@Injectable()
export class DebtsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDebtDto: CreateDebtDto) {
    const initialAmount = createDebtDto.initialAmount;

    return this.prisma.debt.create({
      data: {
        name: createDebtDto.name.trim(),
        description: createDebtDto.description?.trim(),
        creditor: createDebtDto.creditor?.trim(),
        initialAmount,
        pendingAmount: initialAmount,
        paidAmount: 0,
        startDate: new Date(createDebtDto.startDate),
        estimatedEndDate: createDebtDto.estimatedEndDate
          ? new Date(createDebtDto.estimatedEndDate)
          : undefined,
        status: createDebtDto.status ?? DebtStatus.ACTIVE,
        notes: createDebtDto.notes?.trim(),
      },
    });
  }

  async findAll(status?: DebtStatus) {
    if (status && !Object.values(DebtStatus).includes(status)) {
      throw new BadRequestException('Estado de deuda inválido.');
    }

    return this.prisma.debt.findMany({
      where: status ? { status } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const debt = await this.prisma.debt.findUnique({
      where: { id },
    });

    if (!debt) {
      throw new NotFoundException('La deuda solicitada no existe.');
    }

    return debt;
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

    const nextInitialAmount =
      updateDebtDto.initialAmount ?? currentDebt.initialAmount;
    const nextPendingAmount = Math.max(
      nextInitialAmount - currentDebt.paidAmount,
      0,
    );

    const nextStatus =
      nextPendingAmount === 0
        ? DebtStatus.PAID
        : updateDebtDto.status ?? currentDebt.status;

    return this.prisma.debt.update({
      where: { id },
      data: {
        name: updateDebtDto.name?.trim(),
        description: updateDebtDto.description?.trim(),
        creditor: updateDebtDto.creditor?.trim(),
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
        notes: updateDebtDto.notes?.trim(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.debt.delete({
      where: { id },
    });

    return {
      message: 'Deuda eliminada correctamente.',
    };
  }
}
