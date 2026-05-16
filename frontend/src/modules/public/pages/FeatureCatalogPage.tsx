import { Link } from 'react-router-dom';
import { BarChart3, BellRing, BrainCircuit, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardCheck, CreditCard, Database, FileSpreadsheet, Goal, LineChart, PiggyBank, ReceiptText, Repeat2, Rocket, ShieldCheck, Crown, FileText, LockKeyhole, RocketIcon, Smartphone, ShieldAlert, TestTube2 } from 'lucide-react';

const cards = [
  { title: 'Dashboard', description: 'Resumen mensual, balance, deuda pendiente, presupuestos, metas y gráficos financieros.', icon: BarChart3, status: 'Resumen + gráficos', href: '/dashboard' },
  { title: 'Ingresos', description: 'Registra, edita, elimina y filtra entradas de dinero como sueldo, bonos o ventas.', icon: CircleDollarSign, status: 'CRUD completo', href: '/incomes' },
  { title: 'Gastos', description: 'Controla gastos comunes y pagos de deuda con recálculo automático de saldos.', icon: ReceiptText, status: 'Pagos consistentes', href: '/expenses' },
  { title: 'Deudas', description: 'Administra deudas, estados, montos pagados, saldos pendientes y progreso visual.', icon: CreditCard, status: 'Control total', href: '/debts' },
  { title: 'Presupuestos', description: 'Define límites mensuales por categoría y compara presupuesto contra gasto real.', icon: PiggyBank, status: 'v1.1 incluido', href: '/budgets' },
  { title: 'Metas de ahorro', description: 'Crea objetivos financieros, registra aportes y mide el avance de cada meta.', icon: Goal, status: 'Metas', href: '/savings-goals' },
  { title: 'Recurrentes', description: 'Programa ingresos, gastos y pagos de deuda que se repiten periódicamente.', icon: Repeat2, status: 'v1.7 incluido', href: '/recurring-movements' },
  { title: 'Calendario financiero', description: 'Visualiza eventos financieros del mes, vencimientos, recurrentes y saldo proyectado.', icon: CalendarDays, status: 'Calendario', href: '/financial-calendar' },
  { title: 'Proyecciones', description: 'Simula escenarios de balance, ahorro, reducción de gastos y pago acelerado de deudas.', icon: BrainCircuit, status: 'Simulaciones', href: '/financial-projections' },
  { title: 'Importaciones', description: 'Carga movimientos desde CSV, clasifícalos, detecta duplicados y conviértelos en ingresos, gastos o pagos de deuda.', icon: FileSpreadsheet, status: 'v2.1', href: '/financial-imports' },
  { title: 'Alertas', description: 'Revisa presupuestos excedidos, deudas próximas, recurrentes pendientes y riesgos de balance.', icon: BellRing, status: 'v2.2 nuevo', href: '/notifications' },
  { title: 'Tarjetas de crédito', description: 'Controla cupos, compras en cuotas, vencimientos y compromisos futuros por tarjeta.', icon: CreditCard, status: 'v2.3', href: '/credit-cards' },
  { title: 'Analítica avanzada', description: 'Analiza ratios, tendencias, gastos hormiga, suscripciones, deuda, crédito y recomendaciones priorizadas.', icon: LineChart, status: 'v2.4', href: '/financial-analytics' },
  { title: 'Asistente financiero', description: 'Recibe diagnóstico mensual, riesgos, oportunidades, explicación del score y plan de acción priorizado.', icon: BrainCircuit, status: 'v2.7', href: '/financial-assistant' },
  { title: 'Acción rápida móvil', description: 'Accesos rápidos para registrar gastos, ingresos, deudas, metas o importar CSV desde celular.', icon: Smartphone, status: 'v2.8 PWA', href: '/quick-add' },
  { title: 'Planes SaaS', description: 'Visualiza planes simulados Free, Personal Plus y Family para presentar el proyecto como producto.', icon: Crown, status: 'v2.5 nuevo', href: '/pricing' },
  { title: 'Security center', description: 'Revisa readiness de seguridad, checklist previo a usuarios reales y audit logs básicos.', icon: LockKeyhole, status: 'v2.5 nuevo', href: '/security-center' },
  { title: 'Legal pack', description: 'Incluye términos, privacidad y política base de retención para una futura versión productiva.', icon: FileText, status: 'v2.5 nuevo', href: '/legal' },
  { title: 'Launch readiness', description: 'Checklist final de producto, operación y despliegue para preparar la app como SaaS.', icon: RocketIcon, status: 'v2.5 nuevo', href: '/launch-readiness' },
  { title: 'Onboarding', description: 'Sigue una ruta guiada para configurar el sistema y entender qué registrar primero.', icon: Rocket, status: 'v2.0 nuevo', href: '/onboarding' },
  { title: 'Guía demo', description: 'Carga datos de ejemplo para probar el proyecto y mostrarlo rápidamente en entrevistas.', icon: Database, status: 'Seed demo', href: '/demo-guide' },
  { title: 'Estado producto', description: 'Revisa capacidades completadas, checklist de lanzamiento, stack recomendado y reporte de calidad técnica.', icon: ClipboardCheck, status: 'Quality report', href: '/product-status' },
  { title: 'Seguridad v2.9', description: 'Revisa hardening, política de sesión, recuperación simulada, exportación de datos y flujos de privacidad.', icon: ShieldAlert, status: 'v2.9 nuevo', href: '/security-hardening' },
  { title: 'Testing y deploy', description: 'Valida CI/CD, Dockerfiles, checklist técnico, alternativas de deploy simple y arquitectura AWS.', icon: TestTube2, status: 'v2.9 nuevo', href: '/testing-deploy' },
];

const highlights = [
  'Frontend responsive con React, TypeScript, Vite y Tailwind CSS.',
  'Backend modular con NestJS, Prisma y PostgreSQL.',
  'Reglas transaccionales para pagos de deuda y reversión de saldos.',
  'Presupuestos, metas, recurrentes, calendario, proyecciones, alertas, tarjetas y analítica avanzada integrados al control financiero.',
  'Onboarding, seed demo, importación CSV, centro de alertas, documentación y tests base.',
  'Capa SaaS, asistente financiero, PWA básica, navegación móvil, importador CSV mejorado, seguridad v2.9, Dockerfiles y CI/CD.',
];

export function FeatureCatalogPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.4fr_0.8fr] lg:p-10">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">Catálogo de funcionalidades</p>
              <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">Control Financiero Personal</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">
                Aplicación Full Stack para controlar ingresos, gastos, deudas, presupuestos, metas, recurrentes, calendario y proyecciones financieras. Esta vista reúne todo lo que la plataforma permite hacer: control de ingresos, gastos, deudas, presupuestos, metas, tarjetas, importaciones, alertas, asistente financiero, seguridad, testing y preparación SaaS.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard" className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">Entrar al dashboard</Link>
                <Link to="/onboarding" className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:border-emerald-500 hover:text-emerald-300">Comenzar onboarding</Link>
              </div>
            </div>

            <aside className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300"><ShieldCheck size={26} /></div>
              <h2 className="text-xl font-bold text-emerald-100">Vista de capacidades</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-100/80">Esta sección queda separada del inicio principal para que el usuario llegue primero a una pantalla simple de inicio de sesión o registro, y pueda revisar las capacidades cuando quiera.</p>
            </aside>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {highlights.map((highlight) => (
            <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-300" />{highlight}
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} to={card.href}>
                <article className="h-full rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/50">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><Icon size={26} /></div>
                  <div className="mb-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">{card.status}</div>
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
