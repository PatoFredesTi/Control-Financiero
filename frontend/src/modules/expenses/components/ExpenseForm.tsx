import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import type { Debt } from '../../debts/types/debt';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { CreateExpenseInput, Expense, ExpenseType } from '../types/expense';

const commonExpenseCategories = [
  'Alimentación',
  'Transporte',
  'Arriendo / Dividendo',
  'Servicios básicos',
  'Internet / Telefonía',
  'Salud',
  'Educación',
  'Mascotas',
  'Ocio',
  'Compras',
  'Suscripciones',
  'Otros',
];

const paymentMethods = [
  'Transferencia',
  'Efectivo',
  'Tarjeta de débito',
  'Tarjeta de crédito',
  'Otro',
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultValues(expense?: Expense): CreateExpenseInput {
  return {
    description: expense?.description ?? '',
    amount: expense?.amount ?? 0,
    category: expense?.type === 'DEBT_PAYMENT' ? 'Pago de deuda' : expense?.category ?? 'Alimentación',
    spentAt: expense?.spentAt ? expense.spentAt.slice(0, 10) : getToday(),
    paymentMethod: expense?.paymentMethod ?? 'Transferencia',
    type: expense?.type ?? 'COMMON',
    debtId: expense?.debtId ?? '',
    notes: expense?.notes ?? '',
  };
}

type ExpenseFormProps = {
  debts: Debt[];
  onSubmit: (input: CreateExpenseInput) => void;
  isSubmitting: boolean;
  errorMessage?: string;
  initialData?: Expense | null;
  onCancelEdit?: () => void;
};

export function ExpenseForm({
  debts,
  onSubmit,
  isSubmitting,
  errorMessage,
  initialData,
  onCancelEdit,
}: ExpenseFormProps) {
  const isEditing = Boolean(initialData);

  const selectableDebts = useMemo(
    () =>
      debts.filter(
        (debt) =>
          debt.status === 'ACTIVE' ||
          debt.status === 'OVERDUE' ||
          debt.id === initialData?.debtId,
      ),
    [debts, initialData?.debtId],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    defaultValues: buildDefaultValues(initialData ?? undefined),
  });

  useEffect(() => {
    reset(buildDefaultValues(initialData ?? undefined));
  }, [initialData, reset]);

  const selectedType = watch('type');
  const selectedDebtId = watch('debtId');
  const selectedDebt = selectableDebts.find((debt) => debt.id === selectedDebtId);
  const availableDebtPaymentAmount = selectedDebt
    ? selectedDebt.pendingAmount + (initialData?.type === 'DEBT_PAYMENT' && initialData.debtId === selectedDebt.id ? initialData.amount : 0)
    : 0;

  function handleTypeChange(type: ExpenseType) {
    setValue('type', type);

    if (type === 'COMMON') {
      setValue('category', 'Alimentación');
      setValue('debtId', '');
      return;
    }

    setValue('category', 'Pago de deuda');
  }

  function submitForm(input: CreateExpenseInput) {
    const payload: CreateExpenseInput = {
      ...input,
      amount: Number(input.amount),
      category: input.type === 'DEBT_PAYMENT' ? 'Pago de deuda' : input.category,
      debtId: input.type === 'DEBT_PAYMENT' ? input.debtId : undefined,
      notes: input.notes?.trim() || undefined,
      paymentMethod: input.paymentMethod?.trim() || undefined,
    };

    onSubmit(payload);

    if (!isEditing) {
      reset(buildDefaultValues());
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar gasto' : 'Nuevo gasto'}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isEditing
              ? 'Edita gastos comunes o pagos de deuda. El backend revierte y reaplica pagos para mantener saldos correctos.'
              : 'Registra gastos comunes o marca un gasto como pago de deuda para descontar automáticamente su saldo.'}
          </p>
        </div>
        {isEditing && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"
          >
            Cancelar
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">
          {errorMessage}
        </div>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleTypeChange('COMMON')}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
            selectedType === 'COMMON'
              ? 'border-rose-400 bg-rose-500/10 text-rose-200'
              : 'border-slate-700 text-slate-400 hover:border-rose-400/60'
          }`}
        >
          Gasto común
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('DEBT_PAYMENT')}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
            selectedType === 'DEBT_PAYMENT'
              ? 'border-amber-400 bg-amber-500/10 text-amber-200'
              : 'border-slate-700 text-slate-400 hover:border-amber-400/60'
          }`}
        >
          Pago de deuda
        </button>
      </div>

      <input type="hidden" {...register('type')} />

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Descripción</span>
          <input
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Ej: Supermercado / Pago tarjeta ABC"
            {...register('description', { required: 'La descripción es obligatoria' })}
          />
          {errors.description && (
            <span className="text-sm text-rose-300">{errors.description.message}</span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Monto</span>
          <input
            type="number"
            min={1}
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Ej: 45000"
            {...register('amount', {
              valueAsNumber: true,
              min: { value: 1, message: 'El monto debe ser mayor a cero' },
              validate: (value) => {
                if (selectedType === 'DEBT_PAYMENT' && selectedDebt && Number(value) > availableDebtPaymentAmount) {
                  return 'El pago no puede superar el saldo disponible de la deuda';
                }

                return true;
              },
            })}
          />
          {errors.amount && (
            <span className="text-sm text-rose-300">{errors.amount.message}</span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Categoría</span>
          <select
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            {...register('category', { required: true })}
          >
            {selectedType === 'DEBT_PAYMENT' ? (
              <option value="Pago de deuda">Pago de deuda</option>
            ) : (
              commonExpenseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            )}
          </select>
        </label>

        {selectedType === 'DEBT_PAYMENT' && (
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Deuda asociada</span>
            <select
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
              {...register('debtId', {
                required: selectedType === 'DEBT_PAYMENT'
                  ? 'Debes seleccionar una deuda'
                  : false,
              })}
            >
              <option value="">Selecciona una deuda</option>
              {selectableDebts.map((debt) => (
                <option key={debt.id} value={debt.id}>
                  {debt.name} — disponible: {formatCurrency(
                    debt.pendingAmount + (initialData?.type === 'DEBT_PAYMENT' && initialData.debtId === debt.id ? initialData.amount : 0),
                  )}
                </option>
              ))}
            </select>
            {errors.debtId && (
              <span className="text-sm text-rose-300">{errors.debtId.message}</span>
            )}
            {selectableDebts.length === 0 && (
              <span className="text-sm text-amber-300">
                No tienes deudas activas. Crea una deuda antes de registrar pagos.
              </span>
            )}
            {selectedDebt && (
              <span className="text-xs text-slate-400">
                Monto disponible para este pago: {formatCurrency(availableDebtPaymentAmount)}.
              </span>
            )}
          </label>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Fecha del gasto</span>
          <input
            type="date"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            {...register('spentAt', { required: 'La fecha es obligatoria' })}
          />
          {errors.spentAt && (
            <span className="text-sm text-rose-300">{errors.spentAt.message}</span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Método de pago</span>
          <select
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            {...register('paymentMethod')}
          >
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Notas</span>
          <textarea
            rows={3}
            className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Opcional"
            {...register('notes')}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (selectedType === 'DEBT_PAYMENT' && selectableDebts.length === 0)}
        className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear gasto'}
      </button>
    </form>
  );
}
