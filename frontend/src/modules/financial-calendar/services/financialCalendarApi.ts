import { api } from '../../../services/api';
import type { FinancialCalendarResponse } from '../types/financialCalendar';

export async function getFinancialCalendar(month: number, year: number) {
  const response = await api.get<FinancialCalendarResponse>('/financial-calendar/monthly', {
    params: { month, year },
  });
  return response.data;
}
