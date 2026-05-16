import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GoalStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalContributionDto } from './dto/create-goal-contribution.dto';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';

type SavingsGoalFilters = {
  status?: GoalStatus;
};

function normalizeText(value?: string | null) {
  const text = value?.trim();
  return text ? text : undefined;
}

function goalProgress(goal: { targetAmount: number; currentAmount: number }) {
  return goal.targetAmount > 0 ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100) : 0;
}

@Injectable()
export class SavingsGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSavingsGoalDto: CreateSavingsGoalDto) {
    const currentAmount = createSavingsGoalDto.currentAmount ?? 0;

    if (currentAmount > createSavingsGoalDto.targetAmount) {
      throw new BadRequestException('El monto ahorrado inicial no puede superar el monto objetivo.');
    }

    const goal = await this.prisma.savingsGoal.create({
      data: {
        name: createSavingsGoalDto.name.trim(),
        description: normalizeText(createSavingsGoalDto.description),
        targetAmount: createSavingsGoalDto.targetAmount,
        currentAmount,
        targetDate: createSavingsGoalDto.targetDate ? new Date(createSavingsGoalDto.targetDate) : undefined,
        status: currentAmount === createSavingsGoalDto.targetAmount ? GoalStatus.COMPLETED : GoalStatus.ACTIVE,
        notes: normalizeText(createSavingsGoalDto.notes),
      },
      include: { contributions: { orderBy: { contributedAt: 'desc' } } },
    });

    return this.withProgress(goal);
  }

  async findAll(filters: SavingsGoalFilters = {}) {
    if (filters.status && !Object.values(GoalStatus).includes(filters.status)) {
      throw new BadRequestException('Estado de meta inválido.');
    }

    const goals = await this.prisma.savingsGoal.findMany({
      where: filters.status ? { status: filters.status } : {},
      include: { contributions: { orderBy: { contributedAt: 'desc' } } },
      orderBy: [{ status: 'asc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
    });

    return goals.map((goal) => this.withProgress(goal));
  }

  async getSummary() {
    const goals = await this.prisma.savingsGoal.findMany({
      include: { contributions: true },
    });

    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    return {
      totalGoals: goals.length,
      activeGoals: goals.filter((goal) => goal.status === GoalStatus.ACTIVE).length,
      completedGoals: goals.filter((goal) => goal.status === GoalStatus.COMPLETED).length,
      totalTarget,
      totalSaved,
      remainingAmount: Math.max(totalTarget - totalSaved, 0),
      progressPercentage: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
    };
  }

  async findOne(id: string) {
    const goal = await this.prisma.savingsGoal.findUnique({
      where: { id },
      include: { contributions: { orderBy: { contributedAt: 'desc' } } },
    });

    if (!goal) {
      throw new NotFoundException('La meta de ahorro solicitada no existe.');
    }

    return this.withProgress(goal);
  }

  async update(id: string, updateSavingsGoalDto: UpdateSavingsGoalDto) {
    const currentGoal = await this.prisma.savingsGoal.findUnique({
      where: { id },
      include: { contributions: { orderBy: { contributedAt: 'desc' } } },
    });

    if (!currentGoal) {
      throw new NotFoundException('La meta de ahorro solicitada no existe.');
    }

    const nextTargetAmount = updateSavingsGoalDto.targetAmount ?? currentGoal.targetAmount;
    const nextCurrentAmount = updateSavingsGoalDto.currentAmount ?? currentGoal.currentAmount;

    if (nextCurrentAmount > nextTargetAmount) {
      throw new BadRequestException('El monto ahorrado no puede superar el monto objetivo.');
    }

    const requestedStatus = updateSavingsGoalDto.status ?? currentGoal.status;
    const nextStatus = nextCurrentAmount === nextTargetAmount ? GoalStatus.COMPLETED : requestedStatus;

    const updated = await this.prisma.savingsGoal.update({
      where: { id },
      data: {
        name: updateSavingsGoalDto.name?.trim(),
        description: updateSavingsGoalDto.description !== undefined ? normalizeText(updateSavingsGoalDto.description) : undefined,
        targetAmount: updateSavingsGoalDto.targetAmount,
        currentAmount: updateSavingsGoalDto.currentAmount,
        targetDate: updateSavingsGoalDto.targetDate ? new Date(updateSavingsGoalDto.targetDate) : undefined,
        status: nextStatus,
        notes: updateSavingsGoalDto.notes !== undefined ? normalizeText(updateSavingsGoalDto.notes) : undefined,
      },
      include: { contributions: { orderBy: { contributedAt: 'desc' } } },
    });

    return this.withProgress(updated);
  }

  async addContribution(id: string, contributionDto: CreateGoalContributionDto) {
    return this.prisma.$transaction(async (tx) => {
      const goal = await tx.savingsGoal.findUnique({ where: { id } });

      if (!goal) {
        throw new NotFoundException('La meta de ahorro solicitada no existe.');
      }

      if (goal.status === GoalStatus.PAUSED) {
        throw new BadRequestException('No puedes agregar aportes a una meta pausada.');
      }

      if (goal.currentAmount + contributionDto.amount > goal.targetAmount) {
        throw new BadRequestException(`El aporte supera el monto pendiente de la meta. Pendiente: ${goal.targetAmount - goal.currentAmount}.`);
      }

      await tx.goalContribution.create({
        data: {
          savingsGoalId: id,
          amount: contributionDto.amount,
          contributedAt: new Date(contributionDto.contributedAt),
          notes: normalizeText(contributionDto.notes),
        },
      });

      const nextCurrentAmount = goal.currentAmount + contributionDto.amount;
      const nextStatus = nextCurrentAmount === goal.targetAmount ? GoalStatus.COMPLETED : GoalStatus.ACTIVE;

      const updatedGoal = await tx.savingsGoal.update({
        where: { id },
        data: {
          currentAmount: nextCurrentAmount,
          status: nextStatus,
        },
        include: { contributions: { orderBy: { contributedAt: 'desc' } } },
      });

      return this.withProgress(updatedGoal);
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.savingsGoal.delete({ where: { id } });
    return { message: 'Meta de ahorro eliminada correctamente.' };
  }

  private withProgress<T extends { targetAmount: number; currentAmount: number }>(goal: T) {
    return {
      ...goal,
      remainingAmount: Math.max(goal.targetAmount - goal.currentAmount, 0),
      progressPercentage: goalProgress(goal),
    };
  }
}
