import { Controller, Get, Query } from '@nestjs/common';
import { FinancialAssistantService } from './financial-assistant.service';

function currentMonth() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

@Controller('financial-assistant')
export class FinancialAssistantController {
  constructor(private readonly financialAssistantService: FinancialAssistantService) {}

  @Get('monthly-briefing')
  getMonthlyBriefing(@Query('month') month?: string, @Query('year') year?: string) {
    const fallback = currentMonth();
    return this.financialAssistantService.getMonthlyBriefing(Number(month ?? fallback.month), Number(year ?? fallback.year));
  }

  @Get('action-plan')
  getActionPlan(@Query('month') month?: string, @Query('year') year?: string) {
    const fallback = currentMonth();
    return this.financialAssistantService.getActionPlan(Number(month ?? fallback.month), Number(year ?? fallback.year));
  }

  @Get('rules')
  getRulesCatalog() {
    return this.financialAssistantService.getRulesCatalog();
  }
}
