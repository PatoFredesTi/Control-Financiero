import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Budget, CreateBudgetInput } from '../types/budget';

const categories = [
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

const now = new Date();

type BudgetFormProps = {
  onSubmit: (input: CreateBudgetInput) => void;
  isSubmitting?: boolean;
  initialData?: Budget | null;
  onCancelEdit?: () => void;
};

export function BudgetForm({ onSubmit, isSubmitting, initialData, onCancelEdit }: BudgetFormProps) {
  const isEditing = Boolean(initialData);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBudgetInput>({
    defaultValues: {
      category: 'Alimentación',
      amount: 1,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      notes: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        category: initialData.category,
        amount: initialData.amount,
        month: initialData.month,
        year: initialData.year,
        notes: initialData.notes ?? '',
      });
      return;
    }

    reset({ category: 'Alimentación', amount: 1, month: now.getMonth() + 1, year: now.getFullYear(), notes: '' });
  }, [initialData, reset]);

  function submit(input: CreateBudgetInput) {
    onSubmit(input);
    if (!isEditing) {
      reset({ category: 'Alimentación', amount: 1, month: now.getMonth() + 1, year: now.getFullYear(), notes: '' });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h2>
          <p className="mt-1 text-sm text-slate-400">Define límites mensuales por categoría.</p>
        </div>
        {isEditing && onCancelEdit && (
          <button type="button" onClick={onCancelEdit} className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">
            Cancelar
          </button>
        )}
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Categoría</span>
          <select className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('category', { required: true })}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Monto límite</span>
          <input type="number" min={1} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('amount', { valueAsNumber: true, min: { value: 1, message: 'El monto debe ser mayor a cero' } })} />
          {errors.amount && <span className="text-sm text-rose-300">{errors.amount.message}</span>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Mes</span>
            <input type="number" min={1} max={12} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('month', { valueAsNumber: true, min: 1, max: 12 })} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Año</span>
            <input type="number" min={2000} max={2100} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('year', { valueAsNumber: true, min: 2000, max: 2100 })} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Notas</span>
          <textarea rows={3} className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" placeholder="Opcional" {...register('notes')} />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear presupuesto'}
      </button>
    </form>
  );
}
