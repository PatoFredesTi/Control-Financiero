import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@Query('limit') limit?: string, @Query('severity') severity?: string) {
    return this.auditLogsService.findAll({ limit: limit ? Number(limit) : 50, severity });
  }

  @Get('summary')
  getSummary() {
    return this.auditLogsService.getSummary();
  }

  @Post()
  create(@Body() dto: CreateAuditLogDto) {
    return this.auditLogsService.create(dto);
  }
}
