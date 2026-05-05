import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

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

  async findAll(category?: string) {
    return this.prisma.income.findMany({
      where: category ? { category } : undefined,
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
