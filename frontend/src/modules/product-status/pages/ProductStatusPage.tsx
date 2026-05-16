import { useEffect, useState } from 'react';
import { CheckCircle2, CircleDashed, Rocket, ServerCog, Wrench } from 'lucide-react';
import {
  getLaunchChecklist,
  getProductStatus,
  getQualityReport,
  LaunchChecklistResponse,
  ProductStatusResponse,
  QualityReportResponse,
} from '../services/productStatusApi';

export function ProductStatusPage() {
  const [status, setStatus] = useState<ProductStatusResponse | null>(null);
  const [checklist, setChecklist] = useState<LaunchChecklistResponse | null>(null);
  const [qualityReport, setQualityReport] = useState<QualityReportResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProductStatus(), getLaunchChecklist(), getQualityReport()])
      .then(([statusData, checklistData, qualityReportData]) => {
        setStatus(statusData);
        setChecklist(checklistData);
        setQualityReport(qualityReportData);
      })
      .catch(() => setError('No se pudo cargar el estado del producto. Revisa que el backend esté ejecutándose.'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <Rocket size={30} />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.6 — Technical stabilization</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Estado de producto</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Vista técnica para revisar capacidades completadas, checklist de lanzamiento, stack recomendado y reporte de calidad base para seguir escalando el proyecto.
          </p>
          {status?.releaseFocus ? <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">{status.releaseFocus}</p> : null}
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <ServerCog className="text-emerald-300" />
              <h2 className="text-2xl font-bold">Capacidades completadas</h2>
            </div>
            <div className="space-y-3">
              {(status?.completedCapabilities ?? []).map((capability) => (
                <div key={capability} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> {capability}
                </div>
              ))}
              {!status && !error && <p className="text-slate-400">Cargando estado del producto...</p>}
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-5 text-2xl font-bold">Checklist de lanzamiento</h2>
            <div className="space-y-3">
              {(checklist?.checklist ?? []).map((item) => (
                <div key={item.item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                  {item.done ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> : <CircleDashed size={18} className="mt-0.5 shrink-0 text-amber-300" />}
                  <span>{item.item}</span>
                </div>
              ))}
              {!checklist && !error && <p className="text-slate-400">Cargando checklist...</p>}
            </div>
          </aside>
        </div>

        {qualityReport && (
          <article className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3">
              <Wrench className="text-emerald-300" />
              <h2 className="text-2xl font-bold">Reporte de calidad v2.6</h2>
            </div>
            <p className="mb-6 text-sm leading-6 text-slate-400">{qualityReport.qualityFocus}</p>
            <div className="grid gap-5 md:grid-cols-2">
              <QualityColumn title="Backend mejorado" items={qualityReport.backend.improvements} />
              <QualityColumn title="Frontend mejorado" items={qualityReport.frontend.improvements} />
              <QualityColumn title="Siguiente hardening backend" items={qualityReport.backend.nextHardening} muted />
              <QualityColumn title="Siguiente hardening frontend" items={qualityReport.frontend.nextHardening} muted />
            </div>
            <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              Riesgo técnico actual: <strong>{qualityReport.riskLevel}</strong>. {qualityReport.recommendation}
            </div>
          </article>
        )}

        {status && (
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <StackCard title="Frontend" items={status.recommendedProductionStack.frontend} />
            <StackCard title="Backend" items={status.recommendedProductionStack.backend} />
            <StackCard title="Base de datos" items={status.recommendedProductionStack.database} />
          </div>
        )}
      </section>
    </main>
  );
}

function QualityColumn({ title, items, muted = false }: { title: string; items: string[]; muted?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${muted ? 'border-slate-800 bg-slate-950/70' : 'border-emerald-500/20 bg-emerald-500/10'}`}>
      <h3 className="mb-3 font-bold text-slate-100">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-400">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

function StackCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <ul className="space-y-2 text-sm text-slate-400">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </article>
  );
}
