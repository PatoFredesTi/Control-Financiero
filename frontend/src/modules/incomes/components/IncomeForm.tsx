import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateIncomeInput, Income } from '../types/income';

const incomeCategories = [
  'Sueldo',
  'Freelance',
  'Bonos',
  'Ventas',
  'Inversiones',
  'Reembolsos',
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

function buildDefaultValues(income?: Income): CreateIncomeInput {
  return {
    description: income?.description ?? '',
    amount: income?.amount ?? 0,
    category: income?.category ?? 'Sueldo',
    receivedAt: income?.receivedAt ? income.receivedAt.slice(0, 10) : getToday(),
    paymentMethod: income?.paymentMethod ?? 'Transferencia',
    notes: income?.notes ?? '',
  };
}

type IncomeFormProps = {
  onSubmit: (input: CreateIncomeInput) => void;
  isSubmitting: boolean;
  initialData?: Income | null;
  onCancelEdit?: () => void;
};

export function IncomeForm({ onSubmit, isSubmitting, initialData, onCancelEdit }: IncomeFormProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateIncomeInput>({
    defaultValues: buildDefaultValues(initialData ?? undefined),
  });

  useEffect(() => {
    reset(buildDefaultValues(initialData ?? undefined));
  }, [initialData, reset]);

  function submitForm(input: CreateIncomeInput) {
    onSubmit({
      ...input,
      amount: Number(input.amount),
      notes: input.notes?.trim() || undefined,
      paymentMethod: input.paymentMethod?.trim() || undefined,
    });

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
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar ingreso' : 'Nuevo ingreso'}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isEditing
              ? 'Actualiza los datos de este ingreso. Los cambios se verán reflejados en dashboard y gráficos.'
              : 'Registra entradas de dinero como sueldo, ventas, bonos o trabajos freelance.'}
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

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Descripción</span>
          <input
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Ej: Sueldo abril"
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
            placeholder="Ej: 1200000"
            {...register('amount', {
              valueAsNumber: true,
              min: { value: 1, message: 'El monto debe ser mayor a cero' },
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
            {incomeCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Fecha de recepción</span>
          <input
            type="date"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            {...register('receivedAt', { required: 'La fecha es obligatoria' })}
          />
          {errors.receivedAt && (
            <span className="text-sm text-rose-300">{errors.receivedAt.message}</span>
          )}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Método de recepción</span>
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
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear ingreso'}
      </button>
    </form>
  );
}
