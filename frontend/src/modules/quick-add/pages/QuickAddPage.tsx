import { Link } from 'react-router-dom';
import { ArrowLeft, CircleDollarSign, CreditCard, FileSpreadsheet, PiggyBank, ReceiptText } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';

const actions = [
  { href: '/expenses', title: 'Registrar gasto', description: 'Carga una compra, pago o salida de dinero del día.', icon: ReceiptText, tone: 'text-rose-300 bg-rose-500/10 border-rose-500/30' },
  { href: '/incomes', title: 'Registrar ingreso', description: 'Agrega sueldo, venta, freelance o cualquier entrada.', icon: CircleDollarSign, tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' },
  { href: '/debts', title: 'Agregar deuda', description: 'Crea o revisa deudas y su avance de pago.', icon: CreditCard, tone: 'text-amber-200 bg-amber-500/10 border-amber-500/30' },
  { href: '/savings-goals', title: 'Aportar a meta', description: 'Actualiza tus metas de ahorro y progreso.', icon: PiggyBank, tone: 'text-sky-200 bg-sky-500/10 border-sky-500/30' },
  { href: '/financial-imports', title: 'Importar CSV', description: 'Carga movimientos masivos desde cartola o Excel.', icon: FileSpreadsheet, tone: 'text-violet-200 bg-violet-500/10 border-violet-500/30' },
];

export function QuickAddPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-28 pt-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300">
          <ArrowLeft size={16} /> Volver al dashboard
        </Link>
        <PageHeader eyebrow="v2.8 mobile-first" title="Acción rápida" description="Accesos rápidos para registrar o revisar movimientos desde celular en pocos segundos." />
        <div className="grid gap-4 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} to={action.href} className={`rounded-3xl border p-5 shadow-xl transition hover:-translate-y-1 ${action.tone}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/30"><Icon size={26} /></div>
                <h2 className="text-xl font-bold text-slate-50">{action.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
