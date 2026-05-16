import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { limit: number; severity?: string }) {
    const take = Number.isFinite(params.limit) ? Math.min(Math.max(params.limit, 1), 100) : 50;

    return this.prisma.auditLog.findMany({
      where: params.severity ? { severity: params.severity } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async getSummary() {
    const [total, low, medium, high, critical, recent] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { severity: 'LOW' } }),
      this.prisma.auditLog.count({ where: { severity: 'MEDIUM' } }),
      this.prisma.auditLog.count({ where: { severity: 'HIGH' } }),
      this.prisma.auditLog.count({ where: { severity: 'CRITICAL' } }),
      this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    return {
      total,
      bySeverity: { low, medium, high, critical },
      recent,
      recommendation:
        critical > 0 || high > 3
          ? 'Revisar eventos críticos antes de habilitar usuarios reales.'
          : 'No se observan eventos críticos en los registros recientes.',
    };
  }

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        actor: dto.actor ?? 'system',
        severity: dto.severity ?? 'LOW',
        metadata: dto.metadata,
      },
    });
  }
}
