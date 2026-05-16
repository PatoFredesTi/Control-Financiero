-- v2.3 — Tarjetas de crédito, cuotas y compras financiadas

CREATE TYPE "CreditCardStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED');
CREATE TYPE "InstallmentPurchaseStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

CREATE TABLE "CreditCard" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "issuer" TEXT,
  "limitAmount" INTEGER NOT NULL,
  "usedAmount" INTEGER NOT NULL DEFAULT 0,
  "billingDay" INTEGER NOT NULL,
  "paymentDueDay" INTEGER NOT NULL,
  "status" "CreditCardStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CreditCard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstallmentPurchase" (
  "id" TEXT NOT NULL,
  "creditCardId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "installmentsCount" INTEGER NOT NULL,
  "monthlyAmount" INTEGER NOT NULL,
  "paidAmount" INTEGER NOT NULL DEFAULT 0,
  "pendingAmount" INTEGER NOT NULL,
  "firstInstallmentAt" TIMESTAMP(3) NOT NULL,
  "status" "InstallmentPurchaseStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InstallmentPurchase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Installment" (
  "id" TEXT NOT NULL,
  "purchaseId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "dueAt" TIMESTAMP(3) NOT NULL,
  "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING',
  "paidAt" TIMESTAMP(3),
  "expenseId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Installment_purchaseId_number_key" ON "Installment"("purchaseId", "number");
CREATE UNIQUE INDEX "Installment_expenseId_key" ON "Installment"("expenseId");
CREATE INDEX "CreditCard_status_idx" ON "CreditCard"("status");
CREATE INDEX "CreditCard_issuer_idx" ON "CreditCard"("issuer");
CREATE INDEX "InstallmentPurchase_creditCardId_idx" ON "InstallmentPurchase"("creditCardId");
CREATE INDEX "InstallmentPurchase_status_idx" ON "InstallmentPurchase"("status");
CREATE INDEX "InstallmentPurchase_firstInstallmentAt_idx" ON "InstallmentPurchase"("firstInstallmentAt");
CREATE INDEX "Installment_purchaseId_idx" ON "Installment"("purchaseId");
CREATE INDEX "Installment_dueAt_idx" ON "Installment"("dueAt");
CREATE INDEX "Installment_status_idx" ON "Installment"("status");

ALTER TABLE "InstallmentPurchase" ADD CONSTRAINT "InstallmentPurchase_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "InstallmentPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
