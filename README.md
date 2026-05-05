# Control Financiero Personal

Aplicación web para controlar ingresos, gastos y deudas personales.

## Versión actual

**v0.7 — Gráficos financieros**

Esta versión agrega gráficos financieros al dashboard: ingresos vs gastos, evolución del balance, gastos por categoría, comparación entre gastos comunes y pagos de deuda, y avance individual de deudas.

## Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form
- Recharts

### Backend

- NestJS
- TypeScript
- Prisma
- PostgreSQL
- Class Validator

### Base de datos

- PostgreSQL con Docker Compose

---

## Funcionalidades incluidas

### v0.1

- Estructura frontend/backend.
- React + Vite + TypeScript.
- NestJS + TypeScript.
- PostgreSQL con Docker.
- Prisma configurado.
- Endpoint de prueba `/api/health`.

### v0.2

- Modelo `Debt`.
- Migración de deudas.
- CRUD de deudas en backend.
- Pantalla `/debts` en frontend.
- Formulario de creación de deudas.
- Listado y eliminación de deudas.
- Resumen visual de deudas.

### v0.3

- Modelo `Income`.
- Migración de ingresos.
- CRUD de ingresos en backend.
- Pantalla `/incomes` en frontend.
- Formulario de creación de ingresos.
- Listado y eliminación de ingresos.
- Resumen visual de ingresos.
- Navegación desde home hacia ingresos y deudas.

### v0.4

- Modelo `Expense`.
- Enum `ExpenseType`.
- Migración de gastos.
- CRUD de gastos en backend.
- Pantalla `/expenses` en frontend.
- Formulario de creación de gastos.
- Listado y eliminación de gastos.
- Categorías de gastos.
- Selector de tipo de gasto: común o pago de deuda.
- Asociación opcional de un gasto a una deuda.
- Resumen visual de gastos.

### v0.5

- Pago de deuda desde gastos.
- Descuento automático de `pendingAmount`.
- Incremento automático de `paidAmount`.
- Cambio automático de deuda a `PAID` cuando se paga por completo.
- Validación para no pagar más que el saldo pendiente.
- Validación para impedir pagos en deudas pagadas o pausadas.
- Reversión del saldo si se elimina un pago de deuda.
- Mensajes de error del backend visibles en frontend.

### v0.6

- Módulo `DashboardModule` en backend.
- Endpoint `GET /api/dashboard/summary`.
- Pantalla `/dashboard` en frontend.
- Tarjetas de resumen financiero.
- Ingresos del mes.
- Gastos del mes.
- Balance mensual.
- Deuda pendiente total.
- Gastos comunes del mes.
- Pagos de deuda del mes.
- Progreso global de deudas.
- Últimos movimientos.

### v0.7

- Endpoint `GET /api/dashboard/charts`.
- Gráfico de ingresos vs gastos de los últimos seis meses.
- Gráfico de evolución del balance mensual.
- Gráfico de gastos por categoría del mes actual.
- Gráfico de gastos comunes vs pagos de deuda.
- Gráfico de avance individual de deudas.
- Estados vacíos para gráficos sin datos.
- Dashboard actualizado con Recharts.

---

## Requisitos

- Node.js 20+
- npm
- Docker Desktop

---

## Instalación

### 1. Levantar la base de datos

Desde la raíz del proyecto:

```bash
docker compose up -d
```

---

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

Backend disponible en:

```txt
http://localhost:3000/api
```

Endpoint de prueba:

```txt
GET http://localhost:3000/api/health
```

Endpoints de deudas:

```txt
GET    /api/debts
POST   /api/debts
GET    /api/debts/:id
PATCH  /api/debts/:id
DELETE /api/debts/:id
```

Endpoints de ingresos:

```txt
GET    /api/incomes
POST   /api/incomes
GET    /api/incomes/:id
PATCH  /api/incomes/:id
DELETE /api/incomes/:id
```

Endpoints de gastos:

```txt
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
```

Endpoints de dashboard:

```txt
GET /api/dashboard/summary
GET /api/dashboard/charts
```

---

### 3. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend disponible en:

```txt
http://localhost:5173
```

Pantallas disponibles:

```txt
http://localhost:5173
http://localhost:5173/dashboard
http://localhost:5173/debts
http://localhost:5173/incomes
http://localhost:5173/expenses
```

---

## Prueba rápida de gráficos

1. Entra a `/debts` y crea una deuda de `$100.000`.
2. Entra a `/incomes` y crea un ingreso del mes actual.
3. Entra a `/expenses` y crea un gasto común.
4. Entra a `/expenses` y crea un `Pago de deuda` asociado a la deuda.
5. Entra a `/dashboard`.
6. Verifica que se actualicen:
   - Tarjetas resumen.
   - Ingresos vs gastos.
   - Balance mensual.
   - Gastos por categoría.
   - Gastos comunes vs pagos de deuda.
   - Avance global e individual de deudas.
   - Últimos movimientos.

---

