import { api } from '../../../services/api';
import type { CreateDebtInput, Debt } from '../types/debt';

export async function getDebts() {
  const response = await api.get<Debt[]>('/debts');
  return response.data;
}

export async function createDebt(input: CreateDebtInput) {
  const response = await api.post<Debt>('/debts', input);
  return response.data;
}

export async function deleteDebt(id: string) {
  const response = await api.delete<{ message: string }>(`/debts/${id}`);
  return response.data;
}
