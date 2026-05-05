import { useForm } from 'react-hook-form';
import type { CreateIncomeInput } from '../types/income';

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

type IncomeFormProps = {
  onSubmit: (input: CreateIncomeInput) => void;
  isSubmitting: boolean;
};

export function IncomeForm({ onSubmit, isSubmitting }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateIncomeInput>({
    defaultValues: {
      description: '',
      amount: 0,
      category: 'Sueldo',
      receivedAt: getToday(),
      paymentMethod: 'Transferencia',
      notes: '',
    },
  });

  function submitForm(input: CreateIncomeInput) {
    onSubmit({
      ...input,
      amount: Number(input.amount),
    });

    reset({
      description: '',
      amount: 0,
      category: 'Sueldo',
      receivedAt: getToday(),
      paymentMethod: 'Transferencia',
      notes: '',
    });
  }

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Nuevo ingreso</h2>
        <p className="mt-1 text-sm text-slate-400">
          Registra entradas de dinero como sueldo, ventas, bonos o trabajos freelance.
        </p>
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
        {isSubmitting ? 'Guardando...' : 'Crear ingreso'}
      </button>
    </form>
  );
}
