import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialAssistantController } from './financial-assistant.controller';
import { FinancialAssistantService } from './financial-assistant.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialAssistantController],
  providers: [FinancialAssistantService],
})
export class FinancialAssistantModule {}
