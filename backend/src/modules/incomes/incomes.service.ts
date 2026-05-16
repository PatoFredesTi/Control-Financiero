import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

type IncomeFilters = {
  category?: string;
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

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createIncomeDto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        description: createIncomeDto.description.trim(),
        amount: createIncomeDto.amount,
        category: createIncomeDto.category.trim(),
        receivedAt: new Date(createIncomeDto.receivedAt),
        paymentMethod: createIncomeDto.paymentMethod?.trim(),
        notes: createIncomeDto.notes?.trim(),
      },
    });
  }

  async findAll(filters: IncomeFilters = {}) {
    const startDate = parseStartDate(filters.startDate);
    const endDate = parseEndDate(filters.endDate);

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('La fecha inicial no puede ser mayor que la fecha final.');
    }

    const where: Prisma.IncomeWhereInput = {
      ...(filters.category
        ? {
            category: {
              equals: filters.category.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
      ...(startDate || endDate
        ? {
            receivedAt: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    return this.prisma.income.findMany({
      where,
      orderBy: {
        receivedAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const income = await this.prisma.income.findUnique({
      where: { id },
    });

    if (!income) {
      throw new NotFoundException('El ingreso solicitado no existe.');
    }

    return income;
  }

  async update(id: string, updateIncomeDto: UpdateIncomeDto) {
    await this.findOne(id);

    return this.prisma.income.update({
      where: { id },
      data: {
        description: updateIncomeDto.description?.trim(),
        amount: updateIncomeDto.amount,
        category: updateIncomeDto.category?.trim(),
        receivedAt: updateIncomeDto.receivedAt
          ? new Date(updateIncomeDto.receivedAt)
          : undefined,
        paymentMethod: updateIncomeDto.paymentMethod?.trim(),
        notes: updateIncomeDto.notes?.trim(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.income.delete({
      where: { id },
    });

    return {
      message: 'Ingreso eliminado correctamente.',
    };
  }
}
