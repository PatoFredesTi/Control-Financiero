import type { LucideIcon } from 'lucide-react';

type SummaryCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: 'emerald' | 'rose' | 'amber' | 'sky' | 'slate';
};

const toneClasses = {
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  slate: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
};

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'slate',
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">{value}</p>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${toneClasses[tone]}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-sm leading-6 text-slate-500">{description}</p>
    </article>
  );
}
