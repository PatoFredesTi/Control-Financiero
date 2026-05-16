import { api } from '../../../services/api';
import type { Budget, CreateBudgetInput } from '../types/budget';

export async function getBudgets(): Promise<Budget[]> {
  const { data } = await api.get<Budget[]>('/budgets');
  return data;
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const { data } = await api.post<Budget>('/budgets', input);
  return data;
}

export async function updateBudget(id: string, input: CreateBudgetInput): Promise<Budget> {
  const { data } = await api.patch<Budget>(`/budgets/${id}`, input);
  return data;
}

export async function deleteBudget(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}
