import { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed, Rocket } from 'lucide-react';
import { getProductionChecklist } from '../services/saasApi';
import { ProductionChecklistResponse } from '../types/saas';

export function LaunchReadinessPage() {
  const [checklist, setChecklist] = useState<ProductionChecklistResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getProductionChecklist().then(setChecklist).catch(() => setError('No se pudo cargar el checklist productivo.'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Rocket size={30} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.5 — Launch readiness</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Checklist de lanzamiento</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">Revisión de producto, base técnica y operación para presentar el proyecto como candidato a SaaS.</p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-3">
          {(checklist?.groups ?? []).map((group) => (
            <article key={group.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-2xl font-bold">{group.title}</h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                    {item.done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> : <CircleDashed size={18} className="mt-0.5 shrink-0 text-amber-300" />}
                    {item.label}
                  </div>
                ))}
              </div>
            </article>
          ))}
          {!checklist && !error && <p className="text-slate-400">Cargando checklist...</p>}
        </div>
      </section>
    </main>
  );
}
