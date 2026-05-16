export type RuleSeverity = 'POSITIVE' | 'INFO' | 'WARNING' | 'CRITICAL';
export type RuleArea = 'CASHFLOW' | 'DEBT' | 'BUDGET' | 'CREDIT' | 'GOALS' | 'HABITS';

export interface FinancialAssistantContext {
  month: number;
  year: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  commonExpenses: number;
  debtPayments: number;
  debtPending: number;
  debtPaid: number;
  activeDebts: number;
  exceededBudgets: number;
  nearLimitBudgets: number;
  activeGoals: number;
  completedGoals: number;
  goalsAtRisk: number;
  creditUsed: number;
  creditLimit: number;
  upcomingInstallments: number;
  recurringOutflow: number;
  previousMonthExpenses: number;
}

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

function percentage(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export const financialRuleCatalog = [
  { id: 'cashflow-negative', area: 'CASHFLOW', description: 'Detecta cuando los gastos superan los ingresos del mes.' },
  { id: 'savings-rate-low', area: 'CASHFLOW', description: 'Evalúa si la tasa de ahorro mensual está bajo niveles recomendados.' },
  { id: 'debt-pressure-high', area: 'DEBT', description: 'Evalúa si los pagos de deuda consumen demasiado ingreso mensual.' },
  { id: 'debt-without-progress', area: 'DEBT', description: 'Detecta deudas activas sin avance relevante.' },
  { id: 'budget-exceeded', area: 'BUDGET', description: 'Detecta presupuestos mensuales excedidos.' },
  { id: 'budget-near-limit', area: 'BUDGET', description: 'Detecta presupuestos cercanos al límite.' },
  { id: 'credit-utilization-high', area: 'CREDIT', description: 'Evalúa uso alto del cupo de tarjetas de crédito.' },
  { id: 'installments-pressure', area: 'CREDIT', description: 'Advierte compromisos futuros por cuotas.' },
  { id: 'goals-at-risk', area: 'GOALS', description: 'Detecta metas de ahorro atrasadas o en riesgo.' },
  { id: 'expense-growth', area: 'HABITS', description: 'Detecta aumento relevante de gastos frente al mes anterior.' },
] as const;

export class FinancialRulesEngine {
  evaluate(context: FinancialAssistantContext): FinancialRuleResult[] {
    const rules: FinancialRuleResult[] = [];
    const savingsRate = percentage(context.monthlyIncome - context.monthlyExpenses, context.monthlyIncome);
    const debtPaymentRatio = percentage(context.debtPayments, context.monthlyIncome);
    const creditUtilization = percentage(context.creditUsed, context.creditLimit);
    const fixedPressure = percentage(context.recurringOutflow, context.monthlyIncome);
    const expenseGrowth = context.previousMonthExpenses > 0
      ? Math.round(((context.monthlyExpenses - context.previousMonthExpenses) / context.previousMonthExpenses) * 100)
      : 0;

    if (context.monthlyIncome <= 0) {
      rules.push({
        id: 'cashflow-no-income', area: 'CASHFLOW', severity: 'WARNING', impactScore: 82,
        title: 'No hay ingresos registrados este mes',
        description: 'Sin ingresos cargados, el diagnóstico financiero puede quedar incompleto.',
        recommendation: 'Registra tu sueldo, ingresos freelance u otras entradas antes de tomar decisiones.',
      });
    }

    if (context.monthlyIncome > 0 && context.monthlyExpenses > context.monthlyIncome) {
      rules.push({
        id: 'cashflow-negative', area: 'CASHFLOW', severity: 'CRITICAL', impactScore: 100,
        title: 'Tus gastos superan tus ingresos',
        description: `El balance mensual está negativo por ${context.monthlyExpenses - context.monthlyIncome}.`,
        recommendation: 'Reduce gastos variables y evita nuevas cuotas hasta recuperar balance positivo.',
      });
    } else if (savingsRate >= 20) {
      rules.push({
        id: 'cashflow-healthy', area: 'CASHFLOW', severity: 'POSITIVE', impactScore: 55,
        title: 'Tu tasa de ahorro es saludable',
        description: `La tasa estimada de ahorro es ${savingsRate}%.`,
        recommendation: 'Mantén este ritmo y considera asignar parte del excedente a metas o pago anticipado de deuda.',
      });
    } else if (context.monthlyIncome > 0 && savingsRate < 10) {
      rules.push({
        id: 'savings-rate-low', area: 'CASHFLOW', severity: 'WARNING', impactScore: 78,
        title: 'Tu margen de ahorro es bajo',
        description: `La tasa de ahorro estimada es ${savingsRate}%.`,
        recommendation: 'Busca liberar al menos un 5% adicional reduciendo gastos hormiga o recurrentes no esenciales.',
      });
    }

    if (debtPaymentRatio >= 30) {
      rules.push({
        id: 'debt-pressure-high', area: 'DEBT', severity: 'CRITICAL', impactScore: 92,
        title: 'Alta presión mensual por deudas',
        description: `Los pagos de deuda representan cerca del ${debtPaymentRatio}% de tus ingresos.`,
        recommendation: 'Evita nuevas deudas y prioriza un plan de pago ordenado para bajar esta presión.',
      });
    } else if (context.activeDebts > 0 && context.debtPayments <= 0) {
      rules.push({
        id: 'debt-without-progress', area: 'DEBT', severity: 'WARNING', impactScore: 74,
        title: 'Tienes deudas activas sin pagos registrados',
        description: 'No se detectaron pagos de deuda durante el mes actual.',
        recommendation: 'Agenda un pago mínimo o crea un recurrente para mantener avance visible.',
      });
    }

    if (context.exceededBudgets > 0) {
      rules.push({
        id: 'budget-exceeded', area: 'BUDGET', severity: 'CRITICAL', impactScore: 88,
        title: 'Hay presupuestos excedidos',
        description: `${context.exceededBudgets} presupuesto(s) superaron el límite mensual.`,
        recommendation: 'Congela gastos de esas categorías hasta el siguiente ciclo o ajusta el presupuesto con criterio realista.',
      });
    } else if (context.nearLimitBudgets > 0) {
      rules.push({
        id: 'budget-near-limit', area: 'BUDGET', severity: 'WARNING', impactScore: 66,
        title: 'Hay presupuestos cerca del límite',
        description: `${context.nearLimitBudgets} categoría(s) están cerca de agotarse.`,
        recommendation: 'Revisa esas categorías antes de hacer nuevas compras variables.',
      });
    }

    if (creditUtilization >= 70) {
      rules.push({
        id: 'credit-utilization-high', area: 'CREDIT', severity: 'CRITICAL', impactScore: 90,
        title: 'Uso alto de tarjeta de crédito',
        description: `El uso estimado del cupo llega al ${creditUtilization}%.`,
        recommendation: 'Evita nuevas compras en cuotas y prioriza liberar cupo este mes.',
      });
    }

    if (context.upcomingInstallments > 0) {
      rules.push({
        id: 'installments-pressure', area: 'CREDIT', severity: context.upcomingInstallments > context.monthlyIncome * 0.15 ? 'WARNING' : 'INFO', impactScore: 52,
        title: 'Tienes cuotas futuras comprometidas',
        description: `Las cuotas próximas suman ${context.upcomingInstallments}.`,
        recommendation: 'Incluye estas cuotas en tu calendario financiero antes de asumir nuevos compromisos.',
      });
    }

    if (context.goalsAtRisk > 0) {
      rules.push({
        id: 'goals-at-risk', area: 'GOALS', severity: 'WARNING', impactScore: 70,
        title: 'Hay metas de ahorro en riesgo',
        description: `${context.goalsAtRisk} meta(s) podrían no alcanzarse a tiempo.`,
        recommendation: 'Reduce el objetivo temporalmente o programa aportes recurrentes más pequeños pero constantes.',
      });
    } else if (context.completedGoals > 0) {
      rules.push({
        id: 'goals-progress', area: 'GOALS', severity: 'POSITIVE', impactScore: 42,
        title: 'Tienes metas completadas',
        description: `${context.completedGoals} meta(s) ya fueron completadas.`,
        recommendation: 'Crea una nueva meta o mueve el excedente a fondo de emergencia.',
      });
    }

    if (fixedPressure >= 50) {
      rules.push({
        id: 'fixed-pressure-high', area: 'HABITS', severity: 'WARNING', impactScore: 75,
        title: 'Tus compromisos recurrentes son altos',
        description: `Los recurrentes consumen cerca del ${fixedPressure}% de tus ingresos mensuales.`,
        recommendation: 'Revisa suscripciones, servicios y cuotas para bajar rigidez financiera.',
      });
    }

    if (expenseGrowth >= 20) {
      rules.push({
        id: 'expense-growth', area: 'HABITS', severity: 'WARNING', impactScore: 68,
        title: 'Tus gastos crecieron frente al mes anterior',
        description: `El gasto total subió aproximadamente ${expenseGrowth}%.`,
        recommendation: 'Revisa las categorías con mayor aumento antes de cerrar el mes.',
      });
    }

    return rules.sort((a, b) => b.impactScore - a.impactScore);
  }

  calculateScore(context: FinancialAssistantContext, rules: FinancialRuleResult[]) {
    let score = 78;
    for (const rule of rules) {
      if (rule.severity === 'CRITICAL') score -= Math.round(rule.impactScore / 9);
      if (rule.severity === 'WARNING') score -= Math.round(rule.impactScore / 14);
      if (rule.severity === 'POSITIVE') score += Math.round(rule.impactScore / 12);
    }

    if (context.monthlyIncome > 0 && context.monthlyExpenses < context.monthlyIncome) score += 4;
    if (context.activeGoals > 0) score += 3;
    if (context.activeDebts === 0) score += 5;

    const normalizedScore = clamp(score);
    const level = normalizedScore >= 85 ? 'Excelente' : normalizedScore >= 70 ? 'Bueno' : normalizedScore >= 50 ? 'En observación' : 'Crítico';
    return { score: normalizedScore, level };
  }

  buildActionPlan(rules: FinancialRuleResult[]): ActionPlanItem[] {
    return rules
      .filter((rule) => rule.severity !== 'POSITIVE')
      .slice(0, 6)
      .map((rule, index) => ({
        id: `action-${rule.id}`,
        priority: index < 2 ? 'HIGH' : index < 4 ? 'MEDIUM' : 'LOW',
        area: rule.area,
        title: rule.title,
        description: rule.recommendation,
        expectedImpact: rule.severity === 'CRITICAL' ? 'Alto impacto en estabilidad mensual.' : 'Mejora gradual del control financiero.',
        status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
      }));
  }
}
