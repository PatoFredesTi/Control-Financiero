import { useEffect, useState } from 'react';
import { ShieldCheck, KeyRound, Download, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { LoadingState } from '../../../components/ui/LoadingState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { getHardeningReport, getSessionPolicy, requestDataExport, requestPasswordRecovery, type HardeningReport, type SessionPolicy } from '../services/securityService';

export function SecurityHardeningPage() {
  const [report, setReport] = useState<HardeningReport | null>(null);
  const [policy, setPolicy] = useState<SessionPolicy | null>(null);
  const [email, setEmail] = useState('demo@controlfinanciero.app');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHardeningReport(), getSessionPolicy()])
      .then(([hardening, session]) => {
        setReport(hardening);
        setPolicy(session);
      })
      .catch(() => setError('No se pudo cargar el reporte de seguridad. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRecovery() {
    setMessage(null);
    const result = await requestPasswordRecovery(email);
    setMessage(`Token demo generado: ${result.token}. ${result.message}`);
  }

  async function handleExport() {
    setMessage(null);
    const result = await requestDataExport(email);
    setMessage(`Exportación demo preparada con secciones: ${result.sections.join(', ')}.`);
  }

  if (loading) return <LoadingState title="Cargando seguridad v2.9" description="Revisando hardening, sesión y privacidad." />;
  if (error) return <ErrorState title="No se pudo cargar" message={error} />;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          eyebrow="v2.9 — Seguridad real"
          title="Security hardening y privacidad"
          description="Centro técnico para revisar headers, CORS, rate limiting opcional, política de sesión, flujos simulados de recuperación y control de datos personales."
        />

        {message && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300"><ShieldCheck /></div>
              <div>
                <h2 className="text-xl font-bold">Reporte de hardening</h2>
                <p className="text-sm text-slate-400">Estado: {report?.status} · versión {report?.version}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold text-emerald-200">Implementado</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {report?.implemented.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={16} />{item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-semibold text-amber-200">Pendiente para producción real</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {report?.pendingForRealProduction.map((item) => <li key={item} className="flex gap-2"><AlertTriangle className="mt-0.5 shrink-0 text-amber-300" size={16} />{item}</li>)}
                </ul>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-4 text-xl font-bold">Política de sesión objetivo</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p>Access token: <strong>{policy?.accessTokenTtlMinutes} min</strong></p>
              <p>Refresh token: <strong>{policy?.refreshTokenTtlDays} días</strong></p>
              <p>Rotación: <strong>{policy?.refreshTokenRotation ? 'Sí' : 'No'}</strong></p>
              <p>Intentos fallidos: <strong>{policy?.maxFailedLoginAttempts}</strong></p>
              <p className="text-slate-400">{policy?.note}</p>
            </div>
          </article>
        </div>

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-2 text-xl font-bold">Flujos demo de privacidad y recuperación</h2>
          <p className="mb-5 text-sm text-slate-400">Estos flujos registran audit logs y simulan lo que en producción se conectaría a email transaccional y gestión real de usuarios.</p>
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-emerald-400" />
            <button onClick={handleRecovery} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950"><KeyRound size={18} />Recuperación</button>
            <button onClick={handleExport} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-3 font-semibold text-slate-200"><Download size={18} />Exportar datos</button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Trash2 size={14} />La eliminación de cuenta queda documentada como flujo de revisión para evitar borrados accidentales.</div>
        </article>
      </section>
    </main>
  );
}
