import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { CreateDebtInput, Debt, DebtStatus } from '../types/debt';

const debtSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  creditor: z.string().optional(),
  description: z.string().optional(),
  initialAmount: z
    .number()
    .int('El monto debe ser un número entero.')
    .min(1, 'El monto debe ser mayor a cero.'),
  startDate: z.string().min(1, 'Selecciona una fecha de inicio.'),
  estimatedEndDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAID', 'OVERDUE', 'PAUSED']).optional(),
  notes: z.string().optional(),
});

type DebtFormValues = z.infer<typeof debtSchema>;

const statusLabels: Record<DebtStatus, string> = {
  ACTIVE: 'Activa',
  PAID: 'Pagada',
  OVERDUE: 'Vencida',
  PAUSED: 'Pausada',
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaultValues(debt?: Debt): DebtFormValues {
  return {
    name: debt?.name ?? '',
    creditor: debt?.creditor ?? '',
    description: debt?.description ?? '',
    initialAmount: debt?.initialAmount ?? 0,
    startDate: debt?.startDate ? debt.startDate.slice(0, 10) : getToday(),
    estimatedEndDate: debt?.estimatedEndDate ? debt.estimatedEndDate.slice(0, 10) : '',
    status: debt?.status ?? 'ACTIVE',
    notes: debt?.notes ?? '',
  };
}

interface DebtFormProps {
  onSubmit: (input: CreateDebtInput) => void;
  isSubmitting?: boolean;
  initialData?: Debt | null;
  onCancelEdit?: () => void;
}

export function DebtForm({ onSubmit, isSubmitting, initialData, onCancelEdit }: DebtFormProps) {
  const isEditing = Boolean(initialData);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: buildDefaultValues(initialData ?? undefined),
  });

  useEffect(() => {
    reset(buildDefaultValues(initialData ?? undefined));
  }, [initialData, reset]);

  function handleValidSubmit(values: DebtFormValues) {
    onSubmit({
      ...values,
      initialAmount: Number(values.initialAmount),
      status: isEditing ? values.status : 'ACTIVE',
      creditor: values.creditor?.trim() || undefined,
      description: values.description?.trim() || undefined,
      estimatedEndDate: values.estimatedEndDate || undefined,
      notes: values.notes?.trim() || undefined,
    });

    if (!isEditing) {
      reset(buildDefaultValues());
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleValidSubmit)}
      className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">
            {isEditing ? 'Editar deuda' : 'Nueva deuda'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isEditing
              ? 'Actualiza los datos generales de la deuda. Si ya tiene pagos, el monto inicial no puede ser menor a lo pagado.'
              : 'Registra una deuda para controlar su monto inicial, saldo pendiente y estado.'}
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

      {isEditing && initialData && initialData.paidAmount > 0 && (
        <div className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
          Esta deuda ya tiene {formatCurrency(initialData.paidAmount)} pagados. El backend protegerá que el monto inicial no baje de ese valor.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Nombre</span>
          <input
            {...register('name')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Ej: Tarjeta ABC"
          />
          {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Acreedor</span>
          <input
            {...register('creditor')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Ej: Banco, tienda, persona"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Monto inicial</span>
          <input
            type="number"
            min="1"
            {...register('initialAmount', { valueAsNumber: true })}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="100000"
          />
          {errors.initialAmount && (
            <p className="mt-1 text-xs text-rose-300">{errors.initialAmount.message}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Fecha de inicio</span>
          <input
            type="date"
            {...register('startDate')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-rose-300">{errors.startDate.message}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Fecha estimada de término</span>
          <input
            type="date"
            {...register('estimatedEndDate')}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
          />
        </label>

        {isEditing && (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Estado</span>
            <select
              {...register('status')}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            >
              {(Object.keys(statusLabels) as DebtStatus[]).map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Descripción</span>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Detalle opcional de la deuda"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-300">Notas</span>
          <textarea
            {...register('notes')}
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400"
            placeholder="Notas internas opcionales"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear deuda'}
      </button>
    </form>
  );
}
