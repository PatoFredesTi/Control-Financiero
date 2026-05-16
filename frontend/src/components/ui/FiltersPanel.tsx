import { Filter, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';

type FiltersPanelProps = {
  title: string;
  description: string;
  activeFiltersCount: number;
  totalCount: number;
  filteredCount: number;
  onClear: () => void;
  children: ReactNode;
};

export function FiltersPanel({
  title,
  description,
  activeFiltersCount,
  totalCount,
  filteredCount,
  onClear,
  children,
}: FiltersPanelProps) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
            <Filter size={14} />
            {title}
          </div>
          <p className="text-sm text-slate-400">{description}</p>
          <p className="mt-2 text-xs text-slate-500">
            Mostrando {filteredCount} de {totalCount} registro(s)
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          disabled={activeFiltersCount === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-sky-500 hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={16} />
          Limpiar filtros
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}
