import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { RecurringMovementKind, RecurringStatus } from '@prisma/client';
import { CreateRecurringMovementDto } from './dto/create-recurring-movement.dto';
import { UpdateRecurringMovementDto } from './dto/update-recurring-movement.dto';
import { RecurringMovementsService } from './recurring-movements.service';

@Controller('recurring-movements')
export class RecurringMovementsController {
  constructor(private readonly recurringMovementsService: RecurringMovementsService) {}

  @Post()
  create(@Body() dto: CreateRecurringMovementDto) {
    return this.recurringMovementsService.create(dto);
  }

  @Get()
  findAll(@Query('kind') kind?: RecurringMovementKind, @Query('status') status?: RecurringStatus) {
    return this.recurringMovementsService.findAll({ kind, status });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringMovementsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRecurringMovementDto) {
    return this.recurringMovementsService.update(id, dto);
  }

  @Post(':id/generate')
  generate(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringMovementsService.generate(id);
  }

  @Post('generate-due')
  generateDue() {
    return this.recurringMovementsService.generateDue();
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringMovementsService.remove(id);
  }
}
