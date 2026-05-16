import { api } from '../../../services/api';

export interface ProductStatusResponse {
  app: string;
  version: string;
  status: string;
  releaseFocus?: string;
  completedCapabilities: string[];
  recommendedProductionStack: {
    frontend: string[];
    backend: string[];
    database: string[];
  };
}

export interface LaunchChecklistResponse {
  version: string;
  checklist: Array<{ item: string; done: boolean }>;
}

export interface QualityReportResponse {
  version: string;
  qualityFocus: string;
  backend: {
    improvements: string[];
    nextHardening: string[];
  };
  frontend: {
    improvements: string[];
    nextHardening: string[];
  };
  riskLevel: string;
  recommendation: string;
}

export async function getProductStatus() {
  const { data } = await api.get<ProductStatusResponse>('/system/status');
  return data;
}

export async function getLaunchChecklist() {
  const { data } = await api.get<LaunchChecklistResponse>('/system/launch-checklist');
  return data;
}

export async function getQualityReport() {
  const { data } = await api.get<QualityReportResponse>('/system/quality-report');
  return data;
}
