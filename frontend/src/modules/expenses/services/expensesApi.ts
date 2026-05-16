import { api } from '../../../services/api';
import type { CreateExpenseInput, Expense, ExpenseFilters, UpdateExpenseInput } from '../types/expense';

function buildExpenseParams(filters?: ExpenseFilters) {
  const params = new URLSearchParams();

  if (filters?.category) params.set('category', filters.category);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);

  return params;
}

export async function getExpenses(filters?: ExpenseFilters) {
  const response = await api.get<Expense[]>('/expenses', {
    params: buildExpenseParams(filters),
  });
  return response.data;
}

export async function createExpense(input: CreateExpenseInput) {
  const response = await api.post<Expense>('/expenses', input);
  return response.data;
}

export async function updateExpense(id: string, input: UpdateExpenseInput) {
  const response = await api.patch<Expense>(`/expenses/${id}`, input);
  return response.data;
}

export async function deleteExpense(id: string) {
  const response = await api.delete<{ message: string }>(`/expenses/${id}`);
  return response.data;
}
