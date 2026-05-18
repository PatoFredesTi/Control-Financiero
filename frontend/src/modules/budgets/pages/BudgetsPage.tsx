import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, PiggyBank, Search } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { getUniqueSortedValues, includesSearchTerm } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetForm } from '../components/BudgetForm';
import { createBudget, deleteBudget, getBudgets, updateBudget } from '../services/budgetsApi';
import type { Budget, CreateBudgetInput } from '../types/budget';

const inputClassName = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(String(now.getMonth() + 1));
  const [yearFilter, setYearFilter] = useState(String(now.getFullYear()));
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const budgetsQuery = useQuery({ queryKey: ['budgets'], queryFn: getBudgets });
  const budgets = budgetsQuery.data ?? [];

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => { invalidateData(); setSuccessMessage('Presupuesto creado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear el presupuesto.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateBudgetInput }) => updateBudget(id, input),
    onSuccess: () => { invalidateData(); setEditingBudget(null); setSuccessMessage('Presupuesto actualizado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo actualizar el presupuesto.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => { invalidateData(); setSuccessMessage('Presupuesto eliminado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar el presupuesto.')),
  });

  const categories = useMemo(() => getUniqueSortedValues(budgets.map((budget) => budget.category)), [budgets]);

  const filteredBudgets = useMemo(() => budgets.filter((budget) => {
    const matchesSearch = includesSearchTerm(searchTerm, [budget.category, budget.notes]);
    const matchesCategory = !categoryFilter || budget.category === categoryFilter;
    const matchesMonth = !monthFilter || budget.month === Number(monthFilter);
    const matchesYear = !yearFilter || budget.year === Number(yearFilter);
    return matchesSearch && matchesCategory && matchesMonth && matchesYear;
  }), [budgets, categoryFilter, monthFilter, searchTerm, yearFilter]);

  const totalBudgeted = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spentAmount, 0);
  const exceededCount = filteredBudgets.filter((budget) => budget.remainingAmount < 0).length;
  const activeFiltersCount = [searchTerm, categoryFilter, monthFilter, yearFilter].filter(Boolean).length;

  function handleSubmit(input: CreateBudgetInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, input });
      return;
    }

    createMutation.mutate(input);
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Seguro que quieres eliminar este presupuesto?')) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteMutation.mutate(id);
    }
  }

  function clearFilters() {
    setSearchTerm('');
    setCategoryFilter('');
    setMonthFilter('');
    setYearFilter('');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><PiggyBank size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v1.2 — Presupuestos mensuales</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Presupuestos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Define límites por categoría y compara automáticamente el presupuesto con tus gastos comunes registrados.</p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Presupuesto filtrado" value={formatCurrency(totalBudgeted)} tone="info" />
          <StatCard label="Gasto filtrado" value={formatCurrency(totalSpent)} tone="warning" />
          <StatCard label="Categorías excedidas" value={exceededCount} tone={exceededCount > 0 ? 'danger' : 'success'} helper={`${filteredBudgets.length} presupuesto(s) en la vista`} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <BudgetForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editingBudget} onCancelEdit={() => setEditingBudget(null)} />

          <section>
            <FiltersPanel title="Filtros de presupuestos" description="Filtra por texto, categoría, mes o año." activeFiltersCount={activeFiltersCount} totalCount={budgets.length} filteredCount={filteredBudgets.length} onClear={clearFilters}>
              <label className="text-sm text-slate-300">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"><Search size={14} /> Buscar</span>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className={inputClassName} placeholder="Alimentación, compras..." />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Categoría</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={inputClassName}>
                  <option value="">Todas</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Mes</span>
                <input type="number" min={1} max={12} value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className={inputClassName} />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Año</span>
                <input type="number" min={2000} max={2100} value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className={inputClassName} />
              </label>
            </FiltersPanel>

            {budgetsQuery.isLoading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Cargando presupuestos...</div>}
            {budgetsQuery.isError && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">No se pudieron cargar los presupuestos.</div>}
            {!budgetsQuery.isLoading && filteredBudgets.length === 0 && <EmptyState title="No hay presupuestos para mostrar" description="Crea un presupuesto o ajusta los filtros activos." />}

            <div className="grid gap-4">
              {filteredBudgets.map((budget) => <BudgetCard key={budget.id} budget={budget} onEdit={setEditingBudget} onDelete={handleDelete} />)}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
