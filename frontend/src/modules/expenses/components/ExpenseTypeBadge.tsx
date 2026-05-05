import type { ExpenseType } from '../types/expense';

const badgeMap: Record<ExpenseType, { label: string; className: string }> = {
  COMMON: {
    label: 'Gasto común',
    className: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  },
  DEBT_PAYMENT: {
    label: 'Pago de deuda',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
};

type ExpenseTypeBadgeProps = {
  type: ExpenseType;
};

export function ExpenseTypeBadge({ type }: ExpenseTypeBadgeProps) {
  const badge = badgeMap[type];

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}>
      {badge.label}
    </span>
  );
}
