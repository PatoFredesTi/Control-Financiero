import { api } from '../../../services/api';
import type { CreateGoalContributionInput, CreateSavingsGoalInput, SavingsGoal } from '../types/savingsGoal';

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const { data } = await api.get<SavingsGoal[]>('/savings-goals');
  return data;
}

export async function createSavingsGoal(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
  const { data } = await api.post<SavingsGoal>('/savings-goals', input);
  return data;
}

export async function updateSavingsGoal(id: string, input: CreateSavingsGoalInput): Promise<SavingsGoal> {
  const { data } = await api.patch<SavingsGoal>(`/savings-goals/${id}`, input);
  return data;
}

export async function addGoalContribution(id: string, input: CreateGoalContributionInput): Promise<SavingsGoal> {
  const { data } = await api.post<SavingsGoal>(`/savings-goals/${id}/contributions`, input);
  return data;
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await api.delete(`/savings-goals/${id}`);
}
