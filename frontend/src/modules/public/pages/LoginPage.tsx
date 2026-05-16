import { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyhole, WalletCards } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    localStorage.setItem('control-financiero-demo-session', 'true');
    navigate('/dashboard');
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950"><WalletCards size={24} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">Control financiero</p>
              <h1 className="text-xl font-bold text-white">Personal</h1>
            </div>
          </Link>
          <h2 className="text-5xl font-black tracking-tight text-white">Vuelve a tomar control de tu mes.</h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">Ingresa para revisar tu dashboard, registrar movimientos, pagar deudas, analizar cuotas, ver alertas y seguir tu plan financiero.</p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-[2rem] border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300"><LockKeyhole size={28} /></div>
          <h2 className="text-3xl font-black text-white">Iniciar sesión</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Accede a tu espacio financiero. En esta demo, el formulario permite entrar al programa sin backend real.</p>

          <div className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Correo electrónico
              <input type="email" required defaultValue="demo@controlfinanciero.app" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Contraseña
              <input type="password" required defaultValue="demo1234" className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400" />
            </label>
          </div>

          <button className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 font-black text-slate-950 transition hover:bg-emerald-400" type="submit">Entrar al programa</button>

          <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
            <Link to="/register" className="font-semibold text-emerald-300 hover:text-emerald-200">Crear cuenta</Link>
            <Link to="/features" className="hover:text-emerald-300">Ver funcionalidades</Link>
          </div>
        </form>
      </section>
    </main>
  );
}
