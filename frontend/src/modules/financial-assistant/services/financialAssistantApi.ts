import { api } from '../../../services/api';
import type { MonthlyBriefing } from '../types/financialAssistant';

export async function getMonthlyBriefing(month: number, year: number) {
  const response = await api.get<MonthlyBriefing>('/financial-assistant/monthly-briefing', { params: { month, year } });
  return response.data;
}

export async function getFinancialAssistantRules() {
  const response = await api.get('/financial-assistant/rules');
  return response.data;
}
