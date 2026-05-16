import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Goal, PiggyBank, Repeat2, Rocket, WalletCards } from 'lucide-react';

const steps = [
  {
    title: '1. Registra tu punto de partida',
    description: 'Crea tus deudas, ingresos frecuentes y gastos principales. Así el sistema puede mostrar un balance real.',
    icon: WalletCards,
    href: '/debts',
  },
  {
    title: '2. Define límites mensuales',
    description: 'Configura presupuestos por categoría para dejar de gastar a ciegas y detectar excesos antes de fin de mes.',
    icon: PiggyBank,
    href: '/budgets',
  },
  {
    title: '3. Crea metas de ahorro',
    description: 'Agrega objetivos como fondo de emergencia, viaje, inversión o pie para una vivienda.',
    icon: Goal,
    href: '/savings-goals',
  },
  {
    title: '4. Automatiza lo recurrente',
    description: 'Programa sueldo, servicios, suscripciones y pagos de deuda para tener claridad sobre compromisos próximos.',
    icon: Repeat2,
    href: '/recurring-movements',
  },
  {
    title: '5. Mira el calendario',
    description: 'Revisa ingresos, gastos, vencimientos y fechas objetivo en una vista mensual.',
    icon: CalendarDays,
    href: '/financial-calendar',
  },
  {
    title: '6. Proyecta escenarios',
    description: 'Simula ahorro, reducción de gastos y pago acelerado de deudas para elegir un mejor plan.',
    icon: BarChart3,
    href: '/financial-projections',
  },
];

export function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
            <Rocket size={30} />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">v2.0 — Onboarding</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Configura tu control financiero</h1>
          <p className="max-w-3xl text-lg leading-8 text-emerald-50/80">
            Sigue estos pasos para que la aplicación pase de ser un registro de movimientos a una herramienta de decisión: presupuesto, deuda, ahorro, calendario y proyecciones.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300">
              Ir al dashboard <ArrowRight size={18} />
            </Link>
            <Link to="/demo-guide" className="inline-flex items-center justify-center rounded-xl border border-emerald-400/30 px-5 py-3 font-semibold text-emerald-100 transition hover:border-emerald-300">
              Ver guía demo
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.title} to={step.href}>
                <article className="h-full rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/50">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                    <Icon size={26} />
                  </div>
                  <h2 className="mb-3 text-xl font-semibold">{step.title}</h2>
                  <p className="text-sm leading-6 text-slate-400">{step.description}</p>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-2xl font-bold">Resultado esperado</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Saber cuánto entra, cuánto sale y cuánto queda.',
              'Detectar categorías fuera de control.',
              'Ver deudas bajando con pagos trazables.',
              'Anticipar vencimientos y compromisos recurrentes.',
              'Medir avance de metas y ahorro.',
              'Simular decisiones antes de tomarlas.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
