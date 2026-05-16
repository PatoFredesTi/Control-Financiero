export interface SaasPlan {
  id: string;
  name: string;
  price: number;
  recommended: boolean;
  description: string;
  features: string[];
  limits: string[];
}

export interface SaasPlansResponse {
  currency: string;
  billingNote: string;
  plans: SaasPlan[];
}

export interface SecurityReadinessResponse {
  version: string;
  score: number;
  status: string;
  implemented: string[];
  recommendedBeforeRealUsers: string[];
}

export interface ProductionChecklistResponse {
  version: string;
  groups: Array<{
    title: string;
    items: Array<{ label: string; done: boolean }>;
  }>;
}

export interface LegalPackResponse {
  disclaimer: string;
  termsSummary: string[];
  privacySummary: string[];
  dataRetention: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  actor: string;
  severity: string;
  metadata?: string;
  createdAt: string;
}

export interface AuditSummaryResponse {
  total: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recent: AuditLogItem[];
  recommendation: string;
}
