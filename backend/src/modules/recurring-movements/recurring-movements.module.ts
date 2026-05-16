import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { RecurringMovementsController } from './recurring-movements.controller';
import { RecurringMovementsService } from './recurring-movements.service';

@Module({
  imports: [PrismaModule, ExpensesModule],
  controllers: [RecurringMovementsController],
  providers: [RecurringMovementsService],
  exports: [RecurringMovementsService],
})
export class RecurringMovementsModule {}
