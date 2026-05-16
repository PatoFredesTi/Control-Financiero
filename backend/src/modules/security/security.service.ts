import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type SimulatedFlow = 'PASSWORD_RECOVERY' | 'EMAIL_VERIFICATION' | 'DATA_EXPORT' | 'ACCOUNT_DELETION';

@Injectable()
export class SecurityService {
  constructor(private readonly prisma: PrismaService) {}

  getHardeningReport() {
    return {
      version: '2.9.0',
      status: 'production-candidate',
      implemented: [
        'Global ValidationPipe con whitelist y forbidNonWhitelisted',
        'Filtro global de errores estandarizado',
        'Headers básicos de seguridad en main.ts',
        'CORS configurable por FRONTEND_URL',
        'Rate limiting en memoria opcional por ENABLE_IN_MEMORY_RATE_LIMIT',
        'Audit logs persistentes para flujos sensibles',
        'Flujos simulados para recuperación, verificación, exportación y eliminación de cuenta',
      ],
      pendingForRealProduction: [
        'Refresh tokens persistentes con tabla de sesiones',
        'Envío real de correos transaccionales',
        'Rate limiting distribuido con Redis o API Gateway',
        'Rotación de secretos',
        'WAF/CDN y monitoreo centralizado',
      ],
      environmentVariables: [
        'FRONTEND_URL',
        'ENABLE_IN_MEMORY_RATE_LIMIT',
        'RATE_LIMIT_WINDOW_MS',
        'RATE_LIMIT_MAX_REQUESTS',
        'JWT_SECRET',
        'REFRESH_TOKEN_SECRET',
      ],
    };
  }

  getSessionPolicy() {
    return {
      accessTokenTtlMinutes: 15,
      refreshTokenTtlDays: 7,
      refreshTokenRotation: true,
      revokeOnPasswordChange: true,
      maxFailedLoginAttempts: 5,
      lockoutMinutes: 15,
      note: 'Política objetivo documentada para v2.9. Los flujos de auth reales pueden integrarse sobre esta base.',
    };
  }

  async registerSimulatedFlow(flow: SimulatedFlow, email: string, metadata?: Record<string, unknown>) {
    const token = this.createDemoToken(flow, email);

    await this.prisma.auditLog.create({
      data: {
        action: flow,
        entity: 'SecurityFlow',
        entityId: email,
        actor: email,
        severity: flow === 'ACCOUNT_DELETION' ? 'HIGH' : 'MEDIUM',
        metadata: JSON.stringify({ tokenPreview: token.slice(0, 8), ...metadata }),
      },
    });

    return {
      email,
      flow,
      token,
      simulated: true,
      message: 'Flujo registrado en modo demo. En producción se enviaría un correo transaccional con este token.',
    };
  }

  async confirmSimulatedFlow(flow: SimulatedFlow, email: string, token: string, metadata?: Record<string, unknown>) {
    const expectedToken = this.createDemoToken(flow, email);
    const valid = token === expectedToken;

    await this.prisma.auditLog.create({
      data: {
        action: `${flow}_CONFIRM`,
        entity: 'SecurityFlow',
        entityId: email,
        actor: email,
        severity: valid ? 'MEDIUM' : 'HIGH',
        metadata: JSON.stringify({ valid, ...metadata }),
      },
    });

    return {
      email,
      flow,
      valid,
      simulated: true,
      message: valid
        ? 'Token válido en modo demo.'
        : 'Token inválido. En producción este intento debería incrementar métricas de seguridad.',
    };
  }

  getDataExportPreview(email: string) {
    return {
      email,
      generatedAt: new Date().toISOString(),
      simulated: true,
      sections: [
        'profile',
        'incomes',
        'expenses',
        'debts',
        'budgets',
        'savingsGoals',
        'creditCards',
        'imports',
        'auditLogs',
      ],
      note: 'Preview de exportación. En producción se filtraría por userId y se entregaría un archivo JSON/ZIP.',
    };
  }

  private createDemoToken(flow: SimulatedFlow, email: string) {
    return Buffer.from(`${flow}:${email}:v2.9`).toString('base64url').slice(0, 32);
  }
}
