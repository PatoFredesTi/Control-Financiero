import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowLeft, Bell, BellRing, CalendarClock, CheckCircle2, Info, RefreshCw, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { getNotificationCenter } from '../services/notificationsApi';
import type { FinancialNotification, NotificationCategory, NotificationSeverity } from '../types/notification';

const severityLabels: Record<NotificationSeverity, string> = {
  CRITICAL: 'Crítica',
  WARNING: 'Advertencia',
  INFO: 'Informativa',
  SUCCESS: 'Positiva',
};

const categoryLabels: Record<NotificationCategory, string> = {
  BALANCE: 'Balance',
  BUDGET: 'Presupuestos',
  DEBT: 'Deudas',
  RECURRING: 'Recurrentes',
  GOAL: 'Metas',
  IMPORT: 'Importaciones',
  SYSTEM: 'Sistema',
};

const severityClasses: Record<NotificationSeverity, string> = {
  CRITICAL: 'border-rose-500/40 bg-rose-500/10 text-rose-100',
  WARNING: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  INFO: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  SUCCESS: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
};

const severityIcon: Record<NotificationSeverity, LucideIcon> = {
  CRITICAL: ShieldAlert,
  WARNING: AlertTriangle,
  INFO: Info,
  SUCCESS: CheckCircle2,
};

const monthOptions = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const currentDate = new Date();

function NotificationCard({ notification }: { notification: FinancialNotification }) {
  const Icon = severityIcon[notification.severity];

  return (
    <article className={`rounded-2xl border p-5 shadow-xl ${severityClasses[notification.severity]}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/10 p-2">
            <Icon size={22} />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{severityLabels[notification.severity]}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{categoryLabels[notification.category]}</span>
            </div>
            <h3 className="text-lg font-bold">{notification.title}</h3>
          </div>
        </div>
      </div>

      <p className="text-sm leading-6 opacity-90">{notification.message}</p>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {notification.amount !== undefined ? <div className="rounded-xl bg-white/10 p-3"><span className="block text-xs opacity-70">Monto asociado</span><strong>{formatCurrency(notification.amount)}</strong></div> : null}
        {notification.dueDate ? <div className="rounded-xl bg-white/10 p-3"><span className="block text-xs opacity-70">Fecha relevante</span><strong>{notification.dueDate}</strong></div> : null}
      </div>

      {notification.action ? (
        <Link to={notification.action.href} className="mt-5 inline-flex items-center justify-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold transition hover:bg-white/25">
          {notification.action.label}
        </Link>
      ) : null}
    </article>
  );
}

function groupBySeverity(notifications: FinancialNotification[]) {
  const order: NotificationSeverity[] = ['CRITICAL', 'WARNING', 'INFO', 'SUCCESS'];
  return order
    .map((severity) => ({ severity, items: notifications.filter((notification) => notification.severity === severity) }))
    .filter((group) => group.items.length > 0);
}

export function NotificationsPage() {
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [daysAhead, setDaysAhead] = useState(7);
  const [severity, setSeverity] = useState<NotificationSeverity | ''>('');
  const [category, setCategory] = useState<NotificationCategory | ''>('');

  const query = useQuery({
    queryKey: ['notifications-center', month, year, daysAhead, severity, category],
    queryFn: () => getNotificationCenter({ month, year, daysAhead, severity, category }),
  });

  const groupedNotifications = useMemo(() => groupBySeverity(query.data?.notifications ?? []), [query.data?.notifications]);
  const summary = query.data?.summary;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-300"><BellRing size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">v2.2 — Alertas y recordatorios</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Centro de alertas financieras</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Detecta presupuestos excedidos, deudas próximas, recurrentes vencidos, metas atrasadas y riesgos de balance antes de que se transformen en problemas.</p>
        </header>

        {query.isError ? <ActionBanner variant="error" message={getApiErrorMessage(query.error)} /> : null}

        <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-xl font-bold">Filtros de alertas</h2>
              <p className="mt-1 text-sm text-slate-400">Ajusta el período mensual y la ventana de recordatorios próximos.</p>
            </div>
            <button onClick={() => query.refetch()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-amber-500 hover:text-amber-300"><RefreshCw size={16} /> Actualizar</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-2 text-sm text-slate-300">
              <span>Mes</span>
              <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500">
                {monthOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Año</span>
              <input type="number" min="2000" max="2100" value={year} onChange={(event) => setYear(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Días de anticipación</span>
              <input type="number" min="1" max="90" value={daysAhead} onChange={(event) => setDaysAhead(Number(event.target.value))} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500" />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Severidad</span>
              <select value={severity} onChange={(event) => setSeverity(event.target.value as NotificationSeverity | '')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500">
                <option value="">Todas</option>
                <option value="CRITICAL">Críticas</option>
                <option value="WARNING">Advertencias</option>
                <option value="INFO">Informativas</option>
                <option value="SUCCESS">Positivas</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Categoría</span>
              <select value={category} onChange={(event) => setCategory(event.target.value as NotificationCategory | '')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-amber-500">
                <option value="">Todas</option>
                {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Alertas totales" value={summary?.total ?? '—'} tone="info" />
          <StatCard label="Críticas" value={summary?.critical ?? '—'} tone="danger" />
          <StatCard label="Advertencias" value={summary?.warning ?? '—'} tone="warning" />
          <StatCard label="Requieren atención" value={summary?.requiresAttention ?? '—'} tone={(summary?.requiresAttention ?? 0) > 0 ? 'danger' : 'success'} />
          <StatCard label="Estado general" value={summary?.healthLabel ?? '—'} tone={(summary?.requiresAttention ?? 0) > 0 ? 'warning' : 'success'} />
        </section>

        {summary?.topPriority ? (
          <section className="mb-8 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 shrink-0 text-amber-200" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Prioridad principal</p>
                <h2 className="mt-2 text-2xl font-bold text-amber-50">{summary.topPriority.title}</h2>
                <p className="mt-2 text-sm leading-6 text-amber-100/90">{summary.topPriority.message}</p>
              </div>
            </div>
          </section>
        ) : null}

        {query.isLoading ? (
          <EmptyState title="Cargando alertas" description="Estamos revisando tus movimientos, presupuestos, deudas, recurrentes, metas e importaciones." icon={<Bell size={32} />} />
        ) : groupedNotifications.length === 0 ? (
          <EmptyState title="No hay alertas para estos filtros" description="Prueba ampliar la ventana de días, cambiar el período o quitar filtros de severidad/categoría." icon={<CheckCircle2 size={32} />} />
        ) : (
          <div className="space-y-8">
            {groupedNotifications.map((group) => (
              <section key={group.severity}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold">{severityLabels[group.severity]}</h2>
                  <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-400">{group.items.length} alerta(s)</span>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  {group.items.map((notification) => <NotificationCard key={notification.id} notification={notification} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
