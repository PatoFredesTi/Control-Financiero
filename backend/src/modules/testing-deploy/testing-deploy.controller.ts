import { Controller, Get } from '@nestjs/common';
import { createSuccessResponse } from '../../shared/api/api-response';
import { TestingDeployService } from './testing-deploy.service';

@Controller('testing-deploy')
export class TestingDeployController {
  constructor(private readonly testingDeployService: TestingDeployService) {}

  @Get('readiness')
  getReadiness() {
    return createSuccessResponse(this.testingDeployService.getReadiness());
  }

  @Get('ci-checklist')
  getCiChecklist() {
    return createSuccessResponse(this.testingDeployService.getCiChecklist());
  }

  @Get('deploy-targets')
  getDeployTargets() {
    return createSuccessResponse(this.testingDeployService.getDeployTargets());
  }
}
