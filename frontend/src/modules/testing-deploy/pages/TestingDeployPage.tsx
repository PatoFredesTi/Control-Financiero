import { useEffect, useState } from 'react';
import { CheckCircle2, Cloud, GitBranch, ServerCog, TestTube2 } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getCiChecklist, getDeployTargets, getTestingDeployReadiness, type CiChecklist, type DeployTargets, type TestingDeployReadiness } from '../services/testingDeployService';

function ChecklistColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="mb-3 font-semibold text-slate-100">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-300">
        {items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-300" />{item}</li>)}
      </ul>
    </div>
  );
}

export function TestingDeployPage() {
  const [readiness, setReadiness] = useState<TestingDeployReadiness | null>(null);
  const [checklist, setChecklist] = useState<CiChecklist | null>(null);
  const [targets, setTargets] = useState<DeployTargets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTestingDeployReadiness(), getCiChecklist(), getDeployTargets()])
      .then(([readinessData, checklistData, targetData]) => {
        setReadiness(readinessData);
        setChecklist(checklistData);
        setTargets(targetData);
      })
      .catch(() => setError('No se pudo cargar la preparación de testing/deploy. Verifica el backend.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState title="Cargando v2.9" description="Revisando CI/CD, tests, Docker y deploy." />;
  if (error) return <ErrorState title="No se pudo cargar" message={error} />;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <PageHeader eyebrow="v2.9 — Testing y deploy" title="Preparación para producción técnica" description="Checklist para validar build, tests, Docker, CI/CD y alternativas de despliegue simple o AWS." />

        <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <article className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-200"><TestTube2 /></div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-200">Readiness score</p>
                <h2 className="text-4xl font-black text-emerald-100">{readiness?.score}/100</h2>
              </div>
            </div>
            <p className="text-sm leading-6 text-emerald-100/80">{readiness?.recommendation}</p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Áreas revisadas</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {readiness?.areas.map((area) => (
                <div key={area.area} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="font-semibold text-slate-100">{area.area}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{area.status}</p>
                  <code className="mt-3 block rounded-xl bg-slate-950 p-3 text-xs text-slate-300">{area.command}</code>
                </div>
              ))}
            </div>
          </article>
        </div>

        {checklist && (
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3"><GitBranch className="text-emerald-300" /><h2 className="text-xl font-bold">Checklist CI/CD</h2></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ChecklistColumn title="Backend" items={checklist.backend} />
              <ChecklistColumn title="Frontend" items={checklist.frontend} />
              <ChecklistColumn title="Base de datos" items={checklist.database} />
              <ChecklistColumn title="Quality gates" items={checklist.qualityGates} />
            </div>
          </article>
        )}

        {targets && (
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-3"><Cloud className="text-emerald-300" /><h2 className="text-xl font-bold">Deploy simple</h2></div>
              {Object.entries(targets.simple).map(([key, value]) => <p key={key} className="mb-2 text-sm text-slate-300"><strong>{key}:</strong> {value}</p>)}
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center gap-3"><ServerCog className="text-emerald-300" /><h2 className="text-xl font-bold">Deploy AWS</h2></div>
              {Object.entries(targets.aws).map(([key, value]) => <p key={key} className="mb-2 text-sm text-slate-300"><strong>{key}:</strong> {value}</p>)}
            </article>
          </div>
        )}
      </section>
    </main>
  );
}
