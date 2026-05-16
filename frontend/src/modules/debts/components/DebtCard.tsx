import { AlertTriangle, Pencil, ReceiptText, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import { DebtStatusBadge } from './DebtStatusBadge';
import type { Debt } from '../types/debt';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function DebtCard({ debt, onEdit, onDelete, isDeleting }: DebtCardProps) {
  const progress = debt.initialAmount > 0
    ? Math.round((debt.paidAmount / debt.initialAmount) * 100)
    : 0;
  const associatedPaymentsCount = debt._count?.expenses ?? 0;
  const canDelete = associatedPaymentsCount === 0;

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

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-400">
        <ReceiptText size={15} className="text-sky-300" />
        {associatedPaymentsCount === 0
          ? 'Sin pagos asociados todavía.'
          : `${associatedPaymentsCount} pago(s) asociado(s) desde el módulo de gastos.`}
      </div>

      {!canDelete && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          Para mantener la consistencia, esta deuda no se puede eliminar mientras tenga pagos asociados. Elimina primero esos gastos para que el saldo se recalcule.
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Inicio: {new Date(debt.startDate).toLocaleDateString('es-CL')}</span>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => onEdit(debt)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-500/30 px-3 py-2 text-sky-300 transition hover:bg-sky-500/10"
          >
            <Pencil size={14} />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(debt.id)}
            disabled={isDeleting || !canDelete}
            title={!canDelete ? 'Elimina primero los pagos asociados desde gastos.' : undefined}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-rose-300 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
