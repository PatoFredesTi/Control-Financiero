import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { FinancialImportsController } from './financial-imports.controller';
import { FinancialImportsService } from './financial-imports.service';

@Module({
  imports: [PrismaModule, ExpensesModule],
  controllers: [FinancialImportsController],
  providers: [FinancialImportsService],
})
export class FinancialImportsModule {}
