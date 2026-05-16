import { calculateDebtProgress, calculateFinancialHealthScore, calculateSavingsRate } from './finance-rules';

describe('finance-rules', () => {
  it('calculates savings rate', () => {
    expect(calculateSavingsRate(1000000, 800000)).toBe(20);
  });

  it('returns zero savings rate when income is missing', () => {
    expect(calculateSavingsRate(0, 800000)).toBe(0);
  });

  it('calculates debt progress', () => {
    expect(calculateDebtProgress(250000, 750000)).toBe(25);
  });

  it('generates a valid financial score', () => {
    const result = calculateFinancialHealthScore({
      monthlyIncome: 1800000,
      monthlyExpense: 1300000,
      debtPending: 500000,
      debtPaid: 500000,
      exceededBudgets: 0,
      activeGoals: 1,
      completedGoals: 0,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.reasons.length).toBeGreaterThan(0);
  });
});
