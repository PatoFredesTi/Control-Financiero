import { type FormEvent, useState } from 'react';
import { Edit2, PlusCircle, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { CreateGoalContributionInput, SavingsGoal } from '../types/savingsGoal';

const statusLabels = {
  ACTIVE: 'Activa',
  COMPLETED: 'Completada',
  PAUSED: 'Pausada',
};

type SavingsGoalCardProps = {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
  onDelete: (id: string) => void;
  onAddContribution: (id: string, input: CreateGoalContributionInput) => void;
  isAddingContribution?: boolean;
};

export function SavingsGoalCard({ goal, onEdit, onDelete, onAddContribution, isAddingContribution }: SavingsGoalCardProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const progress = Math.min(goal.progressPercentage, 100);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    onAddContribution(goal.id, { amount: parsedAmount, contributedAt: today, notes });
    setAmount('');
    setNotes('');
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{statusLabels[goal.status]}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-100">{goal.name}</h3>
          {goal.description && <p className="mt-1 text-sm text-slate-400">{goal.description}</p>}
          {goal.targetDate && <p className="mt-2 text-xs text-slate-500">Fecha objetivo: {new Date(goal.targetDate).toLocaleDateString('es-CL')}</p>}
        </div>
        <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200">{goal.progressPercentage}%</span>
      </div>

      <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
        <div><span className="block text-xs text-slate-500">Objetivo</span>{formatCurrency(goal.targetAmount)}</div>
        <div><span className="block text-xs text-slate-500">Ahorrado</span>{formatCurrency(goal.currentAmount)}</div>
        <div><span className="block text-xs text-slate-500">Falta</span>{formatCurrency(goal.remainingAmount)}</div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} />
      </div>

      {goal.status !== 'COMPLETED' && goal.status !== 'PAUSED' && (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 md:grid-cols-[1fr_1.2fr_auto]">
          <input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min={1} placeholder="Aporte" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notas opcionales" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400" />
          <button disabled={isAddingContribution} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"><PlusCircle size={16} /> Aportar</button>
        </form>
      )}

      {goal.contributions.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-300">Últimos aportes</p>
          <div className="grid gap-2">
            {goal.contributions.slice(0, 3).map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between gap-4 text-sm text-slate-400">
                <span>{new Date(contribution.contributedAt).toLocaleDateString('es-CL')}</span>
                <strong className="text-emerald-300">{formatCurrency(contribution.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={() => onEdit(goal)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><Edit2 size={15} /> Editar</button>
        <button onClick={() => onDelete(goal.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/10"><Trash2 size={15} /> Eliminar</button>
      </div>
    </article>
  );
}
