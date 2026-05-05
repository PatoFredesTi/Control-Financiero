import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  CreditCard,
  Gauge,
  Landmark,
  Scale,
} from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { RecentMovements } from '../components/RecentMovements';
import { FinanceCharts } from '../components/FinanceCharts';
import { getDashboardCharts, getDashboardSummary } from '../services/dashboardApi';
import { formatCurrency } from '../../../utils/formatCurrency';

const monthFormatter = new Intl.DateTimeFormat('es-CL', {
  month: 'long',
  year: 'numeric',
});

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const chartsQuery = useQuery({
    queryKey: ['dashboard-charts'],
    queryFn: getDashboardCharts,
  });

  const summary = summaryQuery.data;
  const charts = chartsQuery.data;
  const currentPeriod = summary
    ? monthFormatter.format(new Date(summary.period.monthStart))
    : 'mes actual';

  const balanceTone =
    (summary?.totals.balanceThisMonth ?? 0) >= 0 ? 'emerald' : 'rose';

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <Gauge size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v0.7 — Gráficos financieros
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Dashboard financiero
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Resumen de ingresos, gastos, balance mensual y deuda pendiente con gráficos
            comparativos para entender mejor tu comportamiento financiero.
          </p>
        </header>

        {summaryQuery.isLoading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            Cargando resumen financiero...
          </div>
        )}

        {summaryQuery.isError && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
            No se pudo cargar el dashboard. Revisa que el backend esté activo.
          </div>
        )}

        {summary && (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title={`Ingresos de ${currentPeriod}`}
                value={formatCurrency(summary.totals.totalIncomeThisMonth)}
                description="Total de ingresos registrados durante el mes actual."
                icon={TrendingUp}
                tone="emerald"
              />
              <SummaryCard
                title={`Gastos de ${currentPeriod}`}
                value={formatCurrency(summary.totals.totalExpenseThisMonth)}
                description="Incluye gastos comunes y pagos de deuda registrados este mes."
                icon={TrendingDown}
                tone="rose"
              />
              <SummaryCard
                title="Balance mensual"
                value={formatCurrency(summary.totals.balanceThisMonth)}
                description="Resultado de ingresos menos gastos del mes actual."
                icon={Scale}
                tone={balanceTone}
              />
              <SummaryCard
                title="Deuda pendiente total"
                value={formatCurrency(summary.totals.totalDebtPending)}
                description="Suma de todos los saldos pendientes registrados en deudas."
                icon={CreditCard}
                tone="amber"
              />
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Gastos comunes del mes"
                value={formatCurrency(summary.totals.totalCommonExpensesThisMonth)}
                description="Salidas de dinero no asociadas a pagos de deuda."
                icon={Landmark}
                tone="slate"
              />
              <SummaryCard
                title="Pagos de deuda del mes"
                value={formatCurrency(summary.totals.totalDebtPaymentsThisMonth)}
                description="Monto destinado este mes a reducir saldos pendientes."
                icon={CreditCard}
                tone="sky"
              />
              <SummaryCard
                title="Avance de deudas"
                value={`${summary.totals.debtProgressPercentage}%`}
                description={`${formatCurrency(summary.totals.totalDebtPaid)} pagados de ${formatCurrency(summary.totals.totalDebtInitial)}.`}
                icon={Gauge}
                tone="emerald"
              />
              <SummaryCard
                title="Registros totales"
                value={`${summary.counts.incomes + summary.counts.expenses}`}
                description={`${summary.counts.incomes} ingresos, ${summary.counts.expenses} gastos y ${summary.counts.debts} deudas.`}
                icon={CalendarDays}
                tone="slate"
              />
            </div>

            <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Progreso global de deudas</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Vista rápida del total pagado frente al monto inicial de todas las deudas.
                  </p>
                </div>
                <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">
                  {summary.counts.activeDebts} activas · {summary.counts.paidDebts} pagadas
                </div>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.min(summary.totals.debtProgressPercentage, 100)}%` }}
                />
              </div>
            </div>

            {chartsQuery.isLoading && (
              <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Cargando gráficos financieros...
              </div>
            )}

            {chartsQuery.isError && (
              <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-amber-100">
                El resumen cargó correctamente, pero no se pudieron cargar los gráficos.
              </div>
            )}

            {charts && <FinanceCharts charts={charts} />}

            <RecentMovements movements={summary.recentMovements} />
          </>
        )}
      </section>
    </main>
  );
}
