import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { DashboardRecentMovement } from '../types/dashboard';

type RecentMovementsProps = {
  movements: DashboardRecentMovement[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function RecentMovements({ movements }: RecentMovementsProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Últimos movimientos</h2>
        <p className="mt-1 text-sm text-slate-400">
          Mezcla de ingresos y gastos ordenados por fecha.
        </p>
      </div>

      {movements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center text-slate-400">
          Aún no hay movimientos registrados.
        </div>
      )}

      <div className="space-y-3">
        {movements.map((movement) => {
          const isIncome = movement.type === 'INCOME';
          const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;

          return (
            <article
              key={`${movement.type}-${movement.id}`}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1 flex h-10 w-10 items-center justify-center rounded-xl ${
                    isIncome
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">{movement.description}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {movement.category} · {formatDate(movement.date)}
                    {movement.debtName ? ` · Deuda: ${movement.debtName}` : ''}
                  </p>
                </div>
              </div>

              <p
                className={`text-lg font-bold ${
                  isIncome ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {isIncome ? '+' : '-'} {formatCurrency(movement.amount)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
