import { Injectable } from '@nestjs/common';
import { createSuccessResponse } from './shared';

@Injectable()
export class AppService {
  getHealth() {
    return createSuccessResponse({
      status: 'ok',
      app: 'Control Financiero Personal API',
      version: '2.6.0',
      focus: 'Refactor técnico, estabilidad y calidad base',
      modules: [
        'debts',
        'incomes',
        'expenses',
        'dashboard',
        'budgets',
        'savings-goals',
        'recurring-movements',
        'financial-calendar',
        'financial-projections',
        'financial-imports',
        'notifications',
        'credit-cards',
        'financial-analytics',
        'saas',
        'audit-logs',
        'system-readiness',
      ],
    });
  }
}
