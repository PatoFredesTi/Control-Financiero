import { describe, expect, it } from 'vitest';
import { calculateBalance, calculatePercentage } from './financialMath';

describe('financialMath', () => {
  it('calculates balance', () => {
    expect(calculateBalance(100000, 30000)).toBe(70000);
  });

  it('calculates percentages safely', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(25, 0)).toBe(0);
  });
});
