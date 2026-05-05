import { Link } from 'react-router-dom';
import { BarChart3, CircleDollarSign, CreditCard, ReceiptText } from 'lucide-react';

const cards = [
  {
    title: 'Dashboard',
    description: 'Revisa resumen mensual, balance, deuda pendiente y últimos movimientos.',
    icon: BarChart3,
    status: 'Disponible v0.7',
    href: '/dashboard',
  },
  {
    title: 'Ingresos',
    description: 'Registra entradas de dinero como sueldo, ventas, bonos o trabajos freelance.',
    icon: CircleDollarSign,
    status: 'Disponible v0.3',
    href: '/incomes',
  },
  {
    title: 'Gastos',
    description: 'Controla tus salidas de dinero y categoriza cada movimiento.',
    icon: ReceiptText,
    status: 'Disponible v0.5',
    href: '/expenses',
  },
  {
    title: 'Deudas',
    description: 'Administra deudas y descuenta pagos automáticamente desde gastos.',
    icon: CreditCard,
    status: 'Disponible v0.2',
    href: '/debts',
  },
];

export function App() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
            v0.7 — Gráficos financieros
          </p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Control Financiero Personal
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            Base Full Stack con React, TypeScript, Vite, NestJS, Prisma y PostgreSQL.
            Esta versión agrega gráficos comparativos para visualizar ingresos vs gastos,
            evolución del balance, gastos por categoría y avance de deudas.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Link key={card.title} to={card.href}>
                <article className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/50">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <Icon size={26} />
                  </div>
                  <div className="mb-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
                    {card.status}
                  </div>
                  <h2 className="mb-2 text-xl font-semibold">{card.title}</h2>
                  <p className="text-sm leading-6 text-slate-400">{card.description}</p>
                </article>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
