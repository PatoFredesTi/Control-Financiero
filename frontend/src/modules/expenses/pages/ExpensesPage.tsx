import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CreditCard, ReceiptText, TrendingDown } from 'lucide-react';
import { ExpenseCard } from '../components/ExpenseCard';
import { ExpenseForm } from '../components/ExpenseForm';
import { createExpense, deleteExpense, getExpenses } from '../services/expensesApi';
import type { CreateExpenseInput } from '../types/expense';
import { getDebts } from '../../debts/services/debtsApi';
import { formatCurrency } from '../../../utils/formatCurrency';

function getCurrentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export function ExpensesPage() {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });

  const debtsQuery = useQuery({
    queryKey: ['debts'],
    queryFn: getDebts,
  });

  const createExpenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const expenses = expensesQuery.data ?? [];
  const debts = debtsQuery.data ?? [];
  const currentMonth = getCurrentMonthKey();
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const currentMonthExpenses = expenses
    .filter((expense) => expense.spentAt.slice(0, 7) === currentMonth)
    .reduce((total, expense) => total + expense.amount, 0);
  const debtPaymentsCount = expenses.filter((expense) => expense.type === 'DEBT_PAYMENT').length;
  const categoriesCount = new Set(expenses.map((expense) => expense.category)).size;

  const createExpenseError = createExpenseMutation.error as {
    response?: { data?: { message?: string | string[] } };
  } | null;
  const createExpenseErrorMessage = Array.isArray(
    createExpenseError?.response?.data?.message,
  )
    ? createExpenseError?.response?.data?.message.join(' ')
    : createExpenseError?.response?.data?.message;

  function handleCreateExpense(input: CreateExpenseInput) {
    createExpenseMutation.mutate(input);
  }

  function handleDeleteExpense(id: string) {
    const shouldDelete = window.confirm('¿Seguro que quieres eliminar este gasto? Si es un pago de deuda, el monto se devolverá al saldo pendiente.');

    if (shouldDelete) {
      deleteExpenseMutation.mutate(id);
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
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400">
            <ReceiptText size={30} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-rose-400">
            v0.5 — Pago de deuda desde gastos
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Gastos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Registra gastos comunes o pagos de deuda. Cuando el gasto es de tipo pago de deuda, el sistema descuenta automáticamente el monto del saldo pendiente de la deuda asociada.
          </p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Gastos registrados</p>
            <p className="mt-2 text-3xl font-bold">{expenses.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Gastos del mes</p>
            <p className="mt-2 text-3xl font-bold text-rose-300">
              {formatCurrency(currentMonthExpenses)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TrendingDown size={16} />
              Total histórico
            </div>
            <p className="mt-2 text-3xl font-bold text-orange-300">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {categoriesCount} categoría(s) utilizadas
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <CreditCard size={16} />
              Pagos de deuda
            </div>
            <p className="mt-2 text-3xl font-bold text-amber-300">{debtPaymentsCount}</p>
            <p className="mt-2 text-xs text-slate-500">
              Descuentan saldo automáticamente
            </p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px_1fr]">
          <ExpenseForm
            debts={debts}
            onSubmit={handleCreateExpense}
            isSubmitting={createExpenseMutation.isPending}
            errorMessage={createExpenseErrorMessage}
          />

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Listado de gastos</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Aquí aparecerán los gastos creados desde el formulario.
                </p>
              </div>
            </div>

            {expensesQuery.isLoading && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
                Cargando gastos...
              </div>
            )}

            {expensesQuery.isError && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-rose-200">
                No se pudieron cargar los gastos. Revisa que el backend esté activo y que Prisma tenga la migración aplicada.
              </div>
            )}

            {debtsQuery.isError && (
              <div className="mb-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-200">
                No se pudieron cargar las deudas para el selector de pagos.
              </div>
            )}

            {!expensesQuery.isLoading && !expensesQuery.isError && expenses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
                Aún no tienes gastos registrados. Crea el primero desde el formulario.
              </div>
            )}

            <div className="grid gap-4">
              {expenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
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
