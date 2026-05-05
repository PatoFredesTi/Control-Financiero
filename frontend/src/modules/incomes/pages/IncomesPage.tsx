import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CircleDollarSign, TrendingUp } from 'lucide-react';
import { IncomeCard } from '../components/IncomeCard';
import { IncomeForm } from '../components/IncomeForm';
import { createIncome, deleteIncome, getIncomes } from '../services/incomesApi';
import type { CreateIncomeInput } from '../types/income';
import { formatCurrency } from '../../../utils/formatCurrency';

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function IncomesPage() {
  const queryClient = useQueryClient();

  const incomesQuery = useQuery({
    queryKey: ['incomes'],
    queryFn: getIncomes,
  });

  const createIncomeMutation = useMutation({
    mutationFn: createIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
    },
  });

  const incomes = incomesQuery.data ?? [];
  const currentMonth = getCurrentMonthKey();
  const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
  const currentMonthIncome = incomes
    .filter((income) => income.receivedAt.slice(0, 7) === currentMonth)
    .reduce((total, income) => total + income.amount, 0);
  const categoriesCount = new Set(incomes.map((income) => income.category)).size;

  function handleCreateIncome(input: CreateIncomeInput) {
    createIncomeMutation.mutate(input);
  }

  function handleDeleteIncome(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este ingreso?');

    if (shouldDelete) {
      deleteIncomeMutation.mutate(id);
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
            <CircleDollarSign size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v0.3 — Módulo de ingresos
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Ingresos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Registra y controla tus entradas de dinero. Esta versión agrega persistencia real de ingresos en PostgreSQL mediante NestJS y Prisma.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Ingresos registrados</p>
            <p className="mt-2 text-3xl font-bold">{incomes.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Ingresos del mes</p>
            <p className="mt-2 text-3xl font-bold text-emerald-300">
              {formatCurrency(currentMonthIncome)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TrendingUp size={16} />
              Total histórico
            </div>
            <p className="mt-2 text-3xl font-bold text-sky-300">
              {formatCurrency(totalIncome)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {categoriesCount} categoría(s) utilizadas
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <IncomeForm
            onSubmit={handleCreateIncome}
            isSubmitting={createIncomeMutation.isPending}
          />

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de ingresos</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Aquí aparecerán los ingresos creados desde el formulario.
                </p>
              </div>
            </div>

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
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
                Aún no tienes ingresos registrados. Crea el primero desde el formulario.
              </div>
            )}

            <div className="grid gap-4">
              {incomes.map((income) => (
                <IncomeCard
                  key={income.id}
                  income={income}
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
