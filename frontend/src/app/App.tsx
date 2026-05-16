import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BellRing, CalendarDays, CreditCard, LockKeyhole, PiggyBank, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';

const benefits = [
  {
    title: 'Claridad mensual',
    description: 'Ve ingresos, gastos, balance, deudas y próximos pagos desde un solo lugar.',
    icon: BarChart3,
  },
  {
    title: 'Control de deudas y cuotas',
    description: 'Registra pagos, controla tarjetas, evita sorpresas y visualiza compromisos futuros.',
    icon: CreditCard,
  },
  {
    title: 'Alertas y plan financiero',
    description: 'Recibe señales sobre presupuestos, pagos próximos y acciones recomendadas para mejorar.',
    icon: BellRing,
  },
];

const modules = [
  'Ingresos y gastos',
  'Deudas y pagos automáticos',
  'Tarjetas y cuotas',
  'Presupuestos',
  'Metas de ahorro',
  'Calendario financiero',
  'Proyecciones',
  'Asistente financiero',
];

export function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <WalletCards size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Control financiero</p>
              <h1 className="text-base font-bold text-white">Personal</h1>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-300 md:flex">
            <Link to="/features" className="transition hover:text-emerald-300">Qué puedes hacer</Link>
            <Link to="/pricing" className="transition hover:text-emerald-300">Planes</Link>
            <Link to="/legal" className="transition hover:text-emerald-300">Legal</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300 sm:inline-flex">Iniciar sesión</Link>
            <Link to="/register" className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400">Registrarse</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200">
            <Sparkles size={16} /> v3.0 — Inicio real + experiencia de producto
          </div>

          <h2 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Toma control de tu dinero, tus deudas y tus metas financieras.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Una plataforma de control financiero personal para ordenar ingresos, gastos, deudas, tarjetas, cuotas, presupuestos y metas. Ingresa a tu cuenta para usar el sistema o revisa primero todo lo que puedes hacer dentro de la app.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 text-base font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-400">
              Iniciar sesión <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-6 py-4 text-base font-bold text-slate-100 transition hover:border-emerald-500 hover:text-emerald-300">
              Crear cuenta gratis
            </Link>
            <Link to="/features" className="inline-flex items-center justify-center rounded-2xl px-6 py-4 text-base font-bold text-slate-300 transition hover:text-emerald-300">
              Ver funcionalidades
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-2xl font-black text-emerald-300">360°</p>
              <p className="mt-1 text-sm text-slate-400">Vista completa de tus finanzas.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-2xl font-black text-emerald-300">30 días</p>
              <p className="mt-1 text-sm text-slate-400">Enfoque mensual para mejorar hábitos.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-2xl font-black text-emerald-300">PWA</p>
              <p className="mt-1 text-sm text-slate-400">Diseñada para uso web y móvil.</p>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-5 shadow-2xl lg:p-6">
          <div className="rounded-[1.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 to-slate-950 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resumen del mes</p>
                <h3 className="text-2xl font-bold text-white">Panel financiero</h3>
              </div>
              <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300"><ShieldCheck size={24} /></div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Balance</p>
                <p className="mt-2 text-2xl font-black text-emerald-300">+$340.000</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deuda pendiente</p>
                <p className="mt-2 text-2xl font-black text-amber-300">$780.000</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Meta ahorro</p>
                <p className="mt-2 text-2xl font-black text-sky-300">42%</p>
              </div>
              <div className="rounded-2xl bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Score</p>
                <p className="mt-2 text-2xl font-black text-emerald-300">74/100</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200"><PiggyBank size={18} /> Acción recomendada</div>
              <p className="text-sm leading-6 text-slate-300">Evita nuevas compras en cuotas este mes y destina $60.000 extra a la deuda principal.</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <article key={benefit.title} className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Icon size={24} /></div>
                <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{benefit.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="text-emerald-300" />
            <h3 className="text-2xl font-bold text-white">Todo lo importante en un solo sistema</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {modules.map((module) => (
              <span key={module} className="rounded-full border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-300">{module}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-8 text-sm text-slate-400 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© 2026 Control Financiero Personal. Proyecto Full Stack de portafolio.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/features" className="hover:text-emerald-300">Qué puedes hacer</Link>
            <Link to="/demo-guide" className="hover:text-emerald-300">Guía demo</Link>
            <Link to="/pricing" className="hover:text-emerald-300">Planes</Link>
            <Link to="/legal" className="hover:text-emerald-300">Legal</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
