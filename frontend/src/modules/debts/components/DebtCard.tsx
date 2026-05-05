import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { DebtStatusBadge } from './DebtStatusBadge';
import type { Debt } from '../types/debt';

interface DebtCardProps {
  debt: Debt;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function DebtCard({ debt, onDelete, isDeleting }: DebtCardProps) {
  const progress = debt.initialAmount > 0
    ? Math.round((debt.paidAmount / debt.initialAmount) * 100)
    : 0;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">{debt.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {debt.creditor ? `Acreedor: ${debt.creditor}` : 'Sin acreedor registrado'}
          </p>
        </div>
        <DebtStatusBadge status={debt.status} />
      </div>

      {debt.description && (
        <p className="mb-4 text-sm leading-6 text-slate-400">{debt.description}</p>
      )}

      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-500">Monto inicial</p>
          <p className="mt-1 font-semibold text-slate-200">
            {formatCurrency(debt.initialAmount)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-500">Pagado</p>
          <p className="mt-1 font-semibold text-emerald-300">
            {formatCurrency(debt.paidAmount)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-950 p-3">
          <p className="text-slate-500">Pendiente</p>
          <p className="mt-1 font-semibold text-amber-300">
            {formatCurrency(debt.pendingAmount)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Avance de pago</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-500">
        <span>Inicio: {new Date(debt.startDate).toLocaleDateString('es-CL')}</span>
        <button
          type="button"
          onClick={() => onDelete(debt.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 size={14} />
          Eliminar
        </button>
      </div>
    </article>
  );
}
