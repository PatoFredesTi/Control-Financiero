import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  // v2.9: hardening básico sin paquetes externos para mantener el proyecto simple de ejecutar.
  // En producción real se puede reemplazar/complementar por Helmet, WAF y rate limiting distribuido.
  const requestCounters = new Map<string, { count: number; resetAt: number }>();

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    res.setHeader('X-App-Version', '2.9.0');

    const rateLimitEnabled = configService.get<string>('ENABLE_IN_MEMORY_RATE_LIMIT') === 'true';
    if (!rateLimitEnabled) {
      next();
      return;
    }

    const windowMs = Number(configService.get<string>('RATE_LIMIT_WINDOW_MS') ?? 60_000);
    const maxRequests = Number(configService.get<string>('RATE_LIMIT_MAX_REQUESTS') ?? 120);
    const now = Date.now();
    const key = req.ip ?? 'unknown';
    const current = requestCounters.get(key);

    if (!current || current.resetAt < now) {
      requestCounters.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    res.setHeader('X-RateLimit-Limit', String(maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequests - current.count)));

    if (current.count > maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          statusCode: 429,
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Demasiadas solicitudes. Intenta nuevamente en unos minutos.',
          path: req.url,
        },
        meta: { timestamp: new Date().toISOString(), version: '2.9.0' },
      });
      return;
    }

    next();
  });

  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173',
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
}

bootstrap();
