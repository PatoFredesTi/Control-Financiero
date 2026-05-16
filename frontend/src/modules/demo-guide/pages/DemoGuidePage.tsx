import { Link } from 'react-router-dom';
import { Database, PlayCircle, TerminalSquare } from 'lucide-react';

const commands = [
  'cd backend',
  'cp .env.example .env',
  'npm install',
  'npx prisma generate',
  'npx prisma migrate dev',
  'npm run seed',
  'npm run start:dev',
];

export function DemoGuidePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
            <Database size={30} />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Demo data</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Guía para probar la app con datos demo</h1>
          <p className="text-lg leading-8 text-slate-300">
            La v2.0 incluye un seed que crea ingresos, gastos, deudas, presupuestos, metas y recurrentes. Así puedes mostrar el proyecto sin llenar datos manualmente.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <TerminalSquare className="text-emerald-300" />
              <h2 className="text-2xl font-bold">Comandos backend</h2>
            </div>
            <pre className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm leading-7 text-slate-200">
              {commands.join('\n')}
            </pre>
          </article>

          <aside className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
              <PlayCircle size={26} />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-emerald-50">Ruta recomendada</h2>
            <ol className="space-y-3 text-sm leading-6 text-emerald-50/80">
              <li>1. Revisa el dashboard.</li>
              <li>2. Abre deudas y observa el avance pagado.</li>
              <li>3. Crea un gasto tipo pago de deuda.</li>
              <li>4. Vuelve a deudas y valida el saldo.</li>
              <li>5. Abre proyecciones y simula reducción de gastos.</li>
            </ol>
            <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
              Abrir dashboard
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
