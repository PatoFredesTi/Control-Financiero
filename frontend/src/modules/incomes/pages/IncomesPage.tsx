import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CircleDollarSign, Search, TrendingUp, Wallet } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { getUniqueSortedValues, includesSearchTerm, isWithinDateRange } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { IncomeCard } from '../components/IncomeCard';
import { IncomeForm } from '../components/IncomeForm';
import { createIncome, deleteIncome, getIncomes, updateIncome } from '../services/incomesApi';
import type { CreateIncomeInput, Income } from '../types/income';

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

export function IncomesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const invalidateFinancialData = () => {
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
  };

  const incomesQuery = useQuery({
    queryKey: ['incomes'],
    queryFn: () => getIncomes(),
  });

  const createIncomeMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      invalidateFinancialData();
      setSuccessMessage('Ingreso creado correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear el ingreso.')),
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateIncomeInput }) => updateIncome(id, input),
    onSuccess: () => {
      invalidateFinancialData();
      setEditingIncome(null);
      setSuccessMessage('Ingreso actualizado correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo actualizar el ingreso.')),
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      invalidateFinancialData();
      setSuccessMessage('Ingreso eliminado correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar el ingreso.')),
  });

  const incomes = incomesQuery.data ?? [];
  const currentMonth = getCurrentMonthKey();

  const categories = useMemo(
    () => getUniqueSortedValues(incomes.map((income) => income.category)),
    [incomes],
  );

  const filteredIncomes = useMemo(
    () =>
      incomes.filter((income) => {
        const matchesSearch = includesSearchTerm(searchTerm, [
          income.description,
          income.category,
          income.paymentMethod,
          income.notes,
        ]);
        const matchesCategory = !categoryFilter || income.category === categoryFilter;
        const matchesDate = isWithinDateRange(income.receivedAt, fromDate, toDate);

        return matchesSearch && matchesCategory && matchesDate;
      }),
    [categoryFilter, fromDate, incomes, searchTerm, toDate],
  );

  const totalIncome = filteredIncomes.reduce((total, income) => total + income.amount, 0);
  const currentMonthIncome = filteredIncomes
    .filter((income) => income.receivedAt.slice(0, 7) === currentMonth)
    .reduce((total, income) => total + income.amount, 0);
  const categoriesCount = new Set(filteredIncomes.map((income) => income.category)).size;
  const activeFiltersCount = [searchTerm, categoryFilter, fromDate, toDate].filter(Boolean).length;

  function handleSubmitIncome(input: CreateIncomeInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (editingIncome) {
      updateIncomeMutation.mutate({ id: editingIncome.id, input });
      return;
    }

    createIncomeMutation.mutate(input);
  }

  function handleDeleteIncome(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este ingreso? Esta acción no se puede deshacer.');

    if (shouldDelete) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteIncomeMutation.mutate(id);
    }
  }

  function handleClearFilters() {
    setSearchTerm('');
    setCategoryFilter('');
    setFromDate('');
    setToDate('');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          Volver al dashboard
        </Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CircleDollarSign size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v1.0 — MVP completo
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Ingresos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Registra, edita, elimina y filtra tus entradas de dinero. Los cambios impactan automáticamente en el dashboard financiero.
          </p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Ingresos filtrados" value={filteredIncomes.length} helper={`De ${incomes.length} registro(s) totales`} />
          <StatCard label="Ingresos del mes" value={formatCurrency(currentMonthIncome)} tone="success" />
          <StatCard label="Total filtrado" value={formatCurrency(totalIncome)} tone="info" helper={`${categoriesCount} categoría(s) en la vista actual`} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <IncomeForm
            onSubmit={handleSubmitIncome}
            isSubmitting={createIncomeMutation.isPending || updateIncomeMutation.isPending}
            initialData={editingIncome}
            onCancelEdit={() => setEditingIncome(null)}
          />

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de ingresos</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Filtra tus ingresos sin perder el contexto del total registrado.
                </p>
              </div>
            </div>

            <FiltersPanel
              title="Filtros de ingresos"
              description="Busca por descripción, categoría, método de pago o notas. También puedes limitar el rango de fechas."
              activeFiltersCount={activeFiltersCount}
              totalCount={incomes.length}
              filteredCount={filteredIncomes.length}
              onClear={handleClearFilters}
            >
              <label className="text-sm text-slate-300">
                <span className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <Search size={14} /> Buscar
                </span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className={inputClassName}
                  placeholder="Sueldo, freelance, transferencia..."
                />
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Categoría</span>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Desde</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Hasta</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </FiltersPanel>

            {incomesQuery.isLoading && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Cargando ingresos...
              </div>
            )}

            {incomesQuery.isError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
                No se pudieron cargar los ingresos. Revisa que el backend esté activo y que Prisma tenga la migración aplicada.
              </div>
            )}

            {!incomesQuery.isLoading && !incomesQuery.isError && incomes.length === 0 && (
              <EmptyState
                icon={<Wallet size={36} />}
                title="Aún no tienes ingresos registrados"
                description="Crea tu primer ingreso desde el formulario. Luego podrás filtrarlo por categoría, texto y fecha."
              />
            )}

            {!incomesQuery.isLoading && !incomesQuery.isError && incomes.length > 0 && filteredIncomes.length === 0 && (
              <EmptyState
                icon={<Search size={36} />}
                title="No hay ingresos que coincidan con los filtros"
                description="Prueba limpiando los filtros o ampliando el rango de fechas para volver a ver tus movimientos."
              />
            )}

            <div className="grid gap-4">
              {filteredIncomes.map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
                  onEdit={setEditingIncome}
                  onDelete={handleDeleteIncome}
                  isDeleting={deleteIncomeMutation.isPending}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
