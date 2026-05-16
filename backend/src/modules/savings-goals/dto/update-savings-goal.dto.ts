import { IsEnum, IsOptional } from 'class-validator';
import { GoalStatus } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';
import { CreateSavingsGoalDto } from './create-savings-goal.dto';

export class UpdateSavingsGoalDto extends PartialType(CreateSavingsGoalDto) {
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
