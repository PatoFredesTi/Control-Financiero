import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { DebtCard } from '../components/DebtCard';
import { DebtForm } from '../components/DebtForm';
import { createDebt, deleteDebt, getDebts } from '../services/debtsApi';
import type { CreateDebtInput } from '../types/debt';
import { formatCurrency } from '../../../utils/formatCurrency';

export function DebtsPage() {
  const queryClient = useQueryClient();

  const debtsQuery = useQuery({
    queryKey: ['debts'],
    queryFn: getDebts,
  });

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const deleteDebtMutation = useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const debts = debtsQuery.data ?? [];
  const totalPending = debts.reduce((total, debt) => total + debt.pendingAmount, 0);
  const activeDebts = debts.filter((debt) => debt.status === 'ACTIVE').length;

  function handleCreateDebt(input: CreateDebtInput) {
    createDebtMutation.mutate(input);
  }

  function handleDeleteDebt(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar esta deuda?');

    if (shouldDelete) {
      deleteDebtMutation.mutate(id);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
      <section className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
            <CreditCard size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v0.2 — Módulo de deudas
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Deudas</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Crea y controla tus deudas. En esta versión ya existe persistencia real en PostgreSQL mediante NestJS y Prisma.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Deudas registradas</p>
            <p className="mt-2 text-3xl font-bold">{debts.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Deudas activas</p>
            <p className="mt-2 text-3xl font-bold text-sky-300">{activeDebts}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total pendiente</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">
              {formatCurrency(totalPending)}
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <DebtForm
            onSubmit={handleCreateDebt}
            isSubmitting={createDebtMutation.isPending}
          />

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de deudas</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Aquí aparecerán las deudas creadas desde el formulario.
                </p>
              </div>
            </div>

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
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
                Aún no tienes deudas registradas. Crea la primera desde el formulario.
              </div>
            )}

            <div className="grid gap-4">
              {debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
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
