import { api } from '../../../services/api';
import { unwrapApiResponse } from '../../../utils/apiResponse';

export interface HardeningReport {
  version: string;
  status: string;
  implemented: string[];
  pendingForRealProduction: string[];
  environmentVariables: string[];
}

export interface SessionPolicy {
  accessTokenTtlMinutes: number;
  refreshTokenTtlDays: number;
  refreshTokenRotation: boolean;
  revokeOnPasswordChange: boolean;
  maxFailedLoginAttempts: number;
  lockoutMinutes: number;
  note: string;
}

export async function getHardeningReport() {
  const response = await api.get('/security/hardening-report');
  return unwrapApiResponse<HardeningReport>(response.data);
}

export async function getSessionPolicy() {
  const response = await api.get('/security/session-policy');
  return unwrapApiResponse<SessionPolicy>(response.data);
}

export async function requestPasswordRecovery(email: string) {
  const response = await api.post('/security/password-recovery/request', { email });
  return unwrapApiResponse<{ token: string; message: string }>(response.data);
}

export async function requestDataExport(email: string) {
  const response = await api.post('/security/user-data/export', { email, reason: 'Demo v2.9' });
  return unwrapApiResponse<{ sections: string[]; note: string }>(response.data);
}
