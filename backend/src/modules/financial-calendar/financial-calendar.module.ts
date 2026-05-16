import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialCalendarController } from './financial-calendar.controller';
import { FinancialCalendarService } from './financial-calendar.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialCalendarController],
  providers: [FinancialCalendarService],
})
export class FinancialCalendarModule {}
