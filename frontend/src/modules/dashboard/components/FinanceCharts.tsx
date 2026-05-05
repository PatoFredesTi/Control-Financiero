import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '../../../utils/formatCurrency';
import type { DashboardCharts } from '../types/dashboard';
import { ChartCard } from './ChartCard';
import { EmptyChartState } from './EmptyChartState';

type FinanceChartsProps = {
  charts: DashboardCharts;
};

type TooltipPayload = {
  name?: string;
  value?: number;
  payload?: Record<string, unknown>;
};

type TooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

const pieColors = ['#34d399', '#60a5fa', '#fbbf24', '#fb7185', '#a78bfa', '#22d3ee'];

function CurrencyTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm shadow-xl">
      {label && <p className="mb-2 font-semibold text-slate-200">{label}</p>}
      <div className="space-y-1">
        {payload.map((item) => (
          <p key={`${item.name}-${item.value}`} className="text-slate-300">
            {item.name}: <span className="font-semibold text-slate-100">{formatCurrency(item.value ?? 0)}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function PercentTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm shadow-xl">
      {label && <p className="mb-2 font-semibold text-slate-200">{label}</p>}
      <p className="text-slate-300">
        Avance: <span className="font-semibold text-slate-100">{item.value ?? 0}%</span>
      </p>
    </div>
  );
}

export function FinanceCharts({ charts }: FinanceChartsProps) {
  const hasMonthlyData = charts.monthlyComparison.some(
    (item) => item.income > 0 || item.expense > 0,
  );
  const hasExpensesByCategory = charts.expensesByCategory.length > 0;
  const hasExpenseTypeBreakdown = charts.expenseTypeBreakdown.some((item) => item.amount > 0);
  const hasDebtProgress = charts.debtProgress.length > 0;

  return (
    <section className="mb-8 grid gap-5 xl:grid-cols-2">
      <ChartCard
        title="Ingresos vs gastos"
        description="Comparación de los últimos seis meses para detectar si el gasto está superando tus ingresos."
      >
        {hasMonthlyData ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Bar dataKey="income" name="Ingresos" fill="#34d399" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" name="Gastos" fill="#fb7185" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState message="Aún no hay ingresos o gastos suficientes para construir este gráfico." />
        )}
      </ChartCard>

      <ChartCard
        title="Evolución del balance"
        description="Línea de balance mensual calculada como ingresos menos gastos."
      >
        {hasMonthlyData ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  name="Balance"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState message="Registra movimientos en distintos meses para ver la evolución del balance." />
        )}
      </ChartCard>

      <ChartCard
        title="Gastos por categoría"
        description="Distribución de gastos del mes actual agrupada por categoría."
      >
        {hasExpensesByCategory ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.expensesByCategory}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                >
                  {charts.expensesByCategory.map((entry, index) => (
                    <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CurrencyTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState message="Aún no existen gastos del mes actual para agrupar por categoría." />
        )}
      </ChartCard>

      <ChartCard
        title="Gastos comunes vs pagos de deuda"
        description="Separación del gasto mensual entre consumo normal y dinero destinado a bajar deudas."
      >
        {hasExpenseTypeBreakdown ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.expenseTypeBreakdown} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <YAxis dataKey="type" type="category" stroke="#94a3b8" width={120} />
                <Tooltip content={<CurrencyTooltip />} />
                <Bar dataKey="amount" name="Monto" fill="#fbbf24" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChartState message="Registra gastos comunes o pagos de deuda para comparar ambos tipos." />
        )}
      </ChartCard>

      <div className="xl:col-span-2">
        <ChartCard
          title="Avance individual de deudas"
          description="Porcentaje pagado de cada deuda registrada. Ayuda a priorizar cuáles siguen más atrasadas."
        >
          {hasDebtProgress ? (
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.debtProgress} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" tickFormatter={(value) => `${value}%`} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={150} />
                  <Tooltip content={<PercentTooltip />} />
                  <Bar dataKey="progressPercentage" name="Avance" fill="#34d399" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState message="Crea al menos una deuda para ver su avance individual." />
          )}
        </ChartCard>
      </div>
    </section>
  );
}
