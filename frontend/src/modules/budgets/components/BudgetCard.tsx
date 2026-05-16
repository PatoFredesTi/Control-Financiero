import { Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { Budget } from '../types/budget';

type BudgetCardProps = {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
};

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const progress = Math.min(budget.usagePercentage, 100);
  const isExceeded = budget.remainingAmount < 0;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{budget.month}/{budget.year}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-100">{budget.category}</h3>
          {budget.notes && <p className="mt-1 text-sm text-slate-400">{budget.notes}</p>}
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs ${isExceeded ? 'border-rose-400/40 bg-rose-500/10 text-rose-200' : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'}`}>
          {isExceeded ? 'Excedido' : 'Dentro del límite'}
        </span>
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
        <div><span className="block text-xs text-slate-500">Presupuesto</span>{formatCurrency(budget.amount)}</div>
        <div><span className="block text-xs text-slate-500">Gastado</span>{formatCurrency(budget.spentAmount)}</div>
        <div><span className="block text-xs text-slate-500">Restante</span>{formatCurrency(budget.remainingAmount)}</div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${isExceeded ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-right text-xs text-slate-500">{budget.usagePercentage}% utilizado</p>

      <div className="mt-5 flex gap-2">
        <button onClick={() => onEdit(budget)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><Edit2 size={15} /> Editar</button>
        <button onClick={() => onDelete(budget.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"><Trash2 size={15} /> Eliminar</button>
      </div>
    </article>
  );
}
