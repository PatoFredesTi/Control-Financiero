import { Controller, Get, Query } from '@nestjs/common';
import { FinancialProjectionsService } from './financial-projections.service';

@Controller('financial-projections')
export class FinancialProjectionsController {
  constructor(private readonly financialProjectionsService: FinancialProjectionsService) {}

  @Get('monthly')
  getMonthlyProjection(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('monthsAhead') monthsAhead?: string,
    @Query('expenseReductionPercentage') expenseReductionPercentage?: string,
    @Query('extraDebtPayment') extraDebtPayment?: string,
    @Query('monthlySaving') monthlySaving?: string,
  ) {
    return this.financialProjectionsService.getMonthlyProjection({
      month,
      year,
      monthsAhead,
      expenseReductionPercentage,
      extraDebtPayment,
      monthlySaving,
    });
  }
}
