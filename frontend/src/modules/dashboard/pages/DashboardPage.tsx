import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BrainCircuit,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  FileSpreadsheet,
  Gauge,
  Goal,
  Landmark,
  PiggyBank,
  ReceiptText,
  Repeat2,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { SummaryCard } from '../components/SummaryCard';
import { RecentMovements } from '../components/RecentMovements';
import { FinanceCharts } from '../components/FinanceCharts';
import { getDashboardCharts, getDashboardSummary } from '../services/dashboardApi';
import { formatCurrency } from '../../../utils/formatCurrency';

const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

const primaryActions = [
  { title: 'Agregar ingreso', description: 'Registra sueldo, venta, bono o cualquier entrada de dinero.', href: '/incomes', icon: CircleDollarSign, tone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  { title: 'Agregar gasto', description: 'Carga compras, pagos comunes o salidas de dinero del día.', href: '/expenses', icon: ReceiptText, tone: 'border-rose-500/40 bg-rose-500/10 text-rose-300' },
  { title: 'Crear deuda', description: 'Agrega una deuda y controla su saldo pendiente.', href: '/debts', icon: CreditCard, tone: 'border-amber-500/40 bg-amber-500/10 text-amber-200' },
  { title: 'Crear meta o ahorro', description: 'Define objetivos y registra aportes a tus metas.', href: '/savings-goals', icon: Goal, tone: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
];

const secondaryActions = [
  { title: 'Presupuestos', href: '/budgets', icon: PiggyBank },
  { title: 'Tarjetas', href: '/credit-cards', icon: CreditCard },
  { title: 'Recurrentes', href: '/recurring-movements', icon: Repeat2 },
  { title: 'Importar CSV', href: '/financial-imports', icon: FileSpreadsheet },
  { title: 'Calendario', href: '/financial-calendar', icon: CalendarDays },
  { title: 'Proyecciones', href: '/financial-projections', icon: BrainCircuit },
  { title: 'Analítica', href: '/financial-analytics', icon: BarChart3 },
  { title: 'Alertas', href: '/notifications', icon: BellRing },
  { title: 'Asistente', href: '/financial-assistant', icon: BrainCircuit },
];

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ['dashboard-summary'], queryFn: getDashboardSummary });
  const chartsQuery = useQuery({ queryKey: ['dashboard-charts'], queryFn: getDashboardCharts });

  const summary = summaryQuery.data;
  const charts = chartsQuery.data;
  const currentPeriod = summary ? monthFormatter.format(new Date(summary.period.monthStart)) : 'mes actual';
  const balanceTone = (summary?.totals.balanceThisMonth ?? 0) >= 0 ? 'emerald' : 'rose';

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <header className="mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Gauge size={30} /></div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v3.1 — Centro de control</p>
              <h1 className="text-4xl font-black tracking-tight md:text-5xl">Dashboard financiero</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">Gestiona tus ingresos, gastos, deudas, presupuestos, metas, tarjetas y reportes desde un solo lugar.</p>
            </div>
            <aside className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Acceso rápido</p>
              <h2 className="mt-2 text-2xl font-bold text-white">¿Qué quieres hacer ahora?</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-50/80">Usa estos accesos para registrar movimientos sin perderte en la navegación.</p>
            </aside>
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">Acciones principales</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Registra lo más importante</h2>
            </div>
            <Link to="/quick-add" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">
              Ver acción rápida <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {primaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href} className={`group rounded-3xl border p-5 shadow-xl transition hover:-translate-y-1 ${action.tone}`}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/40"><Icon size={26} /></div>
                  <h3 className="text-xl font-bold text-white">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{action.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white/90">Ir ahora <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl sm:p-6">
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Navegación del sistema</p>
            <h2 className="text-2xl font-bold text-white">Todos los módulos</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {secondaryActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href} className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 text-sm font-bold text-slate-200 transition hover:border-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-200">
                  <span className="flex items-center gap-3"><Icon size={18} className="text-emerald-300" /> {action.title}</span>
                  <ArrowRight size={15} className="text-slate-500 transition group-hover:translate-x-1 group-hover:text-emerald-300" />
                </Link>
              );
            })}
          </div>
        </section>

        {summaryQuery.isLoading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Cargando resumen financiero...</div>}
        {summaryQuery.isError && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">No se pudo cargar el dashboard. Revisa que el backend esté activo.</div>}

        {summary && (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title={`Ingresos de ${currentPeriod}`} value={formatCurrency(summary.totals.totalIncomeThisMonth)} description="Total de ingresos registrados durante el mes actual." icon={TrendingUp} tone="emerald" />
              <SummaryCard title={`Gastos de ${currentPeriod}`} value={formatCurrency(summary.totals.totalExpenseThisMonth)} description="Incluye gastos comunes y pagos de deuda registrados este mes." icon={TrendingDown} tone="rose" />
              <SummaryCard title="Balance mensual" value={formatCurrency(summary.totals.balanceThisMonth)} description="Resultado de ingresos menos gastos del mes actual." icon={Scale} tone={balanceTone} />
              <SummaryCard title="Deuda pendiente total" value={formatCurrency(summary.totals.totalDebtPending)} description="Suma de todos los saldos pendientes registrados en deudas." icon={CreditCard} tone="amber" />
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard title="Presupuesto mensual" value={formatCurrency(summary.budgets.totalBudgeted)} description={`${formatCurrency(summary.budgets.totalSpent)} gastados · ${summary.budgets.exceededBudgets} excedidos.`} icon={PiggyBank} tone={summary.budgets.exceededBudgets > 0 ? 'rose' : 'emerald'} />
              <SummaryCard title="Metas de ahorro" value={formatCurrency(summary.savingsGoals.totalSaved)} description={`${summary.savingsGoals.progressPercentage}% de ${formatCurrency(summary.savingsGoals.totalTarget)}.`} icon={Goal} tone="emerald" />
              <SummaryCard title="Gastos comunes del mes" value={formatCurrency(summary.totals.totalCommonExpensesThisMonth)} description="Salidas de dinero no asociadas a pagos de deuda." icon={Landmark} tone="slate" />
              <SummaryCard title="Pagos de deuda del mes" value={formatCurrency(summary.totals.totalDebtPaymentsThisMonth)} description="Monto destinado este mes a reducir saldos pendientes." icon={CreditCard} tone="sky" />
            </div>

            <div className="mb-8 grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div><h2 className="text-2xl font-bold">Progreso global de deudas</h2><p className="mt-1 text-sm text-slate-400">Total pagado frente al monto inicial de todas las deudas.</p></div>
                  <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">{summary.counts.activeDebts} activas · {summary.counts.paidDebts} pagadas</div>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.min(summary.totals.debtProgressPercentage, 100)}%` }} /></div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div><h2 className="text-2xl font-bold">Progreso de metas</h2><p className="mt-1 text-sm text-slate-400">Ahorro acumulado frente al objetivo total registrado.</p></div>
                  <div className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300">{summary.savingsGoals.activeGoals} activas · {summary.savingsGoals.completedGoals} completadas</div>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.min(summary.savingsGoals.progressPercentage, 100)}%` }} /></div>
              </div>
            </div>

            {chartsQuery.isLoading && <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Cargando gráficos financieros...</div>}
            {chartsQuery.isError && <div className="mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-amber-100">El resumen cargó correctamente, pero no se pudieron cargar los gráficos.</div>}
            {charts && <FinanceCharts charts={charts} />}
            <RecentMovements movements={summary.recentMovements} />
          </>
        )}
      </section>
    </main>
  );
}
