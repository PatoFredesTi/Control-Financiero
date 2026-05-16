import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialProjectionsController } from './financial-projections.controller';
import { FinancialProjectionsService } from './financial-projections.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialProjectionsController],
  providers: [FinancialProjectionsService],
})
export class FinancialProjectionsModule {}
