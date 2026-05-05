import type { DebtStatus } from '../types/debt';

const statusLabels: Record<DebtStatus, string> = {
  ACTIVE: 'Activa',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  PAUSED: 'Pausada',
};

const statusClasses: Record<DebtStatus, string> = {
  ACTIVE: 'border-sky-400/40 bg-sky-500/10 text-sky-300',
  PAID: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  OVERDUE: 'border-rose-400/40 bg-rose-500/10 text-rose-300',
  PAUSED: 'border-amber-400/40 bg-amber-500/10 text-amber-300',
};

interface DebtStatusBadgeProps {
  status: DebtStatus;
}

export function DebtStatusBadge({ status }: DebtStatusBadgeProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
