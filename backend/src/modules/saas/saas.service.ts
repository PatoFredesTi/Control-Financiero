import { Injectable } from '@nestjs/common';

@Injectable()
export class SaasService {
  getLanding() {
    return {
      version: '2.6.0',
      headline: 'Control financiero personal para ordenar tu dinero, reducir deudas y proyectar mejor tus decisiones.',
      subheadline:
        'Una plataforma Full Stack para registrar, importar, analizar y proyectar ingresos, gastos, deudas, presupuestos, metas, tarjetas y alertas financieras.',
      primaryCallToAction: 'Crear cuenta gratis',
      secondaryCallToAction: 'Ver demo',
      valuePropositions: [
        'Centraliza ingresos, gastos, deudas y tarjetas en un solo lugar.',
        'Convierte datos financieros en alertas, proyecciones e insights accionables.',
        'Permite una experiencia de demo lista para entrevistas, GitHub y despliegue.',
      ],
      targetUsers: [
        'Personas que quieren dejar de vivir desordenadas financieramente.',
        'Usuarios que necesitan controlar deudas, cuotas y gastos recurrentes.',
        'Desarrolladores que quieren estudiar una arquitectura Full Stack con lógica de negocio real.',
      ],
    };
  }

  getPlans() {
    return {
      currency: 'CLP',
      billingNote: 'Planes simulados para preparar el proyecto como SaaS. No incluye cobros reales.',
      plans: [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          recommended: false,
          description: 'Para ordenar finanzas personales básicas.',
          features: [
            'Ingresos, gastos y deudas',
            'Dashboard financiero',
            'Presupuestos y metas limitadas',
            'Importación CSV manual',
            'Datos demo',
          ],
          limits: ['1 usuario', 'Hasta 3 presupuestos activos', 'Hasta 3 metas activas'],
        },
        {
          id: 'personal-plus',
          name: 'Personal Plus',
          price: 4990,
          recommended: true,
          description: 'Para usuarios que quieren proyecciones, alertas y analítica avanzada.',
          features: [
            'Presupuestos y metas ilimitadas',
            'Tarjetas de crédito y cuotas',
            'Alertas inteligentes',
            'Proyecciones financieras',
            'Analítica avanzada',
            'Reportes y exportaciones',
          ],
          limits: ['1 usuario', 'Historial extendido', 'Soporte estándar'],
        },
        {
          id: 'family',
          name: 'Family',
          price: 8990,
          recommended: false,
          description: 'Para administrar finanzas del hogar con varias personas.',
          features: [
            'Todo lo de Personal Plus',
            'Multiusuario familiar',
            'Roles básicos',
            'Presupuestos compartidos',
            'Metas familiares',
            'Auditoría de cambios',
          ],
          limits: ['Hasta 5 miembros', 'Soporte prioritario simulado'],
        },
      ],
    };
  }

  getSecurityReadiness() {
    return {
      version: '2.6.0',
      score: 82,
      status: 'production-candidate',
      implemented: [
        'Validación global de DTOs con whitelist y bloqueo de campos no permitidos',
        'CORS configurable por variable de entorno',
        'Headers básicos de seguridad configurados en bootstrap',
        'Variables de entorno separadas para local y producción',
        'Audit log básico para registrar eventos relevantes',
        'Documentación de seguridad y despliegue',
      ],
      recommendedBeforeRealUsers: [
        'Agregar autenticación real con refresh tokens y rotación segura',
        'Implementar recuperación de contraseña con email real',
        'Implementar verificación de email real',
        'Agregar rate limiting persistente por IP/usuario',
        'Configurar backups automáticos de base de datos',
        'Agregar monitoreo, logs centralizados y alertas de errores',
      ],
    };
  }

  getProductionChecklist() {
    return {
      version: '2.6.0',
      groups: [
        {
          title: 'Producto',
          items: [
            { label: 'Landing page', done: true },
            { label: 'Página de precios simulada', done: true },
            { label: 'Onboarding guiado', done: true },
            { label: 'Demo pública con seed', done: true },
            { label: 'Términos y privacidad base', done: true },
          ],
        },
        {
          title: 'Técnico',
          items: [
            { label: 'Docker Compose local', done: true },
            { label: 'Variables de entorno documentadas', done: true },
            { label: 'CI base en GitHub Actions', done: true },
            { label: 'Tests base de reglas financieras', done: true },
            { label: 'Deploy real conectado', done: false },
          ],
        },
        {
          title: 'Operación',
          items: [
            { label: 'Health checks', done: true },
            { label: 'Audit logs básicos', done: true },
            { label: 'Backups automáticos', done: false },
            { label: 'Monitoreo productivo', done: false },
            { label: 'Runbook de incidentes', done: true },
          ],
        },
      ],
    };
  }

  getLegalPack() {
    return {
      disclaimer:
        'Este contenido es una plantilla base para proyecto de portafolio y no constituye asesoría legal. Para producción real debe ser revisado por un profesional.',
      termsSummary: [
        'El usuario es responsable de la exactitud de los datos ingresados.',
        'Las recomendaciones financieras son informativas y no reemplazan asesoría profesional.',
        'La plataforma puede cambiar funcionalidades, límites y planes con aviso previo.',
        'El uso indebido del sistema puede derivar en suspensión de la cuenta.',
      ],
      privacySummary: [
        'Los datos financieros deben tratarse como información sensible.',
        'En producción se recomienda cifrado en tránsito, backups seguros y mínimo acceso necesario.',
        'No se deben vender datos personales ni financieros del usuario.',
        'El usuario debe poder solicitar eliminación de sus datos.',
      ],
      dataRetention: 'Para una versión real, definir política de retención, exportación y eliminación de datos por usuario.',
    };
  }
}
