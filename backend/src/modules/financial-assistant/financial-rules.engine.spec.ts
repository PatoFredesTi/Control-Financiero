import { FinancialRulesEngine } from './financial-rules.engine';

describe('FinancialRulesEngine', () => {
  it('detects negative cashflow as critical', () => {
    const engine = new FinancialRulesEngine();
    const rules = engine.evaluate({
      month: 5,
      year: 2026,
      monthlyIncome: 1000000,
      monthlyExpenses: 1200000,
      commonExpenses: 900000,
      debtPayments: 300000,
      debtPending: 500000,
      debtPaid: 100000,
      activeDebts: 1,
      exceededBudgets: 0,
      nearLimitBudgets: 0,
      activeGoals: 0,
      completedGoals: 0,
      goalsAtRisk: 0,
      creditUsed: 0,
      creditLimit: 0,
      upcomingInstallments: 0,
      recurringOutflow: 0,
      previousMonthExpenses: 900000,
    });

    expect(rules.some((rule) => rule.id === 'cashflow-negative' && rule.severity === 'CRITICAL')).toBe(true);
  });
});
