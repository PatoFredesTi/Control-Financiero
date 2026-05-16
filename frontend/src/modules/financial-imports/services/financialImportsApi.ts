import { api } from '../../../services/api';
import type { CommitImportResult, CreateImportPreviewInput, ImportBatch, UpdateImportedMovementInput } from '../types/financialImport';

export async function createImportPreview(input: CreateImportPreviewInput) {
  const response = await api.post<ImportBatch>('/financial-imports/preview', input);
  return response.data;
}

export async function getImportBatches() {
  const response = await api.get<ImportBatch[]>('/financial-imports/batches');
  return response.data;
}

export async function getImportBatch(id: string) {
  const response = await api.get<ImportBatch>(`/financial-imports/batches/${id}`);
  return response.data;
}

export async function updateImportedMovement(id: string, input: UpdateImportedMovementInput) {
  const response = await api.patch(`/financial-imports/movements/${id}`, input);
  return response.data;
}

export async function ignoreImportedMovement(id: string) {
  const response = await api.post(`/financial-imports/movements/${id}/ignore`);
  return response.data;
}

export async function commitImportBatch(id: string, movementIds?: string[]) {
  const response = await api.post<CommitImportResult>(`/financial-imports/batches/${id}/commit`, { movementIds });
  return response.data;
}

export async function getImportTemplates() {
  const response = await api.get('/financial-imports/templates');
  return response.data;
}
