import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getFinancialCalendar } from '../services/financialCalendarApi';
import type { CalendarEvent, CalendarEventSourceType } from '../types/financialCalendar';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const eventLabels: Record<CalendarEventSourceType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  DEBT_PAYMENT: 'Pago deuda',
  RECURRING_INCOME: 'Ingreso recurrente',
  RECURRING_EXPENSE: 'Gasto recurrente',
  RECURRING_DEBT_PAYMENT: 'Pago recurrente',
  DEBT_DUE: 'Vencimiento deuda',
  GOAL_TARGET: 'Meta objetivo',
};

function getEventTone(event: CalendarEvent) {
  if (event.direction === 'IN') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200';
  if (event.direction === 'OUT') return 'border-rose-500/30 bg-rose-500/10 text-rose-200';
  return 'border-sky-500/30 bg-sky-500/10 text-sky-200';
}

function getCalendarOffset(year: number, month: number) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return firstDay === 0 ? 6 : firstDay - 1;
}

export function FinancialCalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const calendarQuery = useQuery({
    queryKey: ['financial-calendar', month, year],
    queryFn: () => getFinancialCalendar(month, year),
  });

  const calendar = calendarQuery.data;
  const offset = getCalendarOffset(year, month);

  const calendarSlots = useMemo(() => {
    const emptySlots = Array.from({ length: offset }, () => null);
    return [...emptySlots, ...(calendar?.days ?? [])];
  }, [calendar?.days, offset]);

  function moveMonth(direction: -1 | 1) {
    const next = new Date(Date.UTC(year, month - 1 + direction, 1));
    setMonth(next.getUTCMonth() + 1);
    setYear(next.getUTCFullYear());
  }

  const highestImpactEvents = [...(calendar?.events ?? [])]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><CalendarDays size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v1.8 — Calendario financiero</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Calendario financiero</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Visualiza ingresos, gastos, pagos de deuda, recurrentes próximos, vencimientos y metas en una sola línea de tiempo mensual.</p>
        </header>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button onClick={() => moveMonth(-1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-300"><ChevronLeft size={16} /> Mes anterior</button>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Periodo</p>
            <h2 className="text-2xl font-bold">{monthNames[month - 1]} {year}</h2>
          </div>
          <button onClick={() => moveMonth(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-emerald-500 hover:text-emerald-300">Mes siguiente <ChevronRight size={16} /></button>
        </div>

        {calendarQuery.isLoading ? <p className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-slate-400">Cargando calendario...</p> : null}

        {calendar ? (
          <>
            <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Ingresos reales" value={formatCurrency(calendar.summary.totalIncome)} tone="success" />
              <StatCard label="Gastos reales" value={formatCurrency(calendar.summary.totalExpenses)} tone="danger" />
              <StatCard label="Balance real" value={formatCurrency(calendar.summary.balance)} tone={calendar.summary.balance >= 0 ? 'success' : 'danger'} />
              <StatCard label="Balance proyectado" value={formatCurrency(calendar.summary.projectedBalance)} tone={calendar.summary.projectedBalance >= 0 ? 'success' : 'danger'} helper="Incluye recurrentes próximos" />
            </div>

            <div className="mb-8 grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                <div className="mb-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => <span key={day}>{day}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarSlots.map((day, index) => (
                    <div key={day?.date ?? `empty-${index}`} className="min-h-36 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                      {day ? (
                        <>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-bold text-slate-200">{day.day}</span>
                            {day.netAmount !== 0 ? <span className={day.netAmount >= 0 ? 'text-xs text-emerald-300' : 'text-xs text-rose-300'}>{formatCurrency(day.netAmount)}</span> : null}
                          </div>
                          <div className="space-y-2">
                            {day.events.slice(0, 3).map((event) => (
                              <div key={event.id} className={`rounded-xl border px-2 py-1 text-[11px] ${getEventTone(event)}`} title={event.title}>
                                <p className="truncate font-semibold">{event.title}</p>
                                <p className="opacity-80">{formatCurrency(event.amount)}</p>
                              </div>
                            ))}
                            {day.events.length > 3 ? <p className="text-xs text-slate-500">+{day.events.length - 3} evento(s)</p> : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-5">
                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold"><Clock size={20} className="text-emerald-300" /> Eventos de mayor impacto</h3>
                  {highestImpactEvents.length ? (
                    <div className="space-y-3">
                      {highestImpactEvents.map((event) => (
                        <article key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">{eventLabels[event.sourceType]}</span>
                            <span className={event.direction === 'IN' ? 'text-sm font-bold text-emerald-300' : event.direction === 'OUT' ? 'text-sm font-bold text-rose-300' : 'text-sm font-bold text-sky-300'}>{formatCurrency(event.amount)}</span>
                          </div>
                          <h4 className="font-semibold text-slate-100">{event.title}</h4>
                          <p className="mt-1 text-sm text-slate-500">{event.date}</p>
                        </article>
                      ))}
                    </div>
                  ) : <EmptyState title="Sin eventos relevantes" description="Cuando registres movimientos o recurrentes, aparecerán aquí." />}
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
                  <h3 className="mb-4 text-xl font-bold">Lectura rápida</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <p className="flex items-center gap-2"><TrendingUp size={16} className="text-emerald-300" /> Recurrentes de ingreso esperados: {formatCurrency(calendar.summary.expectedRecurringIncome)}</p>
                    <p className="flex items-center gap-2"><TrendingDown size={16} className="text-rose-300" /> Recurrentes de gasto esperados: {formatCurrency(calendar.summary.expectedRecurringExpenses)}</p>
                    <p>Días con saldo diario negativo: <span className="font-bold text-rose-300">{calendar.summary.criticalDays}</span></p>
                    <p>Eventos del mes: <span className="font-bold text-slate-100">{calendar.summary.eventsCount}</span></p>
                  </div>
                </section>
              </aside>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
