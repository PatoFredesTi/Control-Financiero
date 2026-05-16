import { Controller, Get } from '@nestjs/common';
import { SystemReadinessService } from './system-readiness.service';

@Controller('system')
export class SystemReadinessController {
  constructor(private readonly systemReadinessService: SystemReadinessService) {}

  @Get('status')
  getStatus() {
    return this.systemReadinessService.getStatus();
  }

  @Get('launch-checklist')
  getLaunchChecklist() {
    return this.systemReadinessService.getLaunchChecklist();
  }

  @Get('quality-report')
  getQualityReport() {
    return this.systemReadinessService.getQualityReport();
  }
}
