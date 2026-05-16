export type RuleSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';
export type RuleArea = 'CASHFLOW' | 'DEBT' | 'BUDGET' | 'CREDIT' | 'GOALS' | 'HABITS';

export interface FinancialRuleResult {
  id: string;
  area: RuleArea;
  severity: RuleSeverity;
  title: string;
  description: string;
  recommendation: string;
  impactScore: number;
}

export interface ActionPlanItem {
  id: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  area: RuleArea;
  title: string;
  description: string;
  expectedImpact: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'AT_RISK';
}

export interface MonthlyBriefing {
  period: { month: number; year: number };
  score: { score: number; level: string };
  headline: string;
  context: Record<string, number>;
  ratios: {
    savingsRate: number;
    debtPaymentRatio: number;
    expenseToIncomeRatio: number;
    creditUtilization: number;
  };
  rules: FinancialRuleResult[];
  topRisks: FinancialRuleResult[];
  opportunities: FinancialRuleResult[];
  actionPlan: ActionPlanItem[];
}
