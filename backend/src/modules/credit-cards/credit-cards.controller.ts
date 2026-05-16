import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { CreateInstallmentPurchaseDto } from './dto/create-installment-purchase.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreditCardsService } from './credit-cards.service';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post()
  create(@Body() dto: CreateCreditCardDto) {
    return this.creditCardsService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.creditCardsService.findAll(status);
  }

  @Get('summary')
  summary() {
    return this.creditCardsService.summary();
  }

  @Get('installments/upcoming')
  upcomingInstallments(
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: string,
  ) {
    return this.creditCardsService.upcomingInstallments({ month, year, status });
  }

  @Post('installments/:id/pay')
  payInstallment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayInstallmentDto,
  ) {
    return this.creditCardsService.payInstallment(id, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditCardsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCreditCardDto,
  ) {
    return this.creditCardsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditCardsService.remove(id);
  }

  @Post(':id/purchases')
  createPurchase(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Omit<CreateInstallmentPurchaseDto, 'creditCardId'>,
  ) {
    return this.creditCardsService.createInstallmentPurchase({ ...dto, creditCardId: id });
  }

  @Get(':id/purchases')
  findPurchases(@Param('id', ParseUUIDPipe) id: string) {
    return this.creditCardsService.findPurchases(id);
  }
}
