import { api } from '../../../services/api';
import type { DashboardCharts, DashboardSummary } from '../types/dashboard';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>('/dashboard/summary');
  return data;
}

export async function getDashboardCharts(): Promise<DashboardCharts> {
  const { data } = await api.get<DashboardCharts>('/dashboard/charts');
  return data;
}
