# v0.7 — Gráficos financieros

## Objetivo

Agregar visualizaciones financieras al dashboard para que el usuario pueda comparar ingresos, gastos, balance, categorías de gasto y avance de deudas de forma rápida.

Esta versión mantiene la base de la v0.6 y suma un endpoint específico para datos de gráficos.

---

## Incluido en esta versión

### Backend

- Nuevo endpoint `GET /api/dashboard/charts`.
- Cálculo de ingresos vs gastos de los últimos seis meses.
- Cálculo de balance mensual de los últimos seis meses.
- Agrupación de gastos por categoría del mes actual.
- Separación entre gastos comunes y pagos de deuda del mes actual.
- Cálculo de avance individual de cada deuda.

---

### Frontend

- Dashboard actualizado a v0.7.
- Nuevo componente `FinanceCharts`.
- Nuevo componente `ChartCard`.
- Nuevo componente `EmptyChartState`.
- Gráfico de barras para ingresos vs gastos.
- Gráfico de línea para evolución del balance.
- Gráfico de dona para gastos por categoría.
- Gráfico de barras horizontal para gastos comunes vs pagos de deuda.
- Gráfico de barras horizontal para avance individual de deudas.
- Estados vacíos cuando no hay datos suficientes.
- Estados visuales de carga y error para los gráficos.

---

## Endpoints de dashboard

```txt
GET /api/dashboard/summary
GET /api/dashboard/charts
```

---

## Respuesta esperada de `/api/dashboard/charts`

```ts
{
  period: {
    month: number;
    year: number;
    currentMonthStart: string;
    nextMonthStart: string;
    sixMonthsAgoStart: string;
  };
  monthlyComparison: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  expenseTypeBreakdown: Array<{
    type: string;
    amount: number;
  }>;
  debtProgress: Array<{
    id: string;
    name: string;
    initialAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: 'ACTIVE' | 'PAID' | 'OVERDUE' | 'PAUSED';
    progressPercentage: number;
  }>;
}
```

---

## Cómo probar la v0.7

1. Levantar base de datos.
2. Ejecutar migraciones.
3. Crear al menos una deuda desde `/debts`.
4. Crear ingresos desde `/incomes`.
5. Crear gastos comunes desde `/expenses`.
6. Crear pagos de deuda desde `/expenses`.
7. Entrar a `/dashboard`.
8. Verificar que se muestren:
   - Tarjetas resumen.
   - Ingresos vs gastos.
   - Evolución del balance.
   - Gastos por categoría.
   - Gastos comunes vs pagos de deuda.
   - Avance individual de deudas.

---

## Cómo ejecutar

### Base de datos

```bash
docker compose up -d
```

### Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Pantallas disponibles

```txt
/
/dashboard
/debts
/incomes
/expenses
```

---

## Próxima versión

## v0.8 — Filtros y mejoras UX

La próxima versión debería agregar:

- Filtros por fecha.
- Filtros por categoría.
- Filtros por tipo de gasto.
- Mejoras visuales generales.
- Mejores estados vacíos.
- Navegación más consistente entre módulos.
