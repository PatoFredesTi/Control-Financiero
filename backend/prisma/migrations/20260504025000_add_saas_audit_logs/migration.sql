-- v2.5 — SaaS/premium listo para producción
-- Audit log básico para registrar eventos relevantes de producto, seguridad y operación.
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "actor" TEXT NOT NULL DEFAULT 'system',
  "severity" TEXT NOT NULL DEFAULT 'LOW',
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");
CREATE INDEX "AuditLog_severity_idx" ON "AuditLog"("severity");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
