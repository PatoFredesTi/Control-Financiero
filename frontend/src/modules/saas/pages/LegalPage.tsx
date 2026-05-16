import { useEffect, useState } from 'react';
import { FileText, Shield } from 'lucide-react';
import { getLegalPack } from '../services/saasApi';
import { LegalPackResponse } from '../types/saas';

export function LegalPage() {
  const [legal, setLegal] = useState<LegalPackResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getLegalPack().then(setLegal).catch(() => setError('No se pudo cargar el paquete legal base.'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><FileText size={30} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.5 — Legal pack</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Términos y privacidad base</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">Contenido base para presentar el proyecto como producto. Está pensado para portafolio, no como documento legal definitivo.</p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}
        {legal?.disclaimer && <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">{legal.disclaimer}</div>}

        <div className="grid gap-6 lg:grid-cols-2">
          <LegalCard title="Resumen de términos" items={legal?.termsSummary ?? []} />
          <LegalCard title="Resumen de privacidad" items={legal?.privacySummary ?? []} icon="shield" />
        </div>

        <article className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-3 text-2xl font-bold">Retención de datos</h2>
          <p className="leading-7 text-slate-300">{legal?.dataRetention ?? 'Cargando política de retención...'}</p>
        </article>
      </section>
    </main>
  );
}

function LegalCard({ title, items, icon }: { title: string; items: string[]; icon?: 'shield' }) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex items-center gap-3">{icon === 'shield' ? <Shield className="text-emerald-300" /> : <FileText className="text-emerald-300" />}<h2 className="text-2xl font-bold">{title}</h2></div>
      <div className="space-y-3">
        {items.map((item) => <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-300">{item}</div>)}
        {items.length === 0 && <p className="text-slate-400">Cargando información...</p>}
      </div>
    </article>
  );
}
