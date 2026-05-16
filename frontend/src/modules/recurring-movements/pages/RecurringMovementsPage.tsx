import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Repeat2, Search, Wand2 } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FiltersPanel } from '../../../components/ui/FiltersPanel';
import { StatCard } from '../../../components/ui/StatCard';
import { getDebts } from '../../debts/services/debtsApi';
import { includesSearchTerm } from '../../../utils/filterHelpers';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { createRecurringMovement, deleteRecurringMovement, generateDueRecurringMovements, generateRecurringMovement, getRecurringMovements } from '../services/recurringMovementsApi';
import type { CreateRecurringMovementInput, RecurringFrequency, RecurringMovement, RecurringMovementKind } from '../types/recurringMovement';

const inputClassName = 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-emerald-500';

const kindLabels: Record<RecurringMovementKind, string> = {
  INCOME: 'Ingreso recurrente',
  EXPENSE: 'Gasto recurrente',
  DEBT_PAYMENT: 'Pago recurrente de deuda',
};

const frequencyLabels: Record<RecurringFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual',
  YEARLY: 'Anual',
};

function emptyForm(): CreateRecurringMovementInput {
  return {
    description: '',
    amount: 0,
    category: '',
    paymentMethod: '',
    kind: 'EXPENSE',
    frequency: 'MONTHLY',
    nextRunAt: new Date().toISOString().slice(0, 10),
    debtId: '',
    notes: '',
  };
}

export function RecurringMovementsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateRecurringMovementInput>(emptyForm());
  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recurringQuery = useQuery({ queryKey: ['recurring-movements'], queryFn: () => getRecurringMovements() });
  const debtsQuery = useQuery({ queryKey: ['debts'], queryFn: () => getDebts() });

  const recurringMovements = recurringQuery.data ?? [];
  const debts = debtsQuery.data ?? [];

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['recurring-movements'] });
    queryClient.invalidateQueries({ queryKey: ['financial-calendar'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
    queryClient.invalidateQueries({ queryKey: ['incomes'] });
    queryClient.invalidateQueries({ queryKey: ['debts'] });
  };

  const createMutation = useMutation({
    mutationFn: createRecurringMovement,
    onSuccess: () => { invalidateData(); setForm(emptyForm()); setSuccessMessage('Movimiento recurrente creado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo crear el movimiento recurrente.')),
  });

  const generateMutation = useMutation({
    mutationFn: generateRecurringMovement,
    onSuccess: () => { invalidateData(); setSuccessMessage('Movimiento generado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo generar el movimiento.')),
  });

  const generateDueMutation = useMutation({
    mutationFn: generateDueRecurringMovements,
    onSuccess: () => { invalidateData(); setSuccessMessage('Movimientos vencidos generados correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudieron generar los movimientos vencidos.')),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRecurringMovement,
    onSuccess: () => { invalidateData(); setSuccessMessage('Movimiento recurrente eliminado correctamente.'); setErrorMessage(null); },
    onError: (error) => setErrorMessage(getApiErrorMessage(error, 'No se pudo eliminar el movimiento recurrente.')),
  });

  const filteredMovements = useMemo(() => recurringMovements.filter((item) => {
    const matchesSearch = includesSearchTerm(searchTerm, [item.description, item.category, item.paymentMethod, item.notes, item.debt?.name]);
    const matchesKind = !kindFilter || item.kind === kindFilter;
    return matchesSearch && matchesKind;
  }), [kindFilter, recurringMovements, searchTerm]);

  const totalExpectedIncome = filteredMovements.filter((item) => item.kind === 'INCOME').reduce((sum, item) => sum + item.amount, 0);
  const totalExpectedOutcome = filteredMovements.filter((item) => item.kind !== 'INCOME').reduce((sum, item) => sum + item.amount, 0);
  const activeCount = filteredMovements.filter((item) => item.status === 'ACTIVE').length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const input: CreateRecurringMovementInput = {
      ...form,
      amount: Number(form.amount),
      category: form.kind === 'DEBT_PAYMENT' ? 'Pago de deuda' : form.category,
      debtId: form.kind === 'DEBT_PAYMENT' ? form.debtId : undefined,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes || undefined,
    };

    createMutation.mutate(input);
  }

  function handleDelete(item: RecurringMovement) {
    if (window.confirm(`¿Eliminar el recurrente "${item.description}"?`)) {
      setSuccessMessage(null);
      setErrorMessage(null);
      deleteMutation.mutate(item.id);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al inicio</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Repeat2 size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v1.7 — Movimientos recurrentes</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Movimientos recurrentes</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Programa ingresos, gastos y pagos de deuda que se repiten. Luego puedes generarlos manualmente o generar todos los vencidos.</p>
        </header>

        <ActionBanner message={successMessage} variant="success" onClose={() => setSuccessMessage(null)} />
        <ActionBanner message={errorMessage} variant="error" onClose={() => setErrorMessage(null)} />

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <StatCard label="Recurrentes activos" value={activeCount} tone="info" />
          <StatCard label="Ingresos esperados" value={formatCurrency(totalExpectedIncome)} tone="success" />
          <StatCard label="Salidas esperadas" value={formatCurrency(totalExpectedOutcome)} tone="danger" />
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="mb-5 text-2xl font-bold">Nuevo recurrente</h2>
            <div className="grid gap-4">
              <label className="text-sm text-slate-300">Descripción<input className={inputClassName} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
              <label className="text-sm text-slate-300">Monto<input type="number" min="1" className={inputClassName} value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required /></label>
              <label className="text-sm text-slate-300">Tipo<select className={inputClassName} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as RecurringMovementKind })}><option value="INCOME">Ingreso</option><option value="EXPENSE">Gasto</option><option value="DEBT_PAYMENT">Pago deuda</option></select></label>
              {form.kind !== 'DEBT_PAYMENT' ? <label className="text-sm text-slate-300">Categoría<input className={inputClassName} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label> : null}
              {form.kind === 'DEBT_PAYMENT' ? <label className="text-sm text-slate-300">Deuda asociada<select className={inputClassName} value={form.debtId} onChange={(e) => setForm({ ...form, debtId: e.target.value })} required><option value="">Selecciona una deuda</option>{debts.map((debt) => <option key={debt.id} value={debt.id}>{debt.name} — pendiente {formatCurrency(debt.pendingAmount)}</option>)}</select></label> : null}
              <label className="text-sm text-slate-300">Frecuencia<select className={inputClassName} value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as RecurringFrequency })}><option value="WEEKLY">Semanal</option><option value="BIWEEKLY">Quincenal</option><option value="MONTHLY">Mensual</option><option value="YEARLY">Anual</option></select></label>
              <label className="text-sm text-slate-300">Próxima ejecución<input type="date" className={inputClassName} value={form.nextRunAt} onChange={(e) => setForm({ ...form, nextRunAt: e.target.value })} required /></label>
              <label className="text-sm text-slate-300">Método de pago/recepción<input className={inputClassName} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></label>
              <label className="text-sm text-slate-300">Notas<textarea className={inputClassName} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} /></label>
              <button className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400" disabled={createMutation.isPending}>Crear recurrente</button>
            </div>
          </form>

          <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold">Listado</h2>
              <button onClick={() => generateDueMutation.mutate()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10"><Wand2 size={16} /> Generar vencidos</button>
            </div>

            <FiltersPanel title="Filtros de recurrentes" description="Busca por texto o filtra por tipo de movimiento." activeFiltersCount={[searchTerm, kindFilter].filter(Boolean).length} totalCount={recurringMovements.length} filteredCount={filteredMovements.length} onClear={() => { setSearchTerm(''); setKindFilter(''); }}>
              <label className="text-sm text-slate-300"><span className="mb-1 flex items-center gap-2"><Search size={15} /> Buscar</span><input className={inputClassName} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></label>
              <label className="text-sm text-slate-300">Tipo<select className={inputClassName} value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}><option value="">Todos</option><option value="INCOME">Ingresos</option><option value="EXPENSE">Gastos</option><option value="DEBT_PAYMENT">Pagos deuda</option></select></label>
            </FiltersPanel>

            <div className="mt-5 space-y-4">
              {filteredMovements.length ? filteredMovements.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-400">{kindLabels[item.kind]}</span>
                      <h3 className="mt-2 text-lg font-bold">{item.description}</h3>
                      <p className="text-sm text-slate-500">{item.category} · {frequencyLabels[item.frequency]} · próximo {item.nextRunAt.slice(0, 10)}</p>
                      {item.debt ? <p className="mt-1 text-sm text-amber-300">Deuda: {item.debt.name}</p> : null}
                    </div>
                    <strong className={item.kind === 'INCOME' ? 'text-emerald-300' : 'text-rose-300'}>{formatCurrency(item.amount)}</strong>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => generateMutation.mutate(item.id)} className="rounded-xl border border-emerald-500/70 px-3 py-2 text-sm text-emerald-300 hover:bg-emerald-500/10">Generar ahora</button>
                    <button onClick={() => handleDelete(item)} className="rounded-xl border border-rose-500/70 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/10">Eliminar</button>
                  </div>
                </article>
              )) : <EmptyState title="Sin movimientos recurrentes" description="Crea tus primeros ingresos o gastos recurrentes para alimentar el calendario financiero." />}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
