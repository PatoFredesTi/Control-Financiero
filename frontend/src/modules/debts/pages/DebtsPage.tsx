import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, Landmark, Search } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { includesSearchTerm, isWithinDateRange } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { DebtCard } from '../components/DebtCard';
import { DebtForm } from '../components/DebtForm';
import { createDebt, deleteDebt, getDebts, updateDebt } from '../services/debtsApi';
import type { CreateDebtInput, Debt, DebtStatus } from '../types/debt';

const inputClassName =
  'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

const debtStatusLabels: Record<DebtStatus, string> = {
  ACTIVE: 'Activa',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  PAUSED: 'Pausada',
};

export function DebtsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | DebtStatus>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const invalidateFinancialData = () => {
    queryClient.invalidateQueries({ queryKey: ['debts'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-charts'] });
  };

  const debtsQuery = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebts(),
  });

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: () => {
      invalidateFinancialData();
      setSuccessMessage('Deuda creada correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear la deuda.')),
  });

  const updateDebtMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateDebtInput }) => updateDebt(id, input),
    onSuccess: () => {
      invalidateFinancialData();
      setEditingDebt(null);
      setSuccessMessage('Deuda actualizada correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo actualizar la deuda.')),
  });

  const deleteDebtMutation = useMutation({
    mutationFn: deleteDebt,
    onSuccess: (result) => {
      invalidateFinancialData();
      setSuccessMessage(result.message || 'Deuda eliminada correctamente.');
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar la deuda.')),
  });

  const debts = debtsQuery.data ?? [];

  const filteredDebts = useMemo(
    () =>
      debts.filter((debt) => {
        const matchesSearch = includesSearchTerm(searchTerm, [
          debt.name,
          debt.creditor,
          debt.description,
          debt.notes,
        ]);
        const matchesStatus = !statusFilter || debt.status === statusFilter;
        const matchesDate = isWithinDateRange(debt.startDate, fromDate, toDate);

        return matchesSearch && matchesStatus && matchesDate;
      }),
    [debts, fromDate, searchTerm, statusFilter, toDate],
  );

  const totalPending = filteredDebts.reduce((total, debt) => total + debt.pendingAmount, 0);
  const totalPaid = filteredDebts.reduce((total, debt) => total + debt.paidAmount, 0);
  const activeDebts = filteredDebts.filter((debt) => debt.status === 'ACTIVE').length;
  const paidDebts = filteredDebts.filter((debt) => debt.status === 'PAID').length;
  const activeFiltersCount = [searchTerm, statusFilter, fromDate, toDate].filter(Boolean).length;

  function handleSubmitDebt(input: CreateDebtInput) {
    setSuccessMessage(null);
    setErrorMessage(null);

    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt.id, input });
      return;
    }

    createDebtMutation.mutate(input);
  }

  function handleDeleteDebt(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar esta deuda? Solo se puede eliminar si no tiene pagos asociados.');

    if (shouldDelete) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteDebtMutation.mutate(id);
    }
  }

  function handleClearFilters() {
    setSearchTerm('');
    setStatusFilter('');
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CreditCard size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v1.0 — MVP completo
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Deudas</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Crea, edita y controla tus deudas. Los pagos asociados desde gastos actualizan automáticamente monto pagado, saldo pendiente y estado.
          </p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Deudas filtradas" value={filteredDebts.length} helper={`De ${debts.length} registro(s) totales`} />
          <StatCard label="Deudas activas" value={activeDebts} tone="info" helper={`${paidDebts} pagada(s) en la vista actual`} />
          <StatCard label="Total pendiente" value={formatCurrency(totalPending)} tone="warning" />
          <StatCard label="Total pagado" value={formatCurrency(totalPaid)} tone="success" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <DebtForm
            onSubmit={handleSubmitDebt}
            isSubmitting={createDebtMutation.isPending || updateDebtMutation.isPending}
            initialData={editingDebt}
            onCancelEdit={() => setEditingDebt(null)}
          />

          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de deudas</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Controla tus deudas activas, pagadas, vencidas o pausadas.
                </p>
              </div>
            </div>

            <FiltersPanel
              title="Filtros de deudas"
              description="Busca por nombre, acreedor, descripción o notas. También puedes filtrar por estado y fecha de inicio."
              activeFiltersCount={activeFiltersCount}
              totalCount={debts.length}
              filteredCount={filteredDebts.length}
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
                  placeholder="Banco, tarjeta, familiar..."
                />
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Estado</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as '' | DebtStatus)}
                  className={inputClassName}
                >
                  <option value="">Todos los estados</option>
                  {(Object.keys(debtStatusLabels) as DebtStatus[]).map((status) => (
                    <option key={status} value={status}>{debtStatusLabels[status]}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Inicio desde</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className={inputClassName}
                />
              </label>

              <label className="text-sm text-slate-300">
                <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Inicio hasta</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className={inputClassName}
                />
              </label>
            </FiltersPanel>

            {debtsQuery.isLoading && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Cargando deudas...
              </div>
            )}

            {debtsQuery.isError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
                No se pudieron cargar las deudas. Revisa que el backend esté activo y que Prisma tenga la migración aplicada.
              </div>
            )}

            {!debtsQuery.isLoading && !debtsQuery.isError && debts.length === 0 && (
              <EmptyState
                icon={<Landmark size={36} />}
                title="Aún no tienes deudas registradas"
                description="Crea una deuda desde el formulario. Luego podrás registrar pagos desde el módulo de gastos."
              />
            )}

            {!debtsQuery.isLoading && !debtsQuery.isError && debts.length > 0 && filteredDebts.length === 0 && (
              <EmptyState
                icon={<Search size={36} />}
                title="No hay deudas que coincidan con los filtros"
                description="Prueba limpiando los filtros o cambiando el estado seleccionado."
              />
            )}

            <div className="grid gap-4">
              {filteredDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={setEditingDebt}
                  onDelete={handleDeleteDebt}
                  isDeleting={deleteDebtMutation.isPending}
                />
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
