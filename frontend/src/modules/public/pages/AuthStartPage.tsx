import { ArrowRight, Info, ScrollText, User, UserPlus, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuthStartPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),transparent_35%)]" />

        <div className="relative z-10 w-full max-w-5xl text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_60px_rgba(16,185,129,0.25)]">
            <WalletCards className="h-12 w-12 text-emerald-400" />
          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-7xl">
            Control Financiero
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
            Organiza tus ingresos, gastos, deudas y metas en un solo lugar.
          </p>

          <div className="mx-auto mt-14 grid max-w-4xl gap-8 md:grid-cols-2">
            <Link
              to="/login"
              className="group rounded-3xl border border-emerald-400/50 bg-slate-900/70 p-10 shadow-2xl shadow-emerald-950/30 transition hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-950/30"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
                <User className="h-11 w-11 text-emerald-400" />
              </div>

              <h2 className="mt-8 text-3xl font-black">Iniciar Sesión</h2>

              <p className="mx-auto mt-5 max-w-xs text-slate-300">
                Accede a tu cuenta y continúa gestionando tus finanzas.
              </p>

              <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/10 text-emerald-300 transition group-hover:bg-emerald-400 group-hover:text-slate-950">
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>

            <Link
              to="/register"
              className="group rounded-3xl border border-blue-400/50 bg-slate-900/70 p-10 shadow-2xl shadow-blue-950/30 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-950/30"
            >
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-400/40 bg-blue-400/10">
                <UserPlus className="h-11 w-11 text-blue-400" />
              </div>

              <h2 className="mt-8 text-3xl font-black">Registrarse</h2>

              <p className="mx-auto mt-5 max-w-xs text-slate-300">
                Crea tu cuenta y comienza a tomar el control de tus finanzas.
              </p>

              <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-blue-400/50 bg-blue-400/10 text-blue-300 transition group-hover:bg-blue-400 group-hover:text-slate-950">
                <ArrowRight className="h-6 w-6" />
              </div>
            </Link>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/product-status"
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-8 py-4 font-bold text-slate-200 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              <ScrollText className="h-5 w-5" />
              Ver notas de versión
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/features"
              className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-8 py-4 font-bold text-slate-200 transition hover:border-blue-400 hover:text-blue-300"
            >
              <Info className="h-5 w-5" />
              Más información
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <footer className="relative z-10 mt-16 w-full border-t border-slate-800 py-8 text-center text-slate-400">
          Creado por{' '}
          <a
            href="https://patriciofredes.dev"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Patricio Fredes
          </a>
        </footer>
      </section>
    </main>
  );
}