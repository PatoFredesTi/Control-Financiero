import { api } from '../../../services/api';
import { AuditLogItem, AuditSummaryResponse, LegalPackResponse, ProductionChecklistResponse, SaasPlansResponse, SecurityReadinessResponse } from '../types/saas';

export async function getSaasPlans() {
  const { data } = await api.get<SaasPlansResponse>('/saas/plans');
  return data;
}

export async function getSecurityReadiness() {
  const { data } = await api.get<SecurityReadinessResponse>('/saas/security-readiness');
  return data;
}

export async function getProductionChecklist() {
  const { data } = await api.get<ProductionChecklistResponse>('/saas/production-checklist');
  return data;
}

export async function getLegalPack() {
  const { data } = await api.get<LegalPackResponse>('/saas/legal-pack');
  return data;
}

export async function getAuditSummary() {
  const { data } = await api.get<AuditSummaryResponse>('/audit-logs/summary');
  return data;
}

export async function getAuditLogs() {
  const { data } = await api.get<AuditLogItem[]>('/audit-logs?limit=25');
  return data;
}
