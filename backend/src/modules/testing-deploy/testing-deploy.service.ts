import { Injectable } from '@nestjs/common';

@Injectable()
export class TestingDeployService {
  getReadiness() {
    return {
      version: '2.9.0',
      score: 82,
      areas: [
        { area: 'Backend build', status: 'ready', command: 'npm run build' },
        { area: 'Backend tests', status: 'partial', command: 'npm run test' },
        { area: 'Frontend build', status: 'ready', command: 'npm run build' },
        { area: 'Frontend tests', status: 'initial', command: 'npm run test' },
        { area: 'Dockerfiles', status: 'ready', command: 'docker compose -f docker-compose.prod.yml build' },
        { area: 'CI/CD', status: 'ready', command: 'GitHub Actions workflow incluido' },
        { area: 'Public demo', status: 'pending', command: 'Configurar Vercel + Render/Railway/Neon o AWS' },
      ],
      recommendation: 'La app está lista para una demo técnica controlada. Para usuarios reales falta correo transaccional, auth robusta y monitoreo productivo.',
    };
  }

  getCiChecklist() {
    return {
      backend: ['npm ci', 'npx prisma generate', 'npm run test', 'npm run build'],
      frontend: ['npm ci', 'npm run test', 'npm run build'],
      database: ['Validar DATABASE_URL', 'Ejecutar migraciones', 'Ejecutar seed demo opcional'],
      qualityGates: ['No subir .env', 'No subir node_modules', 'Build exitoso', 'Tests críticos pasando'],
    };
  }

  getDeployTargets() {
    return {
      simple: {
        frontend: 'Vercel',
        backend: 'Render / Railway / Fly.io',
        database: 'Neon / Supabase / Railway PostgreSQL',
      },
      aws: {
        frontend: 'S3 + CloudFront',
        backend: 'ECS Fargate o Lambda',
        database: 'RDS PostgreSQL',
        observability: 'CloudWatch',
        secrets: 'AWS Secrets Manager',
      },
    };
  }
}
