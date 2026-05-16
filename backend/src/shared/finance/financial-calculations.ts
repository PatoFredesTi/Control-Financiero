export function sumAmounts(items: Array<{ amount: number }>): number {
  return items.reduce((total, item) => total + item.amount, 0);
}

export function calculateBalance(income: number, expenses: number): number {
  return income - expenses;
}

export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  const balance = calculateBalance(income, expenses);
  return Math.max(0, Math.round((balance / income) * 100));
}

export function calculateDebtProgress(initialAmount: number, paidAmount: number): number {
  return calculatePercentage(paidAmount, initialAmount);
}

export function calculateDebtRatio(debtPayments: number, income: number): number {
  return calculatePercentage(debtPayments, income);
}

export function clampAmount(amount: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  return Math.min(Math.max(amount, min), max);
}

export function normalizeAmount(value: number | string): number {
  if (typeof value === 'number') return Math.round(value);

  const sanitized = value
    .replace(/\s/g, '')
    .replace(/\$/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(sanitized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}
