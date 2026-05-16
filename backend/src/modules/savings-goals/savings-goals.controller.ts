import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { GoalStatus } from '@prisma/client';
import { CreateGoalContributionDto } from './dto/create-goal-contribution.dto';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { SavingsGoalsService } from './savings-goals.service';

@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  create(@Body() createSavingsGoalDto: CreateSavingsGoalDto) {
    return this.savingsGoalsService.create(createSavingsGoalDto);
  }

  @Get()
  findAll(@Query('status') status?: GoalStatus) {
    return this.savingsGoalsService.findAll({ status });
  }

  @Get('summary')
  getSummary() {
    return this.savingsGoalsService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.savingsGoalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSavingsGoalDto: UpdateSavingsGoalDto) {
    return this.savingsGoalsService.update(id, updateSavingsGoalDto);
  }

  @Post(':id/contributions')
  addContribution(@Param('id', ParseUUIDPipe) id: string, @Body() contributionDto: CreateGoalContributionDto) {
    return this.savingsGoalsService.addContribution(id, contributionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.savingsGoalsService.remove(id);
  }
}
