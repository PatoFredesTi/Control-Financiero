import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Gauge, Info, LogIn, UserPlus, WalletCards } from 'lucide-react';

export function App() {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#020817] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.18),transparent_34%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-80 w-80 rounded-full border border-emerald-500/20" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-96 w-96 rounded-full border border-blue-500/20" />
      <div className="pointer-events-none absolute left-16 top-44 hidden grid-cols-4 gap-4 opacity-40 md:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1 w-1 rounded-full bg-emerald-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute right-28 top-1/2 hidden grid-cols-4 gap-4 opacity-30 lg:grid">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} className="h-1 w-1 rounded-full bg-sky-400" />
        ))}
      </div>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-emerald-500/30 bg-slate-900/70 shadow-2xl shadow-emerald-500/10 backdrop-blur">
          <Gauge size={62} className="text-emerald-400" />
        </div>

        <p className="mb-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
          v3.1 experiencia oficial
        </p>
        <h1 className="max-w-4xl text-5xl font-black tracking-[0.12em] text-white drop-shadow sm:text-6xl md:text-7xl">
          Control Financiero
        </h1>
        <p className="mt-6 max-w-3xl text-lg tracking-[0.12em] text-slate-300 sm:text-xl">
          Organiza tus ingresos, gastos, deudas y metas en un solo lugar.
        </p>

        <div className="mt-14 grid w-full max-w-4xl gap-6 md:grid-cols-2">
          <Link
            to="/login"
            className="group rounded-[2rem] border border-emerald-500/40 bg-slate-900/55 p-8 shadow-2xl shadow-emerald-950/40 backdrop-blur transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-500/10"
          >
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 text-emerald-300 transition group-hover:scale-105">
              <LogIn size={38} />
            </div>
            <h2 className="text-3xl font-black tracking-wide text-white">Iniciar sesión</h2>
            <p className="mx-auto mt-5 max-w-xs text-base leading-7 text-slate-300">
              Accede a tu cuenta y continúa gestionando tus finanzas.
            </p>
            <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-300 transition group-hover:bg-emerald-500 group-hover:text-slate-950">
              <ArrowRight size={24} />
            </span>
          </Link>

          <Link
            to="/register"
            className="group rounded-[2rem] border border-blue-500/40 bg-slate-900/55 p-8 shadow-2xl shadow-blue-950/40 backdrop-blur transition hover:-translate-y-1 hover:border-blue-400 hover:bg-blue-500/10"
          >
            <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/35 bg-blue-500/10 text-blue-300 transition group-hover:scale-105">
              <UserPlus size={38} />
            </div>
            <h2 className="text-3xl font-black tracking-wide text-white">Registrarse</h2>
            <p className="mx-auto mt-5 max-w-xs text-base leading-7 text-slate-300">
              Crea tu cuenta y comienza a tomar el control de tus finanzas.
            </p>
            <span className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-full border border-blue-500/50 bg-blue-500/10 text-blue-300 transition group-hover:bg-blue-500 group-hover:text-slate-950">
              <ArrowRight size={24} />
            </span>
          </Link>
        </div>

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          <Link
            to="/product-status"
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 px-5 py-4 text-sm font-bold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300"
          >
            <FileText size={18} /> Ver notas de versión <ArrowRight size={16} />
          </Link>
          <Link
            to="/features"
            className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/45 px-5 py-4 text-sm font-bold text-slate-200 transition hover:border-blue-500 hover:text-blue-300"
          >
            <Info size={18} /> Más información <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-800/70 bg-slate-950/70 px-6 py-5 text-center text-sm tracking-[0.12em] text-slate-400 backdrop-blur">
        Creado por{' '}
        <a href="https://patriciofredes.dev" target="_blank" rel="noreferrer" className="font-semibold text-emerald-300 hover:text-emerald-200">
          Patricio Fredes
        </a>
        <span className="mx-3 text-slate-700">|</span>
        <span className="inline-flex items-center gap-2"><WalletCards size={15} /> Control Financiero Personal</span>
      </footer>
    </main>
  );
}
