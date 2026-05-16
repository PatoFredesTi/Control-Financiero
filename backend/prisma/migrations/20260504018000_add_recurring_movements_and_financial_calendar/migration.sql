-- v1.8 - Recurrent movements used by the financial calendar
CREATE TYPE "RecurringMovementKind" AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT');
CREATE TYPE "RecurringFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY', 'YEARLY');
CREATE TYPE "RecurringStatus" AS ENUM ('ACTIVE', 'PAUSED', 'FINISHED');

CREATE TABLE "RecurringMovement" (
  "id" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "paymentMethod" TEXT,
  "kind" "RecurringMovementKind" NOT NULL,
  "frequency" "RecurringFrequency" NOT NULL,
  "nextRunAt" TIMESTAMP(3) NOT NULL,
  "lastRunAt" TIMESTAMP(3),
  "debtId" TEXT,
  "status" "RecurringStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RecurringMovement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecurringMovement_kind_idx" ON "RecurringMovement"("kind");
CREATE INDEX "RecurringMovement_frequency_idx" ON "RecurringMovement"("frequency");
CREATE INDEX "RecurringMovement_status_idx" ON "RecurringMovement"("status");
CREATE INDEX "RecurringMovement_nextRunAt_idx" ON "RecurringMovement"("nextRunAt");
CREATE INDEX "RecurringMovement_debtId_idx" ON "RecurringMovement"("debtId");

ALTER TABLE "RecurringMovement" ADD CONSTRAINT "RecurringMovement_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
