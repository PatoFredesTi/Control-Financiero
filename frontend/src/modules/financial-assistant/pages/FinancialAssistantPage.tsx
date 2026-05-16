import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BrainCircuit, CheckCircle2, ClipboardList, Lightbulb, ShieldAlert, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { PageHeader } from '../../../components/ui/PageHeader';
import { SectionCard } from '../../../components/ui/SectionCard';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { getMonthlyBriefing } from '../services/financialAssistantApi';
import type { FinancialRuleResult } from '../types/financialAssistant';

const severityClasses: Record<string, string> = {
  CRITICAL: 'border-rose-500/40 bg-rose-500/10 text-rose-200',
  WARNING: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  INFO: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  POSITIVE: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
};

const priorityClasses: Record<string, string> = {
  HIGH: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-100 border-amber-500/30',
  LOW: 'bg-sky-500/15 text-sky-100 border-sky-500/30',
};

function RuleCard({ rule }: { rule: FinancialRuleResult }) {
  const Icon = rule.severity === 'CRITICAL' ? ShieldAlert : rule.severity === 'WARNING' ? AlertTriangle : rule.severity === 'POSITIVE' ? CheckCircle2 : Lightbulb;
  return (
    <article className={`rounded-2xl border p-4 ${severityClasses[rule.severity]}`}>
      <div className="mb-3 flex items-start gap-3">
        <Icon className="mt-1 shrink-0" size={20} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{rule.area} · {rule.severity}</p>
          <h3 className="mt-1 font-bold">{rule.title}</h3>
        </div>
      </div>
      <p className="text-sm leading-6 opacity-90">{rule.description}</p>
      <p className="mt-3 text-sm font-semibold">{rule.recommendation}</p>
    </article>
  );
}

export function FinancialAssistantPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const query = useQuery({
    queryKey: ['financial-assistant', month, year],
    queryFn: () => getMonthlyBriefing(month, year),
  });

  if (query.isLoading) return <LoadingState title="Generando diagnóstico financiero" description="Estamos evaluando reglas, riesgos y oportunidades del mes." />;
  if (query.isError) return <ErrorState title="No se pudo cargar el asistente" message={getApiErrorMessage(query.error)} />;

  const briefing = query.data!;
  const context = briefing.context;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <PageHeader
          eyebrow="v2.7 + v2.8"
          title="Asistente financiero"
          description="Diagnóstico mensual, reglas activadas, riesgos principales y plan de acción para mejorar tu control financiero."
        />

        <div className="mb-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="text-sm text-slate-300">
            Mes
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-emerald-500">
              {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-300">
            Año
            <input value={year} type="number" onChange={(event) => setYear(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-emerald-500" />
          </label>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Score: <strong className="text-xl">{briefing.score.score}/100</strong> · {briefing.score.level}
          </div>
        </div>

        <section className="mb-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-400/20 p-3 text-emerald-200"><BrainCircuit size={28} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Briefing mensual</p>
              <h2 className="mt-2 text-2xl font-bold text-emerald-50">{briefing.headline}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-6 text-emerald-100/80">El asistente usa reglas internas para detectar riesgos, oportunidades y acciones concretas. No reemplaza asesoría financiera profesional, pero ayuda a ordenar prioridades.</p>
            </div>
          </div>
        </section>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Ingresos del mes" value={formatCurrency(context.monthlyIncome ?? 0)} tone="success" />
          <StatCard label="Gastos del mes" value={formatCurrency(context.monthlyExpenses ?? 0)} tone="danger" />
          <StatCard label="Tasa de ahorro" value={`${briefing.ratios.savingsRate}%`} tone={briefing.ratios.savingsRate >= 10 ? 'success' : 'warning'} />
          <StatCard label="Uso de crédito" value={`${briefing.ratios.creditUtilization}%`} tone={briefing.ratios.creditUtilization >= 70 ? 'danger' : 'info'} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-100">Riesgos y oportunidades</h2>
              <p className="mt-1 text-sm text-slate-400">Reglas financieras activadas por prioridad.</p>
            </div>
            <div className="grid gap-4">
              {briefing.rules.length ? briefing.rules.map((rule) => <RuleCard key={rule.id} rule={rule} />) : <p className="text-sm text-slate-400">No hay reglas activadas todavía.</p>}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-100">Plan de acción mensual</h2>
              <p className="mt-1 text-sm text-slate-400">Acciones sugeridas para mejorar este mes.</p>
            </div>
            <div className="grid gap-4">
              {briefing.actionPlan.length ? briefing.actionPlan.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <ClipboardList className="mt-1 text-emerald-300" size={20} />
                      <div>
                        <h3 className="font-bold text-slate-100">{item.title}</h3>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{item.area}</p>
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${priorityClasses[item.priority]}`}>{item.priority}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">{item.description}</p>
                  <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-300"><Sparkles size={14} />{item.expectedImpact}</p>
                </article>
              )) : <p className="text-sm text-slate-400">No hay acciones críticas. Mantén tus registros actualizados.</p>}
            </div>
          </SectionCard>
        </div>
      </section>
    </main>
  );
}
