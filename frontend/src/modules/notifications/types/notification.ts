export type NotificationSeverity = 'SUCCESS' | 'INFO' | 'WARNING' | 'CRITICAL';
export type NotificationCategory = 'BALANCE' | 'BUDGET' | 'DEBT' | 'RECURRING' | 'GOAL' | 'IMPORT' | 'SYSTEM';

export type FinancialNotification = {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  sourceType: string;
  sourceId?: string;
  amount?: number;
  dueDate?: string;
  createdAt: string;
  action?: {
    label: string;
    href: string;
  };
};

export type NotificationsSummary = {
  total: number;
  critical: number;
  warning: number;
  info: number;
  success: number;
  requiresAttention: number;
  estimatedUnread: number;
  healthLabel: string;
  topPriority: FinancialNotification | null;
  categories: Array<{
    category: NotificationCategory;
    count: number;
  }>;
};

export type NotificationCenterResponse = {
  period: {
    month: number;
    year: number;
    daysAhead: number;
    startDate: string;
    endDate: string;
    reminderStartDate: string;
    reminderEndDate: string;
  };
  summary: NotificationsSummary;
  notifications: FinancialNotification[];
  generatedAt: string;
};

export type NotificationCenterFilters = {
  month?: number;
  year?: number;
  daysAhead?: number;
  severity?: NotificationSeverity | '';
  category?: NotificationCategory | '';
};
