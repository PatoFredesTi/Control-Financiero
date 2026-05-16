import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DebtsModule } from './modules/debts/debts.module';
import { IncomesModule } from './modules/incomes/incomes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { SavingsGoalsModule } from './modules/savings-goals/savings-goals.module';
import { RecurringMovementsModule } from './modules/recurring-movements/recurring-movements.module';
import { FinancialCalendarModule } from './modules/financial-calendar/financial-calendar.module';
import { FinancialProjectionsModule } from './modules/financial-projections/financial-projections.module';
import { SystemReadinessModule } from './modules/system-readiness/system-readiness.module';
import { FinancialImportsModule } from './modules/financial-imports/financial-imports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { FinancialAnalyticsModule } from './modules/financial-analytics/financial-analytics.module';
import { SaasModule } from './modules/saas/saas.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { FinancialAssistantModule } from './modules/financial-assistant/financial-assistant.module';
import { SecurityModule } from './modules/security/security.module';
import { TestingDeployModule } from './modules/testing-deploy/testing-deploy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    DebtsModule,
    IncomesModule,
    ExpensesModule,
    DashboardModule,
    BudgetsModule,
    SavingsGoalsModule,
    RecurringMovementsModule,
    FinancialCalendarModule,
    FinancialProjectionsModule,
    SystemReadinessModule,
    FinancialImportsModule,
    NotificationsModule,
    CreditCardsModule,
    FinancialAnalyticsModule,
    SaasModule,
    AuditLogsModule,
    FinancialAssistantModule,
    SecurityModule,
    TestingDeployModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
