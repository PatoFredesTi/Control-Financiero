-- CreateEnum
CREATE TYPE "ImportedMovementStatus" AS ENUM ('PENDING', 'CLASSIFIED', 'IMPORTED', 'DUPLICATE', 'IGNORED');

-- CreateEnum
CREATE TYPE "ImportedMovementType" AS ENUM ('INCOME', 'EXPENSE', 'DEBT_PAYMENT', 'UNKNOWN');

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL,
    "fileName" TEXT,
    "source" TEXT,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "duplicateRows" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PREVIEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedMovement" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "rawDate" TEXT,
    "rawDescription" TEXT NOT NULL,
    "rawAmount" TEXT NOT NULL,
    "parsedDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "suggestedType" "ImportedMovementType" NOT NULL DEFAULT 'UNKNOWN',
    "suggestedCategory" TEXT,
    "suggestedPaymentMethod" TEXT,
    "debtId" TEXT,
    "duplicateScore" INTEGER NOT NULL DEFAULT 0,
    "possibleDuplicateId" TEXT,
    "status" "ImportedMovementStatus" NOT NULL DEFAULT 'PENDING',
    "importedEntityType" TEXT,
    "importedEntityId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImportBatch_status_idx" ON "ImportBatch"("status");

-- CreateIndex
CREATE INDEX "ImportBatch_createdAt_idx" ON "ImportBatch"("createdAt");

-- CreateIndex
CREATE INDEX "ImportedMovement_batchId_idx" ON "ImportedMovement"("batchId");

-- CreateIndex
CREATE INDEX "ImportedMovement_status_idx" ON "ImportedMovement"("status");

-- CreateIndex
CREATE INDEX "ImportedMovement_suggestedType_idx" ON "ImportedMovement"("suggestedType");

-- CreateIndex
CREATE INDEX "ImportedMovement_parsedDate_idx" ON "ImportedMovement"("parsedDate");

-- CreateIndex
CREATE INDEX "ImportedMovement_debtId_idx" ON "ImportedMovement"("debtId");

-- AddForeignKey
ALTER TABLE "ImportedMovement" ADD CONSTRAINT "ImportedMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedMovement" ADD CONSTRAINT "ImportedMovement_debtId_fkey" FOREIGN KEY ("debtId") REFERENCES "Debt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
