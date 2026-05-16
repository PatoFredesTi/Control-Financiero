import type { ReactNode } from 'react';

type StatCardProps = {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: 'default' | 'success' | 'danger' | 'warning' | 'info';
};

const toneClass = {
  default: 'text-slate-100',
  success: 'text-emerald-300',
  danger: 'text-rose-300',
  warning: 'text-amber-300',
  info: 'text-sky-300',
};

export function StatCard({ label, value, helper, tone = 'default' }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneClass[tone]}`}>{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
    </div>
  );
}
