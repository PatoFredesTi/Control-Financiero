import { Injectable } from '@nestjs/common';

@Injectable()
export class SystemReadinessService {
  getStatus() {
    return {
      app: 'Control Financiero Personal',
      version: '2.6.0',
      status: 'technical-stabilization',
      releaseFocus: 'Refactor técnico, estabilidad, calidad base y mantenibilidad.',
      completedCapabilities: [
        'Control de ingresos, gastos y deudas',
        'Pago de deudas desde gastos con consistencia transaccional',
        'Dashboard con gráficos y métricas',
        'Presupuestos mensuales',
        'Metas de ahorro y aportes',
        'Movimientos recurrentes',
        'Calendario financiero',
        'Proyecciones y simulaciones',
        'Importación CSV y conciliación básica',
        'Alertas y centro de notificaciones',
        'Tarjetas de crédito y compras en cuotas',
        'Analítica financiera avanzada',
        'Capa SaaS, security center y audit logs básicos',
        'Filtros globales de error y utilidades financieras compartidas',
      ],
      recommendedProductionStack: {
        frontend: ['Vercel', 'Netlify', 'AWS S3 + CloudFront'],
        backend: ['Render', 'Railway', 'Fly.io', 'AWS ECS/Fargate'],
        database: ['Neon', 'Supabase', 'Railway PostgreSQL', 'Amazon RDS'],
      },
    };
  }

  getLaunchChecklist() {
    return {
      version: '2.6.0',
      checklist: [
        { item: 'Variables de entorno documentadas', done: true },
        { item: 'Docker Compose local disponible', done: true },
        { item: 'Seed de datos demo disponible', done: true },
        { item: 'README profesional actualizado', done: true },
        { item: 'Guía de arquitectura disponible', done: true },
        { item: 'Guía de despliegue disponible', done: true },
        { item: 'CI base sugerido para GitHub Actions', done: true },
        { item: 'Tests iniciales de reglas financieras', done: true },
        { item: 'Filtro global de errores disponible', done: true },
        { item: 'Utilidades financieras compartidas disponibles', done: true },
        { item: 'Convención de respuestas API documentada', done: true },
        { item: 'Conexión bancaria real', done: false },
        { item: 'Audit logs básicos disponibles', done: true },
        { item: 'Security center disponible', done: true },
        { item: 'App móvil nativa', done: false },
      ],
    };
  }

  getQualityReport() {
    return {
      version: '2.6.0',
      qualityFocus: 'Base técnica para escalar hacia v2.7 y v3.0 sin aumentar deuda técnica.',
      backend: {
        improvements: [
          'Filtro global de excepciones para normalizar errores HTTP.',
          'Utilidad createSuccessResponse para nuevos endpoints con respuesta consistente.',
          'Utilidades de cálculo financiero compartidas y testeables.',
          'Utilidad centralizada para rangos mensuales.',
          'Endpoint de quality report para documentar estabilidad y deuda técnica pendiente.',
        ],
        nextHardening: [
          'Migrar progresivamente endpoints legacy hacia respuesta API estándar.',
          'Agregar tests de integración por módulo crítico.',
          'Agregar request-id por middleware para trazabilidad.',
        ],
      },
      frontend: {
        improvements: [
          'Componentes reutilizables para loaders, headers y navegación de producto.',
          'Helper centralizado para estados de carga y errores.',
          'Textos de versión y roadmap actualizados.',
        ],
        nextHardening: [
          'Extraer layouts por familia de módulos.',
          'Agregar tests de componentes para formularios críticos.',
          'Unificar manejo de formularios con esquemas compartidos.',
        ],
      },
      riskLevel: 'MEDIUM',
      recommendation: 'Antes de sumar IA avanzada en v2.7, mantener esta versión como punto de estabilización y baseline técnico.',
    };
  }
}
