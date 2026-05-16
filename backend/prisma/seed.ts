import { PrismaClient, DebtStatus, ExpenseType, GoalStatus, RecurringFrequency, RecurringMovementKind, RecurringStatus } from '@prisma/client';

const prisma = new PrismaClient();

function date(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.installment.deleteMany();
  await prisma.installmentPurchase.deleteMany();
  await prisma.creditCard.deleteMany();
  await prisma.goalContribution.deleteMany();
  await prisma.recurringMovement.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.income.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.debt.deleteMany();

  const currentYear = 2026;
  const currentMonth = 5;

  const creditCard = await prisma.debt.create({
    data: {
      name: 'Tarjeta ABC',
      description: 'Deuda de ejemplo para probar pagos automáticos desde gastos.',
      creditor: 'Banco Demo',
      initialAmount: 600000,
      paidAmount: 150000,
      pendingAmount: 450000,
      startDate: date(2026, 3, 1),
      estimatedEndDate: date(2026, 9, 30),
      status: DebtStatus.ACTIVE,
      notes: 'Creada por seed demo v2.0.',
    },
  });

  const personalLoan = await prisma.debt.create({
    data: {
      name: 'Préstamo personal',
      creditor: 'Financiera Demo',
      initialAmount: 1200000,
      paidAmount: 300000,
      pendingAmount: 900000,
      startDate: date(2026, 1, 15),
      estimatedEndDate: date(2026, 12, 15),
      status: DebtStatus.ACTIVE,
    },
  });

  await prisma.income.createMany({
    data: [
      { description: 'Sueldo mayo', amount: 1800000, category: 'Sueldo', receivedAt: date(2026, 5, 5), paymentMethod: 'Transferencia' },
      { description: 'Proyecto freelance', amount: 280000, category: 'Freelance', receivedAt: date(2026, 5, 12), paymentMethod: 'Transferencia' },
      { description: 'Venta ocasional', amount: 65000, category: 'Ventas', receivedAt: date(2026, 5, 18), paymentMethod: 'Efectivo' },
      { description: 'Sueldo abril', amount: 1750000, category: 'Sueldo', receivedAt: date(2026, 4, 5), paymentMethod: 'Transferencia' },
      { description: 'Bono abril', amount: 120000, category: 'Bonos', receivedAt: date(2026, 4, 20), paymentMethod: 'Transferencia' },
    ],
  });

  await prisma.expense.createMany({
    data: [
      { description: 'Supermercado', amount: 180000, category: 'Alimentación', spentAt: date(2026, 5, 6), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Combustible', amount: 65000, category: 'Transporte', spentAt: date(2026, 5, 7), paymentMethod: 'Crédito', type: ExpenseType.COMMON },
      { description: 'Internet hogar', amount: 29990, category: 'Servicios', spentAt: date(2026, 5, 8), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Pago tarjeta ABC', amount: 150000, category: 'Pago de deuda', spentAt: date(2026, 5, 10), paymentMethod: 'Transferencia', type: ExpenseType.DEBT_PAYMENT, debtId: creditCard.id },
      { description: 'Gimnasio', amount: 28000, category: 'Salud', spentAt: date(2026, 5, 12), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Pago préstamo personal', amount: 300000, category: 'Pago de deuda', spentAt: date(2026, 5, 15), paymentMethod: 'Transferencia', type: ExpenseType.DEBT_PAYMENT, debtId: personalLoan.id },
      { description: 'Delivery fin de semana', amount: 42000, category: 'Ocio', spentAt: date(2026, 5, 18), paymentMethod: 'Crédito', type: ExpenseType.COMMON },
      { description: 'Supermercado abril', amount: 210000, category: 'Alimentación', spentAt: date(2026, 4, 6), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Transporte abril', amount: 70000, category: 'Transporte', spentAt: date(2026, 4, 9), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Netflix mensual', amount: 8990, category: 'Suscripciones', spentAt: date(2026, 5, 9), paymentMethod: 'Crédito', type: ExpenseType.COMMON },
      { description: 'Spotify mensual', amount: 4950, category: 'Suscripciones', spentAt: date(2026, 5, 11), paymentMethod: 'Crédito', type: ExpenseType.COMMON },
      { description: 'Café camino al trabajo', amount: 3200, category: 'Gastos hormiga', spentAt: date(2026, 5, 13), paymentMethod: 'Débito', type: ExpenseType.COMMON },
      { description: 'Snack oficina', amount: 2500, category: 'Gastos hormiga', spentAt: date(2026, 5, 14), paymentMethod: 'Débito', type: ExpenseType.COMMON },
    ],
  });

  await prisma.budget.createMany({
    data: [
      { category: 'Alimentación', amount: 250000, month: currentMonth, year: currentYear, notes: 'Límite mensual para comida y supermercado.' },
      { category: 'Transporte', amount: 90000, month: currentMonth, year: currentYear },
      { category: 'Ocio', amount: 80000, month: currentMonth, year: currentYear },
      { category: 'Servicios', amount: 70000, month: currentMonth, year: currentYear },
    ],
  });

  const emergencyFund = await prisma.savingsGoal.create({
    data: {
      name: 'Fondo de emergencia',
      description: 'Meta demo para 3 meses de tranquilidad financiera.',
      targetAmount: 1500000,
      currentAmount: 350000,
      targetDate: date(2026, 12, 31),
      status: GoalStatus.ACTIVE,
    },
  });

  await prisma.goalContribution.createMany({
    data: [
      { savingsGoalId: emergencyFund.id, amount: 200000, contributedAt: date(2026, 4, 25), notes: 'Primer aporte demo.' },
      { savingsGoalId: emergencyFund.id, amount: 150000, contributedAt: date(2026, 5, 20), notes: 'Segundo aporte demo.' },
    ],
  });

  await prisma.recurringMovement.createMany({
    data: [
      { description: 'Sueldo mensual', amount: 1800000, category: 'Sueldo', paymentMethod: 'Transferencia', kind: RecurringMovementKind.INCOME, frequency: RecurringFrequency.MONTHLY, nextRunAt: date(2026, 6, 5), status: RecurringStatus.ACTIVE },
      { description: 'Internet hogar', amount: 29990, category: 'Servicios', paymentMethod: 'Débito', kind: RecurringMovementKind.EXPENSE, frequency: RecurringFrequency.MONTHLY, nextRunAt: date(2026, 6, 8), status: RecurringStatus.ACTIVE },
      { description: 'Pago tarjeta ABC recurrente', amount: 150000, category: 'Pago de deuda', paymentMethod: 'Transferencia', kind: RecurringMovementKind.DEBT_PAYMENT, frequency: RecurringFrequency.MONTHLY, nextRunAt: date(2026, 6, 10), debtId: creditCard.id, status: RecurringStatus.ACTIVE },
      { description: 'Netflix recurrente', amount: 8990, category: 'Suscripciones', paymentMethod: 'Crédito', kind: RecurringMovementKind.EXPENSE, frequency: RecurringFrequency.MONTHLY, nextRunAt: date(2026, 6, 9), status: RecurringStatus.ACTIVE },
    ],
  });

  const demoCard = await prisma.creditCard.create({
    data: {
      name: 'Visa Demo',
      issuer: 'Banco Demo',
      limitAmount: 1500000,
      usedAmount: 360000,
      billingDay: 25,
      paymentDueDay: 10,
      status: 'ACTIVE',
      notes: 'Tarjeta demo creada para probar compras en cuotas.',
    },
  });

  const demoPurchase = await prisma.installmentPurchase.create({
    data: {
      creditCardId: demoCard.id,
      description: 'Notebook de trabajo',
      category: 'Tecnología',
      totalAmount: 600000,
      installmentsCount: 6,
      monthlyAmount: 100000,
      paidAmount: 200000,
      pendingAmount: 400000,
      firstInstallmentAt: date(2026, 3, 10),
      status: 'ACTIVE',
      installments: {
        create: [
          { number: 1, amount: 100000, dueAt: date(2026, 3, 10), status: 'PAID', paidAt: date(2026, 3, 10) },
          { number: 2, amount: 100000, dueAt: date(2026, 4, 10), status: 'PAID', paidAt: date(2026, 4, 10) },
          { number: 3, amount: 100000, dueAt: date(2026, 5, 10), status: 'PENDING' },
          { number: 4, amount: 100000, dueAt: date(2026, 6, 10), status: 'PENDING' },
          { number: 5, amount: 100000, dueAt: date(2026, 7, 10), status: 'PENDING' },
          { number: 6, amount: 100000, dueAt: date(2026, 8, 10), status: 'PENDING' },
        ],
      },
    },
  });

  console.log(`Compra demo en cuotas creada: ${demoPurchase.description}`);

  await prisma.auditLog.createMany({
    data: [
      { action: 'SEED_CREATED', entity: 'System', actor: 'seed', severity: 'LOW', metadata: 'Seed demo v2.6 ejecutado correctamente.' },
      { action: 'PLAN_VIEWED', entity: 'SaaSPlan', actor: 'demo-user', severity: 'LOW', metadata: 'Evento demo para Security Center.' },
      { action: 'IMPORT_BATCH_REVIEWED', entity: 'ImportBatch', actor: 'demo-user', severity: 'MEDIUM', metadata: 'Simula revisión de importaciones pendientes.' },
      { action: 'SECURITY_CHECK', entity: 'System', actor: 'system', severity: 'LOW', metadata: 'Checklist productivo revisado.' },
    ],
  });

  console.log('Seed demo v2.6 creado correctamente.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
