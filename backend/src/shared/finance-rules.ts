export type FinancialSeverity = 'positive' | 'warning' | 'critical' | 'info';

export interface HealthScoreInput {
  monthlyIncome: number;
  monthlyExpense: number;
  debtPending: number;
  debtPaid: number;
  exceededBudgets: number;
  activeGoals: number;
  completedGoals: number;
}

export interface HealthScoreResult {
  score: number;
  level: 'Excelente' | 'Bueno' | 'En observación' | 'Crítico';
  reasons: string[];
}

export function calculateSavingsRate(income: number, expenses: number): number {
  if (income <= 0) {
    return 0;
  }

  return Math.round(((income - expenses) / income) * 100);
}

export function calculateDebtProgress(paidAmount: number, pendingAmount: number): number {
  const total = paidAmount + pendingAmount;

  if (total <= 0) {
    return 0;
  }

  return Math.round((paidAmount / total) * 100);
}

export function calculateFinancialHealthScore(input: HealthScoreInput): HealthScoreResult {
  const reasons: string[] = [];
  let score = 70;

  const savingsRate = calculateSavingsRate(input.monthlyIncome, input.monthlyExpense);
  const debtProgress = calculateDebtProgress(input.debtPaid, input.debtPending);

  if (input.monthlyIncome <= 0) {
    score -= 20;
    reasons.push('No hay ingresos registrados en el mes.');
  }

  if (input.monthlyExpense > input.monthlyIncome && input.monthlyIncome > 0) {
    score -= 25;
    reasons.push('Los gastos del mes superan los ingresos registrados.');
  }

  if (savingsRate >= 20) {
    score += 15;
    reasons.push('La tasa de ahorro mensual es saludable.');
  } else if (savingsRate < 0) {
    score -= 15;
    reasons.push('La tasa de ahorro mensual es negativa.');
  }

  if (input.exceededBudgets > 0) {
    score -= Math.min(20, input.exceededBudgets * 5);
    reasons.push('Hay presupuestos mensuales excedidos.');
  }

  if (input.debtPending > 0 && debtProgress < 15) {
    score -= 10;
    reasons.push('El avance global de pago de deudas todavía es bajo.');
  }

  if (input.completedGoals > 0) {
    score += 5;
    reasons.push('Existen metas de ahorro completadas.');
  }

  if (input.activeGoals > 0) {
    score += 5;
    reasons.push('Hay metas de ahorro activas, lo que mejora la planificación.');
  }

  const normalizedScore = Math.max(0, Math.min(100, score));

  if (normalizedScore >= 85) {
    return { score: normalizedScore, level: 'Excelente', reasons };
  }

  if (normalizedScore >= 70) {
    return { score: normalizedScore, level: 'Bueno', reasons };
  }

  if (normalizedScore >= 45) {
    return { score: normalizedScore, level: 'En observación', reasons };
  }

  return { score: normalizedScore, level: 'Crítico', reasons };
}
