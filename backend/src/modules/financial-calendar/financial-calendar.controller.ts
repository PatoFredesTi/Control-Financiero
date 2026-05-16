import { Controller, Get, Query } from '@nestjs/common';
import { FinancialCalendarService } from './financial-calendar.service';

@Controller('financial-calendar')
export class FinancialCalendarController {
  constructor(private readonly financialCalendarService: FinancialCalendarService) {}

  @Get('monthly')
  getMonthly(@Query('month') month?: string, @Query('year') year?: string) {
    return this.financialCalendarService.getMonthlyCalendar({ month, year });
  }
}
