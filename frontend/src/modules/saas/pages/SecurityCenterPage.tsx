import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { getAuditLogs, getAuditSummary, getSecurityReadiness } from '../services/saasApi';
import { AuditLogItem, AuditSummaryResponse, SecurityReadinessResponse } from '../types/saas';

export function SecurityCenterPage() {
  const [security, setSecurity] = useState<SecurityReadinessResponse | null>(null);
  const [summary, setSummary] = useState<AuditSummaryResponse | null>(null);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSecurityReadiness(), getAuditSummary(), getAuditLogs()])
      .then(([securityData, summaryData, logData]) => {
        setSecurity(securityData);
        setSummary(summaryData);
        setLogs(logData);
      })
      .catch(() => setError('No se pudo cargar el centro de seguridad.'));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><ShieldCheck size={30} /></div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.5 — Security readiness</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Centro de seguridad</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            Vista para revisar preparación de seguridad, recomendaciones previas a usuarios reales y eventos de auditoría básicos.
          </p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>}

        <div className="mb-6 grid gap-5 md:grid-cols-4">
          <Metric title="Score seguridad" value={`${security?.score ?? 0}/100`} />
          <Metric title="Estado" value={security?.status ?? 'cargando'} />
          <Metric title="Eventos auditados" value={String(summary?.total ?? 0)} />
          <Metric title="Críticos" value={String(summary?.bySeverity.critical ?? 0)} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3"><CheckCircle2 className="text-emerald-300" /><h2 className="text-2xl font-bold">Implementado</h2></div>
            <div className="space-y-3">
              {(security?.implemented ?? []).map((item) => <InfoRow key={item} icon="ok" text={item} />)}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center gap-3"><AlertTriangle className="text-amber-300" /><h2 className="text-2xl font-bold">Antes de usuarios reales</h2></div>
            <div className="space-y-3">
              {(security?.recommendedBeforeRealUsers ?? []).map((item) => <InfoRow key={item} icon="warn" text={item} />)}
            </div>
          </article>
        </div>

        <article className="mt-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center gap-3"><ClipboardCheck className="text-emerald-300" /><h2 className="text-2xl font-bold">Audit log reciente</h2></div>
          <p className="mb-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">{summary?.recommendation ?? 'Cargando recomendación...'}</p>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">{log.severity}</span>
                  <strong className="text-slate-100">{log.action}</strong>
                  <span>en {log.entity}</span>
                </div>
                <p className="text-slate-400">Actor: {log.actor} · {new Date(log.createdAt).toLocaleString('es-CL')}</p>
                {log.metadata && <p className="mt-2 text-slate-400">{log.metadata}</p>}
              </div>
            ))}
            {logs.length === 0 && !error && <p className="text-slate-400">No hay eventos de auditoría para mostrar.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{title}</p><p className="mt-2 text-2xl font-black text-emerald-300">{value}</p></div>;
}

function InfoRow({ icon, text }: { icon: 'ok' | 'warn'; text: string }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">{icon === 'ok' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />} {text}</div>;
}
