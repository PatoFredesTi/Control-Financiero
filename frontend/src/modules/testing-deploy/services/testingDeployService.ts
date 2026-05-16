import { api } from '../../../services/api';
import { unwrapApiResponse } from '../../../utils/apiResponse';

export interface ReadinessArea {
  area: string;
  status: string;
  command: string;
}

export interface TestingDeployReadiness {
  version: string;
  score: number;
  areas: ReadinessArea[];
  recommendation: string;
}

export interface CiChecklist {
  backend: string[];
  frontend: string[];
  database: string[];
  qualityGates: string[];
}

export interface DeployTargets {
  simple: Record<string, string>;
  aws: Record<string, string>;
}

export async function getTestingDeployReadiness() {
  const response = await api.get('/testing-deploy/readiness');
  return unwrapApiResponse<TestingDeployReadiness>(response.data);
}

export async function getCiChecklist() {
  const response = await api.get('/testing-deploy/ci-checklist');
  return unwrapApiResponse<CiChecklist>(response.data);
}

export async function getDeployTargets() {
  const response = await api.get('/testing-deploy/deploy-targets');
  return unwrapApiResponse<DeployTargets>(response.data);
}
