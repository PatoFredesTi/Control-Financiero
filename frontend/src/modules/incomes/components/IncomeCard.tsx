import { CalendarDays, Pencil, Tag, Trash2, WalletCards } from 'lucide-react';
import type { Income } from '../types/income';
import { formatCurrency } from '../../../utils/formatCurrency';

type IncomeCardProps = {
  income: Income;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function IncomeCard({ income, onEdit, onDelete, isDeleting }: IncomeCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Ingreso
          </div>
          <h3 className="text-xl font-semibold text-slate-100">{income.description}</h3>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {formatCurrency(income.amount)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
          <button
            onClick={() => onEdit(income)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 px-4 py-2 text-sm text-sky-300 transition hover:bg-sky-500/10"
          >
            <Pencil size={16} />
            Editar
          </button>
          <button
            onClick={() => onDelete(income.id)}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-400 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-emerald-300" />
          {income.category}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-sky-300" />
          {formatDate(income.receivedAt)}
        </div>
        <div className="flex items-center gap-2">
          <WalletCards size={16} className="text-amber-300" />
          {income.paymentMethod || 'Sin método'}
        </div>
      </div>

      {income.notes && (
        <p className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm leading-6 text-slate-400">
          {income.notes}
        </p>
      )}
    </article>
  );
}
