import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft, BrainCircuit, Calculator, CreditCard, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { ChartCard } from '../../dashboard/components/ChartCard';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getFinancialProjection } from '../services/financialProjectionsApi';
import type { ProjectionRecommendation } from '../types/financialProjection';

const recommendationTone: Record<ProjectionRecommendation['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
};

const tooltipFormatter = (value?: number | string | readonly (number | string)[]) => {
  if (Array.isArray(value)) return value.map((item) => formatCurrency(Number(item))).join(' - ');
  if (value === undefined || value === null) return formatCurrency(0);
  return formatCurrency(Number(value));
};

export function FinancialProjectionsPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [monthsAhead, setMonthsAhead] = useState(6);
  const [expenseReductionPercentage, setExpenseReductionPercentage] = useState(10);
  const [extraDebtPayment, setExtraDebtPayment] = useState(0);
  const [monthlySaving, setMonthlySaving] = useState(0);

  const projectionQuery = useQuery({
    queryKey: ['financial-projections', month, year, monthsAhead, expenseReductionPercentage, extraDebtPayment, monthlySaving],
    queryFn: () => getFinancialProjection({ month, year, monthsAhead, expenseReductionPercentage, extraDebtPayment, monthlySaving }),
  });

  const projection = projectionQuery.data;

  const comparisonData = useMemo(() => {
    if (!projection) return [];

    return projection.scenarios.baseline.monthly.map((baselineMonth, index) => ({
      label: baselineMonth.label,
      base: baselineMonth.cumulativeBalance,
      gastosReducidos: projection.scenarios.reducedExpenses.monthly[index]?.cumulativeBalance ?? 0,
      ahorro: projection.scenarios.savingsPlan.monthly[index]?.cumulativeBalanceAfterSaving ?? 0,
    }));
  }, [projection]);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al inicio</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><BrainCircuit size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v1.9 — Proyecciones y simulaciones</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Proyecciones financieras</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Simula escenarios futuros usando tus ingresos, gastos, deudas, presupuestos y movimientos recurrentes. Ajusta variables para ver cómo cambiaría tu balance, ahorro y deuda pendiente.</p>
        </header>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex items-center gap-3">
            <Calculator className="text-emerald-300" />
            <div>
              <h2 className="text-xl font-bold">Parámetros de simulación</h2>
              <p className="text-sm text-slate-400">Modifica los valores para recalcular automáticamente los escenarios.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Mes inicial</span>
              <input type="number" min={1} max={12} value={month} onChange={(event) => setMonth(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Año</span>
              <input type="number" min={2000} max={2100} value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Meses a proyectar</span>
              <input type="number" min={1} max={24} value={monthsAhead} onChange={(event) => setMonthsAhead(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Reducir gastos %</span>
              <input type="number" min={0} max={100} value={expenseReductionPercentage} onChange={(event) => setExpenseReductionPercentage(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Pago extra deuda</span>
              <input type="number" min={0} value={extraDebtPayment} onChange={(event) => setExtraDebtPayment(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Ahorro mensual</span>
              <input type="number" min={0} value={monthlySaving} onChange={(event) => setMonthlySaving(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-500" />
            </label>
          </div>
        </section>

        {projectionQuery.isLoading ? <p className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">Calculando proyecciones...</p> : null}

        {projection ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Ingreso base mensual" value={formatCurrency(projection.assumptions.baseMonthlyIncome)} tone="success" helper="Promedio histórico o recurrentes" />
              <StatCard label="Gasto base mensual" value={formatCurrency(projection.assumptions.baseMonthlyExpenses)} tone="danger" helper="Promedio histórico o recurrentes" />
              <StatCard label="Balance base acumulado" value={formatCurrency(projection.scenarios.baseline.finalBalance)} tone={projection.scenarios.baseline.finalBalance >= 0 ? 'success' : 'danger'} />
              <StatCard label="Deuda al final" value={formatCurrency(projection.scenarios.acceleratedDebtPayment.totalDebtAfter)} tone={projection.scenarios.acceleratedDebtPayment.totalDebtAfter > 0 ? 'warning' : 'success'} helper="Según pagos simulados" />
            </div>

            <div className="mb-8 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <ChartCard title="Comparación de escenarios" description="Compara el balance acumulado del escenario base contra reducción de gastos y plan de ahorro.">
                {comparisonData.length ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                        <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                        <Line type="monotone" dataKey="base" name="Base" stroke="#38bdf8" strokeWidth={3} />
                        <Line type="monotone" dataKey="gastosReducidos" name="Gastos reducidos" stroke="#34d399" strokeWidth={3} />
                        <Line type="monotone" dataKey="ahorro" name="Después de ahorro" stroke="#fbbf24" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyState title="Sin datos para proyectar" description="Agrega ingresos, gastos o recurrentes para generar una simulación." />}
              </ChartCard>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <h2 className="mb-4 text-xl font-bold">Lectura inteligente</h2>
                <div className="space-y-3">
                  {projection.recommendations.map((recommendation) => (
                    <article key={`${recommendation.title}-${recommendation.type}`} className={`rounded-2xl border p-4 ${recommendationTone[recommendation.type]}`}>
                      <h3 className="font-bold">{recommendation.title}</h3>
                      <p className="mt-1 text-sm leading-6 opacity-80">{recommendation.description}</p>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="mb-8 grid gap-5 xl:grid-cols-2">
              <ChartCard title="Ingresos, gastos y balance base" description="Proyección mensual considerando el escenario base.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projection.scenarios.baseline.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                      <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                      <Bar dataKey="projectedIncome" name="Ingresos" fill="#34d399" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="projectedExpenses" name="Gastos" fill="#fb7185" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Reducción proyectada de deuda" description="Simula la deuda pendiente usando pagos promedio/recurrentes y el pago extra configurado.">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projection.scenarios.acceleratedDebtPayment.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                      <Tooltip formatter={tooltipFormatter} contentStyle={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }} />
                      <Area type="monotone" dataKey="remainingDebt" name="Deuda pendiente" stroke="#f97316" fill="#f97316" fillOpacity={0.18} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><TrendingDown size={20} className="text-emerald-300" /> Reducir gastos</h2>
                <p className="text-sm leading-6 text-slate-400">Reducir {projection.scenarioInputs.expenseReductionPercentage}% de gastos comunes libera aproximadamente:</p>
                <p className="mt-3 text-3xl font-bold text-emerald-300">{formatCurrency(projection.scenarios.reducedExpenses.monthlySavingsImpact)}</p>
                <p className="mt-2 text-sm text-slate-500">Impacto acumulado al final: {formatCurrency(projection.scenarios.reducedExpenses.finalBalance)}</p>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><PiggyBank size={20} className="text-amber-300" /> Plan de ahorro</h2>
                <p className="text-sm leading-6 text-slate-400">Con el ahorro mensual configurado, acumularías:</p>
                <p className="mt-3 text-3xl font-bold text-amber-300">{formatCurrency(projection.scenarios.savingsPlan.projectedSavedAmount)}</p>
                <p className="mt-2 text-sm text-slate-500">Balance luego de separar ahorro: {formatCurrency(projection.scenarios.savingsPlan.finalBalanceAfterSaving)}</p>
              </section>

              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold"><CreditCard size={20} className="text-orange-300" /> Deudas</h2>
                <p className="text-sm leading-6 text-slate-400">Pago mensual usado en simulación:</p>
                <p className="mt-3 text-3xl font-bold text-orange-300">{formatCurrency(projection.scenarios.acceleratedDebtPayment.monthlyPaymentCapacity)}</p>
                <p className="mt-2 text-sm text-slate-500">Deuda pagada en periodo: {formatCurrency(projection.scenarios.acceleratedDebtPayment.totalDebtPaidInProjection)}</p>
              </section>
            </div>

            <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
              <h2 className="mb-4 text-xl font-bold">Detalle de deudas simuladas</h2>
              {projection.scenarios.acceleratedDebtPayment.debts.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {projection.scenarios.acceleratedDebtPayment.debts.map((debt) => {
                    const progress = debt.initialPendingAmount > 0 ? Math.round((debt.projectedPaidAmount / debt.initialPendingAmount) * 100) : 0;
                    return (
                      <article key={debt.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="font-bold text-slate-100">{debt.name}</h3>
                          <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">{progress}%</span>
                        </div>
                        <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                        </div>
                        <p className="text-sm text-slate-400">Pendiente inicial: {formatCurrency(debt.initialPendingAmount)}</p>
                        <p className="text-sm text-slate-400">Pendiente proyectado: {formatCurrency(debt.projectedPendingAmount)}</p>
                        <p className="text-sm text-slate-400">Pagado proyectado: {formatCurrency(debt.projectedPaidAmount)}</p>
                        {debt.estimatedPaidInMonth ? <p className="mt-2 text-sm font-semibold text-emerald-300">Se pagaría en {debt.estimatedPaidInMonth}</p> : null}
                      </article>
                    );
                  })}
                </div>
              ) : <EmptyState title="Sin deudas activas" description="Cuando registres deudas activas, podrás simular pagos acelerados." />}
            </section>
          </>
        ) : null}

        {projectionQuery.isError ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100">No se pudo calcular la proyección. Revisa los parámetros ingresados.</p> : null}
      </section>
    </main>
  );
}
