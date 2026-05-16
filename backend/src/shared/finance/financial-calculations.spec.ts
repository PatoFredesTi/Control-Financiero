import {
  calculateBalance,
  calculateDebtProgress,
  calculateDebtRatio,
  calculateSavingsRate,
  normalizeAmount,
  sumAmounts,
} from './financial-calculations';

describe('financial-calculations', () => {
  it('suma montos correctamente', () => {
    expect(sumAmounts([{ amount: 1000 }, { amount: 2500 }])).toBe(3500);
  });

  it('calcula balance', () => {
    expect(calculateBalance(500000, 320000)).toBe(180000);
  });

  it('calcula tasa de ahorro sin valores negativos', () => {
    expect(calculateSavingsRate(1000000, 800000)).toBe(20);
    expect(calculateSavingsRate(1000000, 1200000)).toBe(0);
  });

  it('calcula progreso de deuda', () => {
    expect(calculateDebtProgress(100000, 40000)).toBe(40);
  });

  it('calcula ratio de deuda', () => {
    expect(calculateDebtRatio(200000, 1000000)).toBe(20);
  });

  it('normaliza montos ingresados como texto', () => {
    expect(normalizeAmount('$120.000')).toBe(120000);
    expect(normalizeAmount('45.500')).toBe(45500);
  });
});
