import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Goal, Search } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { includesSearchTerm } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { SavingsGoalCard } from '../components/SavingsGoalCard';
import { SavingsGoalForm } from '../components/SavingsGoalForm';
import { addGoalContribution, createSavingsGoal, deleteSavingsGoal, getSavingsGoals, updateSavingsGoal } from '../services/savingsGoalsApi';
import type { CreateGoalContributionInput, CreateSavingsGoalInput, GoalStatus, SavingsGoal } from '../types/savingsGoal';

const inputClassName = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

const statusLabels: Record<GoalStatus, string> = {
  ACTIVE: 'Activas',
  COMPLETED: 'Completadas',
  PAUSED: 'Pausadas',
};

export function SavingsGoalsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const goalsQuery = useQuery({ queryKey: ['savings-goals'], queryFn: getSavingsGoals });
  const goals = goalsQuery.data ?? [];

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

  const createMutation = useMutation({
    mutationFn: createSavingsGoal,
    onSuccess: () => { invalidateData(); setSuccessMessage('Meta creada correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear la meta.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateSavingsGoalInput }) => updateSavingsGoal(id, input),
    onSuccess: () => { invalidateData(); setEditingGoal(null); setSuccessMessage('Meta actualizada correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo actualizar la meta.')),
  });

  const contributionMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateGoalContributionInput }) => addGoalContribution(id, input),
    onSuccess: () => { invalidateData(); setSuccessMessage('Aporte registrado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo registrar el aporte.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavingsGoal,
    onSuccess: () => { invalidateData(); setSuccessMessage('Meta eliminada correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar la meta.')),
  });

  const filteredGoals = useMemo(() => goals.filter((goal) => {
    const matchesSearch = includesSearchTerm(searchTerm, [goal.name, goal.description, goal.notes]);
    const matchesStatus = !statusFilter || goal.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [goals, searchTerm, statusFilter]);

  const totalTarget = filteredGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalSaved = filteredGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedCount = filteredGoals.filter((goal) => goal.status === 'COMPLETED').length;
  const activeFiltersCount = [searchTerm, statusFilter].filter(Boolean).length;

  function handleSubmit(input: CreateSavingsGoalInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, input });
      return;
    }

    createMutation.mutate(input);
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Seguro que quieres eliminar esta meta? También se eliminarán sus aportes.')) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteMutation.mutate(id);
    }
  }

  function handleContribution(id: string, input: CreateGoalContributionInput) {
    setSuccessMessage(null);
    setErrorMessage(null);
    contributionMutation.mutate({ id, input });
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Goal size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v1.2 — Metas de ahorro</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Metas de ahorro</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Crea objetivos financieros, registra aportes y visualiza el progreso hasta completar cada meta.</p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Objetivo filtrado" value={formatCurrency(totalTarget)} tone="info" />
          <StatCard label="Ahorrado filtrado" value={formatCurrency(totalSaved)} tone="success" />
          <StatCard label="Metas completadas" value={completedCount} tone="success" helper={`${filteredGoals.length} meta(s) en la vista`} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <SavingsGoalForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editingGoal} onCancelEdit={() => setEditingGoal(null)} />

          <section>
            <FiltersPanel title="Filtros de metas" description="Busca por nombre, descripción o estado." activeFiltersCount={activeFiltersCount} totalCount={goals.length} filteredCount={filteredGoals.length} onClear={() => { setSearchTerm(''); setStatusFilter(''); }}>
              <label className="text-sm text-slate-300">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500"><Search size={14} /> Buscar</span>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className={inputClassName} placeholder="Fondo, viaje, notebook..." />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Estado</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClassName}>
                  <option value="">Todos los estados</option>
                  {Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}
                </select>
              </label>
            </FiltersPanel>

            {goalsQuery.isLoading && <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">Cargando metas...</div>}
            {goalsQuery.isError && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">No se pudieron cargar las metas.</div>}
            {!goalsQuery.isLoading && filteredGoals.length === 0 && <EmptyState title="No hay metas para mostrar" description="Crea una meta o ajusta los filtros activos." />}

            <div className="grid gap-4">
              {filteredGoals.map((goal) => (
                <SavingsGoalCard key={goal.id} goal={goal} onEdit={setEditingGoal} onDelete={handleDelete} onAddContribution={handleContribution} isAddingContribution={contributionMutation.isPending} />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
