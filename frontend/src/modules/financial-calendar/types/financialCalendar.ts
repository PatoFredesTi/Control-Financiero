export type CalendarEventDirection = 'IN' | 'OUT' | 'NEUTRAL';

export type CalendarEventSourceType =
  | 'INCOME'
  | 'EXPENSE'
  | 'DEBT_PAYMENT'
  | 'RECURRING_INCOME'
  | 'RECURRING_EXPENSE'
  | 'RECURRING_DEBT_PAYMENT'
  | 'DEBT_DUE'
  | 'GOAL_TARGET';

export interface CalendarEvent {
  id: string;
  sourceId: string;
  sourceType: CalendarEventSourceType;
  title: string;
  amount: number;
  date: string;
  category?: string | null;
  status?: string | null;
  direction: CalendarEventDirection;
}

export interface CalendarDay {
  date: string;
  day: number;
  events: CalendarEvent[];
  incomeAmount: number;
  outcomeAmount: number;
  netAmount: number;
}

export interface FinancialCalendarSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expectedRecurringIncome: number;
  expectedRecurringExpenses: number;
  projectedBalance: number;
  eventsCount: number;
  criticalDays: number;
}

export interface FinancialCalendarResponse {
  month: number;
  year: number;
  range: {
    startDate: string;
    endDate: string;
  };
  summary: FinancialCalendarSummary;
  days: CalendarDay[];
  events: CalendarEvent[];
}
