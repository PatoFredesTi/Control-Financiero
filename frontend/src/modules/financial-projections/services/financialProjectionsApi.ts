import { api } from '../../../services/api';
import type { FinancialProjection } from '../types/financialProjection';

export type ProjectionFilters = {
  month: number;
  year: number;
  monthsAhead: number;
  expenseReductionPercentage: number;
  extraDebtPayment: number;
  monthlySaving: number;
};

export async function getFinancialProjection(filters: ProjectionFilters) {
  const response = await api.get<FinancialProjection>('/financial-projections/monthly', {
    params: filters,
  });

  return response.data;
}
