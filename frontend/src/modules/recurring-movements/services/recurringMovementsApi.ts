import { api } from '../../../services/api';
import type { CreateRecurringMovementInput, RecurringMovement, RecurringMovementKind, RecurringStatus, UpdateRecurringMovementInput } from '../types/recurringMovement';

export type RecurringMovementFilters = {
  kind?: RecurringMovementKind;
  status?: RecurringStatus;
};

export async function getRecurringMovements(filters?: RecurringMovementFilters) {
  const response = await api.get<RecurringMovement[]>('/recurring-movements', { params: filters });
  return response.data;
}

export async function createRecurringMovement(input: CreateRecurringMovementInput) {
  const response = await api.post<RecurringMovement>('/recurring-movements', input);
  return response.data;
}

export async function updateRecurringMovement(id: string, input: UpdateRecurringMovementInput) {
  const response = await api.patch<RecurringMovement>(`/recurring-movements/${id}`, input);
  return response.data;
}

export async function deleteRecurringMovement(id: string) {
  const response = await api.delete<{ message: string }>(`/recurring-movements/${id}`);
  return response.data;
}

export async function generateRecurringMovement(id: string) {
  const response = await api.post(`/recurring-movements/${id}/generate`);
  return response.data;
}

export async function generateDueRecurringMovements() {
  const response = await api.post('/recurring-movements/generate-due');
  return response.data;
}
