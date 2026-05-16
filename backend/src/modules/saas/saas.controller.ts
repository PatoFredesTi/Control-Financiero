import { Controller, Get } from '@nestjs/common';
import { SaasService } from './saas.service';

@Controller('saas')
export class SaasController {
  constructor(private readonly saasService: SaasService) {}

  @Get('landing')
  getLanding() {
    return this.saasService.getLanding();
  }

  @Get('plans')
  getPlans() {
    return this.saasService.getPlans();
  }

  @Get('security-readiness')
  getSecurityReadiness() {
    return this.saasService.getSecurityReadiness();
  }

  @Get('production-checklist')
  getProductionChecklist() {
    return this.saasService.getProductionChecklist();
  }

  @Get('legal-pack')
  getLegalPack() {
    return this.saasService.getLegalPack();
  }
}
