import { api } from '../../../services/api';
import type { CreateIncomeInput, Income } from '../types/income';

export async function getIncomes(): Promise<Income[]> {
  const { data } = await api.get<Income[]>('/incomes');
  return data;
}

export async function createIncome(input: CreateIncomeInput): Promise<Income> {
  const { data } = await api.post<Income>('/incomes', input);
  return data;
}

export async function deleteIncome(id: string): Promise<void> {
  await api.delete(`/incomes/${id}`);
}
