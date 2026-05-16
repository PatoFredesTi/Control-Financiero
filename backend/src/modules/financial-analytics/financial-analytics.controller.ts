import { Controller, Get, Query } from '@nestjs/common';
import { FinancialAnalyticsService } from './financial-analytics.service';

@Controller('financial-analytics')
export class FinancialAnalyticsController {
  constructor(private readonly financialAnalyticsService: FinancialAnalyticsService) {}

  @Get('advanced')
  getAdvancedAnalytics(@Query('months') months?: string, @Query('smallExpenseThreshold') smallExpenseThreshold?: string) {
    return this.financialAnalyticsService.getAdvancedAnalytics({
      months: months ? Number(months) : 6,
      smallExpenseThreshold: smallExpenseThreshold ? Number(smallExpenseThreshold) : 10000,
    });
  }

  @Get('ratios')
  getRatios(@Query('months') months?: string) {
    return this.financialAnalyticsService.getRatios({ months: months ? Number(months) : 6 });
  }
}
