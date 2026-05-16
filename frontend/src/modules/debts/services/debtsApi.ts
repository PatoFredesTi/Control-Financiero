import { api } from '../../../services/api';
import type { CreateDebtInput, Debt, DebtFilters, UpdateDebtInput } from '../types/debt';
import type { Expense } from '../../expenses/types/expense';

function buildDebtParams(filters?: DebtFilters) {
  const params = new URLSearchParams();

  if (filters?.status) params.set('status', filters.status);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  return params;
}

export async function getDebts(filters?: DebtFilters) {
  const response = await api.get<Debt[]>('/debts', {
    params: buildDebtParams(filters),
  });
  return response.data;
}

export async function createDebt(input: CreateDebtInput) {
  const response = await api.post<Debt>('/debts', input);
  return response.data;
}

export async function updateDebt(id: string, input: UpdateDebtInput) {
  const response = await api.patch<Debt>(`/debts/${id}`, input);
  return response.data;
}

export async function getDebtPayments(id: string) {
  const response = await api.get<Expense[]>(`/debts/${id}/payments`);
  return response.data;
}

export async function deleteDebt(id: string) {
  const response = await api.delete<{ message: string }>(`/debts/${id}`);
  return response.data;
}
