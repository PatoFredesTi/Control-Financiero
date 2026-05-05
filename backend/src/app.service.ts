import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      app: 'Control Financiero Personal API',
      version: '0.2.0',
      modules: ['debts'],
    };
  }
}
