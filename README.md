# Control Financiero Personal

Plataforma Full Stack de control financiero personal orientada a ayudar a personas a entender, ordenar y mejorar su vida financiera.

La versión **v3.0** cambia la experiencia inicial: la ruta principal ahora funciona como una landing real con acceso a inicio de sesión y registro. El catálogo completo de funcionalidades queda disponible en `/features`, para que el inicio no se sienta como una documentación técnica sino como entrada natural al producto.

## Rutas principales v3.0

```txt
/                  Landing pública
/login             Inicio de sesión visual/demo
/register          Registro visual/demo
/features          Catálogo completo de funcionalidades
/dashboard         Inicio interno del programa
/onboarding        Configuración guiada
/demo-guide        Guía de demostración
```


Aplicación web Full Stack para controlar ingresos, gastos, deudas, presupuestos, metas de ahorro, movimientos recurrentes, calendario financiero, proyecciones, importación CSV, alertas, tarjetas de crédito, analítica avanzada y preparación tipo SaaS.

El objetivo es ayudar a personas a ordenar su vida financiera, entender en qué gastan, reducir deudas, cuidar presupuestos, anticipar compromisos futuros y tomar mejores decisiones con datos claros.

## v2.9 — Refactor técnico, estabilidad y calidad base

La v2.9 no agrega un módulo financiero grande; estabiliza la base del proyecto para seguir creciendo hacia v2.7 y v3.0 sin acumular deuda técnica.

Incluye:

- Filtro global de errores en NestJS.
- Convención de respuesta API para nuevos endpoints.
- Utilidades financieras compartidas y testeables.
- Utilidades de rango mensual reutilizables.
- Tests unitarios adicionales para cálculos financieros.
- Componentes UI reutilizables para headers, carga y error.
- Interceptor Axios con versión de cliente y extracción de errores estandarizados.
- Endpoint de quality report:

```txt
GET /api/system/quality-report
```

> Esta versión mantiene compatibilidad con endpoints legacy. La convención de respuesta API se agrega como base para migrar progresivamente nuevos endpoints sin romper el frontend actual.

## Funcionalidades principales

- Dashboard financiero con métricas y gráficos.
- Registro de ingresos y gastos.
- Pagos de deuda desde gastos con consistencia transaccional.
- Control de deudas con progreso pagado/pendiente.
- Presupuestos mensuales por categoría.
- Metas de ahorro con aportes.
- Movimientos recurrentes.
- Calendario financiero mensual.
- Proyecciones y simulaciones financieras.
- Importación CSV y conciliación manual.
- Centro de alertas financieras.
- Tarjetas de crédito, cupos y compras en cuotas.
- Analítica financiera avanzada.
- Onboarding y demo guide.
- Página de precios, legal pack, security center y launch readiness.
- Audit logs básicos.
- Tests base y documentación técnica.

## Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- React Hook Form
- Zod

### Backend

- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Class Validator
- Jest

### Infraestructura local

- Docker Compose
- PostgreSQL 16

## Instalación local

```bash
cd control-financiero-v2.9
docker compose up -d
```

Backend:

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Rutas principales

```txt
http://localhost:5173
http://localhost:5173/onboarding
http://localhost:5173/dashboard
http://localhost:5173/incomes
http://localhost:5173/expenses
http://localhost:5173/debts
http://localhost:5173/budgets
http://localhost:5173/savings-goals
http://localhost:5173/recurring-movements
http://localhost:5173/financial-calendar
http://localhost:5173/financial-projections
http://localhost:5173/financial-imports
http://localhost:5173/notifications
http://localhost:5173/credit-cards
http://localhost:5173/financial-analytics
http://localhost:5173/pricing
http://localhost:5173/security-center
http://localhost:5173/legal
http://localhost:5173/launch-readiness
http://localhost:5173/demo-guide
http://localhost:5173/product-status
```

## Endpoints destacados

```txt
GET  /api/health
GET  /api/system/status
GET  /api/system/launch-checklist
GET  /api/system/quality-report
GET  /api/saas/landing
GET  /api/saas/plans
GET  /api/saas/security-readiness
GET  /api/saas/production-checklist
GET  /api/saas/legal-pack
GET  /api/audit-logs
GET  /api/audit-logs/summary
POST /api/audit-logs
GET  /api/dashboard/summary
GET  /api/dashboard/charts
GET  /api/financial-analytics/advanced
GET  /api/financial-projections/monthly
GET  /api/notifications/center
GET  /api/credit-cards/summary
```

## Regla de negocio principal

Si se registra un gasto como `DEBT_PAYMENT`, el sistema descuenta automáticamente ese monto de la deuda asociada. Si el gasto se elimina, el sistema revierte el pago y restaura el saldo pendiente.

<<<<<<< HEAD
=======
## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API_OVERVIEW.md`](docs/API_OVERVIEW.md)
- [`docs/API_RESPONSE_STANDARD.md`](docs/API_RESPONSE_STANDARD.md)
- [`docs/TECHNICAL_STABILIZATION.md`](docs/TECHNICAL_STABILIZATION.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/IMPORTS.md`](docs/IMPORTS.md)
- [`docs/NOTIFICATIONS.md`](docs/NOTIFICATIONS.md)
- [`docs/ANALYTICS.md`](docs/ANALYTICS.md)
- [`docs/SAAS_READINESS.md`](docs/SAAS_READINESS.md)
- [`docs/SECURITY.md`](docs/SECURITY.md)
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md)

## Scripts útiles

### Backend

```bash
npm run start:dev
npm run build
npm run test
npm run seed
npm run prisma:migrate
npm run prisma:studio
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

## Estado del proyecto

La v2.9 representa una versión de estabilización técnica: mantiene todos los módulos financieros y SaaS de v2.5, pero agrega una base más sólida para errores, utilidades compartidas, calidad, mantenibilidad y futuras migraciones hacia un asistente financiero más inteligente.


## v2.9 — Seguridad real, testing y deploy

Esta versión agrega una capa de preparación técnica para una demo pública controlada y una futura producción:

- Hardening básico de API.
- Rate limiting opcional.
- Flujos simulados de recuperación de contraseña y verificación de email.
- Exportación y solicitud de eliminación de datos en modo demo.
- Audit logs para acciones sensibles.
- Dockerfiles para frontend/backend.
- `docker-compose.prod.yml`.
- Checklist CI/CD y rutas de deploy.
- Documentación técnica de seguridad, testing y despliegue.

### Rutas nuevas

```txt
/security-hardening
/testing-deploy
```

### Ejecución productiva local de referencia

```bash
docker compose -f docker-compose.prod.yml up --build
```
>>>>>>> 38b9874 (Final Commit, v3.0 financial control platform)
