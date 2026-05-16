import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, BadgeAlert, BrainCircuit, CreditCard, Flame, Gauge, PiggyBank, Repeat2, Search, TrendingUp, WalletCards } from 'lucide-react';
import { ChartCard } from '../../dashboard/components/ChartCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getFinancialAnalytics } from '../services/financialAnalyticsApi';
import type { FinancialRecommendation } from '../types/financialAnalytics';

const tooltipFormatter = (value?: number | string | readonly (number | string)[]) => {
  if (Array.isArray(value)) return value.map((item) => formatCurrency(Number(item))).join(' - ');
  if (value === undefined || value === null) return formatCurrency(0);
  return formatCurrency(Number(value));
};

const recommendationTone: Record<FinancialRecommendation['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
};

const priorityLabel: Record<FinancialRecommendation['priority'], string> = {
  HIGH: 'Alta',
  MEDIUM: 'Media',
  LOW: 'Baja',
};

function percent(value: number) {
  return `${value}%`;
}

export function FinancialAnalyticsPage() {
  const [months, setMonths] = useState(6);
  const [smallExpenseThreshold, setSmallExpenseThreshold] = useState(10000);

  const analyticsQuery = useQuery({
    queryKey: ['financial-analytics', months, smallExpenseThreshold],
    queryFn: () => getFinancialAnalytics({ months, smallExpenseThreshold }),
  });

  const analytics = analyticsQuery.data;

  const ratioData = useMemo(() => {
    if (!analytics) return [];
    return [
      { name: 'Ahorro', value: analytics.ratios.savingsRate },
      { name: 'Gasto/ingreso', value: analytics.ratios.expenseToIncomeRatio },
      { name: 'Pago deuda', value: analytics.ratios.debtPaymentToIncomeRatio },
      { name: 'Fijos', value: analytics.ratios.fixedCommitmentRatio },
      { name: 'Uso crédito', value: analytics.ratios.creditUtilizationRatio },
      { name: 'Presupuesto', value: analytics.ratios.budgetUsageRatio },
    ];
  }, [analytics]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al inicio</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><BrainCircuit size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v2.4 — Analítica financiera avanzada</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Analítica financiera avanzada</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Detecta tendencias, gastos hormiga, presión de recurrentes, suscripciones, uso de crédito, salud de deuda y recomendaciones priorizadas.</p>
        </header>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <Search className="text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold">Parámetros de análisis</h2>
              <p className="text-sm text-slate-400">Ajusta el período y el umbral para identificar gastos hormiga.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Meses a analizar</span>
              <input type="number" min={3} max={24} value={months} onChange={(event) => setMonths(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Umbral gasto hormiga</span>
              <input type="number" min={1000} step={1000} value={smallExpenseThreshold} onChange={(event) => setSmallExpenseThreshold(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
          </div>
        </section>

        {analyticsQuery.isLoading ? <p className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">Calculando analítica avanzada...</p> : null}
        {analyticsQuery.isError ? <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-100">No se pudo cargar la analítica. Revisa que el backend esté activo.</p> : null}

        {analytics ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Score financiero" value={`${analytics.score.value}/100`} tone={analytics.score.value >= 70 ? 'success' : analytics.score.value >= 45 ? 'warning' : 'danger'} helper={analytics.score.label} />
              <StatCard label="Tasa de ahorro" value={percent(analytics.ratios.savingsRate)} tone={analytics.ratios.savingsRate >= 10 ? 'success' : 'warning'} helper="Balance / ingresos" />
              <StatCard label="Uso de crédito" value={percent(analytics.creditAnalysis.utilizationPercentage)} tone={analytics.creditAnalysis.utilizationPercentage > 60 ? 'danger' : analytics.creditAnalysis.utilizationPercentage > 35 ? 'warning' : 'success'} helper={`${formatCurrency(analytics.creditAnalysis.totalUsed)} utilizados`} />
              <StatCard label="Gastos hormiga" value={formatCurrency(analytics.smallExpenses.totalAmount)} tone={analytics.smallExpenses.totalAmount > 50000 ? 'warning' : 'default'} helper={`${analytics.smallExpenses.count} movimientos detectados`} />
            </div>

            <div className="mb-8 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <ChartCard title="Evolución mensual" description="Ingresos, gastos y balance durante el período analizado.">
                {analytics.monthlyOverview.some((item) => item.income > 0 || item.expense > 0) ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.monthlyOverview}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                        <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="income" name="Ingresos" stroke="#34d399" strokeWidth={3} />
                        <Line type="monotone" dataKey="expense" name="Gastos" stroke="#fb7185" strokeWidth={3} />
                        <Line type="monotone" dataKey="balance" name="Balance" stroke="#60a5fa" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyState title="Sin datos suficientes" description="Registra ingresos y gastos para construir tendencias." />}
              </ChartCard>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <Gauge className="text-emerald-300" />
                  <div>
                    <h2 className="text-xl font-bold">Lectura del score</h2>
                    <p className="text-sm text-slate-400">{analytics.score.description}</p>
                  </div>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${analytics.score.value}%` }} /></div>
                <p className="mt-4 text-2xl font-bold">{analytics.score.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">El puntaje combina ahorro, gasto relativo, deuda, compromisos fijos, presupuesto y tarjetas de crédito.</p>
              </section>
            </div>

            <div className="mb-8 grid gap-5 xl:grid-cols-2">
              <ChartCard title="Ratios clave" description="Porcentajes principales para entender presión financiera.">
                {ratioData.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ratioData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => `${value}%`} contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                        <Bar dataKey="value" name="Ratio" fill="#38bdf8" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyState title="Sin ratios" description="Agrega datos para calcular ratios." />}
              </ChartCard>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold">Recomendaciones priorizadas</h2>
                <div className="space-y-3">
                  {analytics.recommendations.map((recommendation) => (
                    <article key={`${recommendation.priority}-${recommendation.title}`} className={`rounded-2xl border p-4 ${recommendationTone[recommendation.type]}`}>
                      <div className="mb-2 inline-flex rounded-full border border-current/30 px-3 py-1 text-xs font-semibold">Prioridad {priorityLabel[recommendation.priority]}</div>
                      <h3 className="font-bold">{recommendation.title}</h3>
                      <p className="mt-1 text-sm leading-6 opacity-80">{recommendation.description}</p>
                      <p className="mt-2 text-sm font-semibold">Acción: {recommendation.action}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Compromisos fijos" value={formatCurrency(analytics.recurringPressure.recurringOutflow)} tone={analytics.recurringPressure.pressureRatio > 50 ? 'warning' : 'default'} helper={`${analytics.recurringPressure.pressureRatio}% del ingreso estimado`} />
              <StatCard label="Suscripciones" value={formatCurrency(analytics.subscriptionAnalysis.estimatedMonthlyAmount)} tone="default" helper={`${analytics.subscriptionAnalysis.count} posibles servicios`} />
              <StatCard label="Deuda pendiente" value={formatCurrency(analytics.debtAnalysis.totalPending)} tone="warning" helper={`${analytics.debtAnalysis.pendingToMonthlyIncomeRatio}% del ingreso mensual promedio`} />
              <StatCard label="Cuotas pendientes" value={formatCurrency(analytics.creditAnalysis.upcomingInstallmentsAmount)} tone="warning" helper={`${analytics.creditAnalysis.upcomingCommitments.length} compromisos futuros`} />
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><TrendingUp className="text-emerald-300" /><h2 className="text-xl font-bold">Categorías al alza</h2></div>
                <div className="space-y-3">
                  {analytics.categoryTrends.slice(0, 6).map((trend) => (
                    <article key={trend.category} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{trend.category}</h3><span className={trend.changeVsAverage > 20 ? 'text-amber-300' : trend.changeVsAverage < -20 ? 'text-emerald-300' : 'text-slate-300'}>{trend.changeVsAverage}% vs promedio</span></div>
                      <p className="mt-1 text-sm text-slate-400">Actual: {formatCurrency(trend.currentAmount)} · Promedio: {formatCurrency(trend.averageAmount)}</p>
                    </article>
                  ))}
                  {analytics.categoryTrends.length === 0 ? <EmptyState title="Sin categorías" description="No hay gastos categorizados en el período." /> : null}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><Flame className="text-amber-300" /><h2 className="text-xl font-bold">Gastos hormiga</h2></div>
                <div className="space-y-3">
                  {analytics.smallExpenses.byCategory.slice(0, 6).map((item) => (
                    <article key={item.category} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{item.category}</h3><span className="text-amber-300">{formatCurrency(item.amount)}</span></div>
                      <p className="mt-1 text-sm text-slate-400">{item.count} movimientos pequeños</p>
                    </article>
                  ))}
                  {analytics.smallExpenses.byCategory.length === 0 ? <EmptyState title="Sin gastos hormiga" description="No se encontraron movimientos bajo el umbral configurado." /> : null}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><CreditCard className="text-sky-300" /><h2 className="text-xl font-bold">Deudas y crédito</h2></div>
                <div className="space-y-3">
                  {analytics.debtAnalysis.highestDebts.slice(0, 5).map((debt) => (
                    <article key={debt.name} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{debt.name}</h3><span className="text-rose-300">{formatCurrency(debt.pendingAmount)}</span></div>
                      <p className="mt-1 text-sm text-slate-400">Avance: {debt.progressPercentage}%</p>
                    </article>
                  ))}
                  {analytics.debtAnalysis.highestDebts.length === 0 ? <EmptyState title="Sin deudas activas" description="No hay deudas pendientes en el análisis." /> : null}
                </div>
              </section>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-3">
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><Repeat2 className="text-sky-300" /><h2 className="text-xl font-bold">Recurrentes más altos</h2></div>
                <div className="space-y-3">
                  {analytics.recurringPressure.topRecurringOutflows.slice(0, 6).map((item) => (
                    <article key={`${item.description}-${item.frequency}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{item.description}</h3><span className="text-rose-300">{formatCurrency(item.monthlyAmount)}</span></div>
                      <p className="mt-1 text-sm text-slate-400">{item.category} · {item.frequency}</p>
                    </article>
                  ))}
                  {analytics.recurringPressure.topRecurringOutflows.length === 0 ? <EmptyState title="Sin recurrentes" description="No hay gastos recurrentes activos." /> : null}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><WalletCards className="text-sky-300" /><h2 className="text-xl font-bold">Suscripciones posibles</h2></div>
                <div className="space-y-3">
                  {analytics.subscriptionAnalysis.items.slice(0, 6).map((item) => (
                    <article key={`${item.source}-${item.description}-${item.monthlyAmount}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{item.description}</h3><span className="text-amber-300">{formatCurrency(item.monthlyAmount)}</span></div>
                      <p className="mt-1 text-sm text-slate-400">{item.category} · {item.source}</p>
                    </article>
                  ))}
                  {analytics.subscriptionAnalysis.items.length === 0 ? <EmptyState title="Sin suscripciones" description="No se detectaron servicios recurrentes por palabras clave." /> : null}
                </div>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-2"><PiggyBank className="text-emerald-300" /><h2 className="text-xl font-bold">Metas en riesgo</h2></div>
                <div className="space-y-3">
                  {analytics.savingsAnalysis.goalsAtRisk.slice(0, 6).map((goal) => (
                    <article key={goal.name} className={`rounded-2xl border p-4 ${goal.isAtRisk ? 'border-amber-500/30 bg-amber-500/10' : 'border-slate-800 bg-slate-950/60'}`}>
                      <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{goal.name}</h3><span className="text-emerald-300">{formatCurrency(goal.monthlyRequired)}/mes</span></div>
                      <p className="mt-1 text-sm text-slate-400">Pendiente: {formatCurrency(goal.remainingAmount)}</p>
                    </article>
                  ))}
                  {analytics.savingsAnalysis.goalsAtRisk.length === 0 ? <EmptyState title="Sin metas en riesgo" description="No hay metas con fecha objetivo configurada o todas van bien." /> : null}
                </div>
              </section>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
