import { api } from '../../../services/api';
import type { FinancialAnalyticsAdvanced } from '../types/financialAnalytics';

export type FinancialAnalyticsParams = {
  months: number;
  smallExpenseThreshold: number;
};

export async function getFinancialAnalytics(params: FinancialAnalyticsParams): Promise<FinancialAnalyticsAdvanced> {
  const { data } = await api.get<FinancialAnalyticsAdvanced>('/financial-analytics/advanced', { params });
  return data;
}
