import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, WalletCards } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('control-financiero-demo-session', 'true');
    navigate('/onboarding');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><Rocket size={28} /></div>
          <h2 className="text-3xl font-black text-white">Crear cuenta</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Configura tu espacio financiero y comienza con el onboarding. En esta demo se crea una sesión local para entrar al programa.</p>

          <div className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Nombre
              <input required placeholder="Tu nombre" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Correo electrónico
              <input type="email" required placeholder="tu@email.com" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Contraseña
              <input type="password" required placeholder="Mínimo 8 caracteres" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </label>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-400" type="submit">Crear cuenta y comenzar</button>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
            <Link to="/login" className="font-semibold text-emerald-300 hover:text-emerald-200">Ya tengo cuenta</Link>
            <Link to="/features" className="hover:text-emerald-300">Ver funcionalidades</Link>
          </div>
        </form>

        <div className="hidden lg:block">
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950"><WalletCards size={24} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Control financiero</p>
              <h1 className="text-xl font-bold text-white">Personal</h1>
            </div>
          </Link>
          <h2 className="text-5xl font-black tracking-tight text-white">Empieza ordenando tu primer mes.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Después del registro podrás configurar ingresos, deudas, tarjetas, presupuestos, metas y alertas para construir un plan financiero mensual.</p>
        </div>
      </section>
    </main>
  );
}
