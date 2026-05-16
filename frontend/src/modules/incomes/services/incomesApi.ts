import { api } from '../../../services/api';
import type { CreateIncomeInput, Income, IncomeFilters, UpdateIncomeInput } from '../types/income';

function buildIncomeParams(filters?: IncomeFilters) {
  const params = new URLSearchParams();

  if (filters?.category) params.set('category', filters.category);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  return params;
}

export async function getIncomes(filters?: IncomeFilters) {
  const response = await api.get<Income[]>('/incomes', {
    params: buildIncomeParams(filters),
  });
  return response.data;
}

export async function createIncome(input: CreateIncomeInput) {
  const response = await api.post<Income>('/incomes', input);
  return response.data;
}

export async function updateIncome(id: string, input: UpdateIncomeInput) {
  const response = await api.patch<Income>(`/incomes/${id}`, input);
  return response.data;
}

export async function deleteIncome(id: string) {
  const response = await api.delete<{ message: string }>(`/incomes/${id}`);
  return response.data;
}
