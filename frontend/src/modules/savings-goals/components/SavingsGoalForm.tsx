import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { CreateSavingsGoalInput, SavingsGoal } from '../types/savingsGoal';

const today = new Date().toISOString().slice(0, 10);

type SavingsGoalFormProps = {
  onSubmit: (input: CreateSavingsGoalInput) => void;
  isSubmitting?: boolean;
  initialData?: SavingsGoal | null;
  onCancelEdit?: () => void;
};

export function SavingsGoalForm({ onSubmit, isSubmitting, initialData, onCancelEdit }: SavingsGoalFormProps) {
  const isEditing = Boolean(initialData);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateSavingsGoalInput>({
    defaultValues: { name: '', description: '', targetAmount: 1, currentAmount: 0, targetDate: '', notes: '' },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description ?? '',
        targetAmount: initialData.targetAmount,
        currentAmount: initialData.currentAmount,
        targetDate: initialData.targetDate?.slice(0, 10) ?? '',
        notes: initialData.notes ?? '',
      });
      return;
    }
    reset({ name: '', description: '', targetAmount: 1, currentAmount: 0, targetDate: '', notes: '' });
  }, [initialData, reset]);

  function submit(input: CreateSavingsGoalInput) {
    onSubmit({
      ...input,
      currentAmount: input.currentAmount ?? 0,
      targetDate: input.targetDate || undefined,
      description: input.description || undefined,
      notes: input.notes || undefined,
    });
    if (!isEditing) reset({ name: '', description: '', targetAmount: 1, currentAmount: 0, targetDate: '', notes: '' });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{isEditing ? 'Editar meta' : 'Nueva meta'}</h2>
          <p className="mt-1 text-sm text-slate-400">Define objetivos de ahorro y registra avances.</p>
        </div>
        {isEditing && onCancelEdit && <button type="button" onClick={onCancelEdit} className="rounded-xl border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">Cancelar</button>}
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Nombre</span>
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" placeholder="Ej: Fondo de emergencia" {...register('name', { required: 'El nombre es obligatorio' })} />
          {errors.name && <span className="text-sm text-rose-300">{errors.name.message}</span>}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Descripción</span>
          <input className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" placeholder="Opcional" {...register('description')} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Monto objetivo</span>
            <input type="number" min={1} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('targetAmount', { valueAsNumber: true, min: { value: 1, message: 'Debe ser mayor a cero' } })} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-300">Ahorrado inicial</span>
            <input type="number" min={0} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('currentAmount', { valueAsNumber: true, min: 0 })} />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Fecha objetivo</span>
          <input type="date" min={today} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" {...register('targetDate')} />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-300">Notas</span>
          <textarea rows={3} className="resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" placeholder="Opcional" {...register('notes')} />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-6 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear meta'}
      </button>
    </form>
  );
}
