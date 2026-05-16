import { Body, Controller, Get, Post } from '@nestjs/common';
import { createSuccessResponse } from '../../shared/api/api-response';
import { SecurityService } from './security.service';
import {
  ConfirmEmailVerificationDto,
  ConfirmPasswordRecoveryDto,
  DataControlRequestDto,
  RequestEmailVerificationDto,
  RequestPasswordRecoveryDto,
} from './dto/security-flow.dto';

@Controller('security')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('hardening-report')
  getHardeningReport() {
    return createSuccessResponse(this.securityService.getHardeningReport());
  }

  @Get('session-policy')
  getSessionPolicy() {
    return createSuccessResponse(this.securityService.getSessionPolicy());
  }

  @Post('password-recovery/request')
  requestPasswordRecovery(@Body() dto: RequestPasswordRecoveryDto) {
    return this.securityService
      .registerSimulatedFlow('PASSWORD_RECOVERY', dto.email)
      .then((data) => createSuccessResponse(data));
  }

  @Post('password-recovery/confirm')
  confirmPasswordRecovery(@Body() dto: ConfirmPasswordRecoveryDto) {
    return this.securityService
      .confirmSimulatedFlow('PASSWORD_RECOVERY', dto.email, dto.token, { newPasswordLength: dto.newPassword.length })
      .then((data) => createSuccessResponse(data));
  }

  @Post('email-verification/request')
  requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.securityService
      .registerSimulatedFlow('EMAIL_VERIFICATION', dto.email)
      .then((data) => createSuccessResponse(data));
  }

  @Post('email-verification/confirm')
  confirmEmailVerification(@Body() dto: ConfirmEmailVerificationDto) {
    return this.securityService
      .confirmSimulatedFlow('EMAIL_VERIFICATION', dto.email, dto.token)
      .then((data) => createSuccessResponse(data));
  }

  @Post('user-data/export')
  requestDataExport(@Body() dto: DataControlRequestDto) {
    return this.securityService
      .registerSimulatedFlow('DATA_EXPORT', dto.email, { reason: dto.reason })
      .then(() => createSuccessResponse(this.securityService.getDataExportPreview(dto.email)));
  }

  @Post('user-data/delete-request')
  requestAccountDeletion(@Body() dto: DataControlRequestDto) {
    return this.securityService
      .registerSimulatedFlow('ACCOUNT_DELETION', dto.email, { reason: dto.reason })
      .then((data) => createSuccessResponse({ ...data, status: 'scheduled-for-review' }));
  }
}
