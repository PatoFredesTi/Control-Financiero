import { useEffect, useState } from 'react';
import { CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { getSaasPlans } from '../services/saasApi';
import { SaasPlansResponse } from '../types/saas';
import { formatCurrency } from '../../../utils/formatCurrency';

export function PricingPage() {
  const [plans, setPlans] = useState<SaasPlansResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSaasPlans().then(setPlans).catch(() => setError('No se pudieron cargar los planes simulados.'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Crown size={30} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.5 — SaaS premium</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Planes simulados</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Página de precios preparada para presentar el proyecto como producto SaaS. Los planes son simulados y no realizan cobros reales.
          </p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}
        {plans?.billingNote && <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">{plans.billingNote}</p>}

        <div className="grid gap-6 lg:grid-cols-3">
          {(plans?.plans ?? []).map((plan) => (
            <article key={plan.id} className={`relative rounded-3xl border p-6 shadow-2xl ${plan.recommended ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-800 bg-slate-900'}`}>
              {plan.recommended && (
                <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-950">
                  <Sparkles size={14} /> Recomendado
                </div>
              )}
              <h2 className="mb-2 text-2xl font-bold">{plan.name}</h2>
              <p className="mb-5 min-h-12 text-sm leading-6 text-slate-300">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-black">{formatCurrency(plan.price)}</span>
                <span className="text-slate-400"> / mes</span>
              </div>
              <h3 className="mb-3 font-semibold text-slate-200">Incluye</h3>
              <div className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-300" /> {feature}
                  </div>
                ))}
              </div>
              <h3 className="mb-3 font-semibold text-slate-200">Límites</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                {plan.limits.map((limit) => <li key={limit}>• {limit}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
