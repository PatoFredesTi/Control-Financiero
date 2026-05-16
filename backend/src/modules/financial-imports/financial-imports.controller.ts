import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CommitImportBatchDto } from './dto/commit-import-batch.dto';
import { CreateImportPreviewDto } from './dto/create-import-preview.dto';
import { UpdateImportedMovementDto } from './dto/update-imported-movement.dto';
import { FinancialImportsService } from './financial-imports.service';

@Controller('financial-imports')
export class FinancialImportsController {
  constructor(private readonly financialImportsService: FinancialImportsService) {}

  @Post('preview')
  createPreview(@Body() createImportPreviewDto: CreateImportPreviewDto) {
    return this.financialImportsService.createPreview(createImportPreviewDto);
  }

  @Get('templates')
  getTemplates() {
    return this.financialImportsService.getTemplates();
  }

  @Get('batches')
  findBatches() {
    return this.financialImportsService.findBatches();
  }

  @Get('batches/:id')
  findBatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.financialImportsService.findBatch(id);
  }

  @Patch('movements/:id')
  updateMovement(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateImportedMovementDto: UpdateImportedMovementDto,
  ) {
    return this.financialImportsService.updateMovement(id, updateImportedMovementDto);
  }

  @Post('movements/:id/ignore')
  ignoreMovement(@Param('id', ParseUUIDPipe) id: string) {
    return this.financialImportsService.ignoreMovement(id);
  }

  @Post('batches/:id/commit')
  commitBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() commitImportBatchDto: CommitImportBatchDto,
  ) {
    return this.financialImportsService.commitBatch(id, commitImportBatchDto);
  }
}
