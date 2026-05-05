import { api } from '../../../services/api';
import type { CreateExpenseInput, Expense } from '../types/expense';

export async function getExpenses() {
  const response = await api.get<Expense[]>('/expenses');
  return response.data;
}

export async function createExpense(input: CreateExpenseInput) {
  const response = await api.post<Expense>('/expenses', input);
  return response.data;
}

export async function deleteExpense(id: string) {
  const response = await api.delete<{ message: string }>(`/expenses/${id}`);
  return response.data;
}
