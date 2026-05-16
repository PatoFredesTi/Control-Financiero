import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, ReceiptText, Search, TrendingDown } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { getUniqueSortedValues, includesSearchTerm, isWithinDateRange } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { getDebts } from '../../debts/services/debtsApi';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseForm } from '../components/ExpenseForm';
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../services/expensesApi';
import type { CreateExpenseInput, Expense, ExpenseType } from '../types/expense';

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

export function ExpensesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | ExpenseType>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const invalidateFinancialData = () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
  };

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: () => getExpenses(),
  });

  const debtsQuery = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebts(),
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      invalidateFinancialData();
      setSuccessMessage('Gasto creado correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear el gasto.')),
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateExpenseInput }) => updateExpense(id, input),
    onSuccess: () => {
      invalidateFinancialData();
      setEditingExpense(null);
      setSuccessMessage('Gasto actualizado correctamente. Si era pago de deuda, el saldo fue recalculado.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo actualizar el gasto.')),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (result) => {
      invalidateFinancialData();
      setSuccessMessage(result.message || 'Gasto eliminado correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar el gasto.')),
  });

  const expenses = expensesQuery.data ?? [];
  const debts = debtsQuery.data ?? [];
  const currentMonth = getCurrentMonthKey();

  const categories = useMemo(
    () => getUniqueSortedValues(expenses.map((expense) => expense.category)),
    [expenses],
  );

  const filteredExpenses = useMemo(
    () =>
      expenses.filter((expense) => {
        const matchesSearch = includesSearchTerm(searchTerm, [
          expense.description,
          expense.category,
          expense.paymentMethod,
          expense.notes,
          expense.debt?.name,
        ]);
        const matchesCategory = !categoryFilter || expense.category === categoryFilter;
        const matchesType = !typeFilter || expense.type === typeFilter;
        const matchesDate = isWithinDateRange(expense.spentAt, fromDate, toDate);

        return matchesSearch && matchesCategory && matchesType && matchesDate;
      }),
    [categoryFilter, expenses, fromDate, searchTerm, toDate, typeFilter],
  );

  const totalExpenses = filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  const currentMonthExpenses = filteredExpenses
    .filter((expense) => expense.spentAt.slice(0, 7) === currentMonth)
    .reduce((total, expense) => total + expense.amount, 0);
  const debtPaymentsCount = filteredExpenses.filter((expense) => expense.type === 'DEBT_PAYMENT').length;
  const commonExpensesCount = filteredExpenses.filter((expense) => expense.type === 'COMMON').length;
  const categoriesCount = new Set(filteredExpenses.map((expense) => expense.category)).size;
  const activeFiltersCount = [searchTerm, categoryFilter, typeFilter, fromDate, toDate].filter(Boolean).length;

  function handleSubmitExpense(input: CreateExpenseInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, input });
      return;
    }

    createExpenseMutation.mutate(input);
  }

  function handleDeleteExpense(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este gasto? Si es un pago de deuda, el monto se devolverá al saldo pendiente.');

    if (shouldDelete) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteExpenseMutation.mutate(id);
    }
  }

  function handleClearFilters() {
    setSearchTerm('');
    setCategoryFilter('');
    setTypeFilter('');
    setFromDate('');
    setToDate('');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <ReceiptText size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-rose-400">
            v1.0 — MVP completo
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Gastos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Registra, edita y elimina gastos comunes o pagos de deuda. El backend recalcula automáticamente los saldos cuando corresponde.
          </p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Gastos filtrados" value={filteredExpenses.length} helper={`De ${expenses.length} registro(s) totales`} />
          <StatCard label="Gastos del mes" value={formatCurrency(currentMonthExpenses)} tone="danger" />
          <StatCard label="Total filtrado" value={formatCurrency(totalExpenses)} tone="warning" helper={`${categoriesCount} categoría(s) en la vista actual`} />
          <StatCard label="Pagos de deuda" value={debtPaymentsCount} tone="warning" helper={`${commonExpensesCount} gasto(s) común(es)`} />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <ExpenseForm
            debts={debts}
            onSubmit={handleSubmitExpense}
            isSubmitting={createExpenseMutation.isPending || updateExpenseMutation.isPending}
            errorMessage={errorMessage ?? undefined}
            initialData={editingExpense}
            onCancelEdit={() => setEditingExpense(null)}
          />

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de gastos</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Revisa gastos comunes y pagos de deuda con filtros rápidos.
                </p>
              </div>
            </div>

            <FiltersPanel
              title="Filtros de gastos"
              description="Filtra por texto, categoría, tipo de gasto y rango de fechas."
              activeFiltersCount={activeFiltersCount}
              totalCount={expenses.length}
              filteredCount={filteredExpenses.length}
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
                  placeholder="Supermercado, deuda, tarjeta..."
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
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Tipo</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as '' | ExpenseType)}
                  className={inputClassName}
                >
                  <option value="">Todos los tipos</option>
                  <option value="COMMON">Gasto común</option>
                  <option value="DEBT_PAYMENT">Pago de deuda</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2 xl:col-span-1">
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
              </div>
            </FiltersPanel>

            {(expensesQuery.isLoading || debtsQuery.isLoading) && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Cargando gastos...
              </div>
            )}

            {expensesQuery.isError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
                No se pudieron cargar los gastos. Revisa que el backend esté activo.
              </div>
            )}

            {!expensesQuery.isLoading && !expensesQuery.isError && expenses.length === 0 && (
              <EmptyState
                icon={<ReceiptText size={36} />}
                title="Aún no tienes gastos registrados"
                description="Crea tu primer gasto común o registra un pago de deuda desde el formulario."
              />
            )}

            {!expensesQuery.isLoading && !expensesQuery.isError && expenses.length > 0 && filteredExpenses.length === 0 && (
              <EmptyState
                icon={<Search size={36} />}
                title="No hay gastos que coincidan con los filtros"
                description="Prueba limpiando los filtros o ampliando el rango de fechas."
              />
            )}

            <div className="grid gap-4">
              {filteredExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={setEditingExpense}
                  onDelete={handleDeleteExpense}
                  isDeleting={deleteExpenseMutation.isPending}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
