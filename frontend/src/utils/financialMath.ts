export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function calculateBalance(income: number, expenses: number): number {
  return income - expenses;
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.max(0, Math.round(((income - expenses) / income) * 100));
}

export function getFinancialStatusVariant(value: number, warningLimit: number, dangerLimit: number) {
  if (value >= dangerLimit) return 'danger';
  if (value >= warningLimit) return 'warning';
  return 'safe';
}
