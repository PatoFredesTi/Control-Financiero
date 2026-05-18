import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ExpenseType, ImportedMovementStatus, ImportedMovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ExpensesService } from '../expenses/expenses.service';
import { CommitImportBatchDto } from './dto/commit-import-batch.dto';
import { CreateImportPreviewDto } from './dto/create-import-preview.dto';
import { UpdateImportedMovementDto } from './dto/update-imported-movement.dto';

type CsvRow = Record<string, string>;

type ImportFieldMapping = {
  date?: string;
  description?: string;
  amount?: string;
  debit?: string;
  credit?: string;
  type?: string;
  category?: string;
  paymentMethod?: string;
};

type ImportOptions = {
  amountMode?: 'SIGNED' | 'DEBIT_CREDIT';
  bankTemplate?: string;
  fieldMapping?: ImportFieldMapping;
};

type NormalizedMovement = {
  rowNumber: number;
  rawDate?: string;
  rawDescription: string;
  rawAmount: string;
  parsedDate?: Date;
  description: string;
  amount: number;
  suggestedType: ImportedMovementType;
  suggestedCategory?: string;
  suggestedPaymentMethod?: string;
};

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_-]+/g, '');
}

function normalizeText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function detectDelimiter(headerLine: string, requested?: string) {
  if (requested && requested !== 'auto') return requested === '\\t' ? '\t' : requested;

  const candidates = [
    { delimiter: ';', count: headerLine.split(';').length },
    { delimiter: ',', count: headerLine.split(',').length },
    { delimiter: '\t', count: headerLine.split('\t').length },
  ];

  return candidates.sort((a, b) => b.count - a.count)[0].delimiter;
}

function splitCsvLine(line: string, delimiter: string) {
  const values: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parseCsv(csvText: string, requestedDelimiter?: string): CsvRow[] {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new BadRequestException('El CSV debe incluir encabezados y al menos una fila de movimientos.');
  }

  const delimiter = detectDelimiter(lines[0], requestedDelimiter);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function readField(row: CsvRow, aliases: string[]) {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value?.trim()) return value.trim();
  }

  return undefined;
}

function parseAmount(rawAmount?: string) {
  if (!rawAmount) return undefined;

  const cleaned = rawAmount
    .replace(/CLP/gi, '')
    .replace(/USD/gi, '')
    .replace(/\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const value = Number(cleaned);

  if (Number.isNaN(value)) return undefined;

  return Math.round(value);
}

function parseDate(rawDate?: string) {
  if (!rawDate) return undefined;

  const value = rawDate.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const dateMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function inferType(description: string, amount: number, explicitType?: string) {
  const normalizedType = explicitType?.trim().toLowerCase();
  const normalizedDescription = description.toLowerCase();

  if (normalizedType?.includes('ingreso') || normalizedType === 'income') return ImportedMovementType.INCOME;
  if (normalizedType?.includes('deuda') || normalizedType?.includes('tarjeta') || normalizedType === 'debt_payment') return ImportedMovementType.DEBT_PAYMENT;
  if (normalizedType?.includes('gasto') || normalizedType === 'expense') return ImportedMovementType.EXPENSE;

  if (/pago.*(deuda|tarjeta|credito|crédito|prestamo|préstamo)|abono.*(deuda|credito|crédito|tarjeta)/i.test(normalizedDescription)) {
    return ImportedMovementType.DEBT_PAYMENT;
  }

  if (amount > 0) return ImportedMovementType.INCOME;
  if (amount < 0) return ImportedMovementType.EXPENSE;

  return ImportedMovementType.UNKNOWN;
}

function inferCategory(description: string, type: ImportedMovementType, explicitCategory?: string) {
  const explicit = normalizeText(explicitCategory);
  if (explicit) return explicit;

  const text = description.toLowerCase();

  if (type === ImportedMovementType.INCOME) {
    if (/sueldo|remuneracion|remuneración|nomina|nómina/.test(text)) return 'Sueldo';
    if (/freelance|honorario|boleta/.test(text)) return 'Freelance';
    if (/venta|marketplace|shopify|mercado/.test(text)) return 'Ventas';
    return 'Otros';
  }

  if (type === ImportedMovementType.DEBT_PAYMENT) return 'Pago de deuda';

  if (/supermercado|unimarc|jumbo|lider|líder|santa isabel|tottus|almacen|almacén/.test(text)) return 'Alimentación';
  if (/uber|didi|bencina|combustible|metro|micro|peaje|estacionamiento/.test(text)) return 'Transporte';
  if (/netflix|spotify|disney|prime|hbo|youtube|suscripcion|suscripción/.test(text)) return 'Suscripciones';
  if (/internet|movistar|entel|wom|claro|telefon/.test(text)) return 'Internet / Telefonía';
  if (/farmacia|doctor|clinica|clínica|salud|isapre|fonasa/.test(text)) return 'Salud';
  if (/restaurant|restaurante|delivery|rappi|pedidosya|comida/.test(text)) return 'Comida fuera';
  if (/dividendo|arriendo|hipotecario/.test(text)) return 'Arriendo / Dividendo';

  return 'Otros';
}

function normalizeMovement(row: CsvRow, rowNumber: number, options: ImportOptions = {}): NormalizedMovement | null {
  const mapping = options.fieldMapping ?? getTemplateMapping(options.bankTemplate);
  const readMappedField = (field: keyof ImportFieldMapping, aliases: string[]) => {
    const mapped = mapping?.[field];
    if (mapped) {
      const value = readField(row, [mapped]);
      if (value) return value;
    }
    return readField(row, aliases);
  };

  const rawDate = readMappedField('date', ['fecha', 'date', 'fecha movimiento', 'fecha contable', 'fecha transaccion', 'fecha transacción']);
  const rawDescription = readMappedField('description', ['descripcion', 'descripción', 'description', 'glosa', 'detalle', 'comercio', 'merchant', 'movimiento']);
  let rawAmount = readMappedField('amount', ['monto', 'amount', 'importe', 'valor', 'cargo/abono', 'cargo', 'abono']);
  const rawDebit = readMappedField('debit', ['cargo', 'debe', 'debit', 'egreso', 'retiro']);
  const rawCredit = readMappedField('credit', ['abono', 'haber', 'credit', 'ingreso', 'deposito', 'depósito']);
  const explicitType = readMappedField('type', ['tipo', 'type']);
  const explicitCategory = readMappedField('category', ['categoria', 'categoría', 'category']);
  const explicitPaymentMethod = readMappedField('paymentMethod', ['metodo', 'método', 'paymentmethod', 'medio', 'cuenta', 'origen']);

  if (options.amountMode === 'DEBIT_CREDIT' || (!rawAmount && (rawDebit || rawCredit))) {
    const debitAmount = parseAmount(rawDebit);
    const creditAmount = parseAmount(rawCredit);
    if (creditAmount && creditAmount > 0) rawAmount = String(creditAmount);
    if (debitAmount && debitAmount > 0) rawAmount = String(-Math.abs(debitAmount));
  }

  if (!rawDescription || !rawAmount) return null;

  const numericAmount = parseAmount(rawAmount);
  if (numericAmount === undefined || numericAmount === 0) return null;

  const suggestedType = inferType(rawDescription, numericAmount, explicitType);

  return {
    rowNumber,
    rawDate,
    rawDescription,
    rawAmount,
    parsedDate: parseDate(rawDate),
    description: rawDescription,
    amount: Math.abs(numericAmount),
    suggestedType,
    suggestedCategory: inferCategory(rawDescription, suggestedType, explicitCategory),
    suggestedPaymentMethod: normalizeText(explicitPaymentMethod) ?? normalizeText(options.bankTemplate) ?? 'Importación CSV',
  };
}

function getTemplateMapping(template?: string): ImportFieldMapping | undefined {
  const normalized = template?.trim().toLowerCase();
  if (!normalized) return undefined;

  const templates: Record<string, ImportFieldMapping> = {
    bancoestado: { date: 'fecha', description: 'descripcion', amount: 'monto', paymentMethod: 'cuenta' },
    santander: { date: 'fecha', description: 'descripcion', debit: 'cargo', credit: 'abono', paymentMethod: 'cuenta' },
    bci: { date: 'fecha movimiento', description: 'glosa', debit: 'cargo', credit: 'abono', paymentMethod: 'producto' },
    generic: { date: 'fecha', description: 'descripcion', amount: 'monto', type: 'tipo', category: 'categoria' },
  };

  return templates[normalized];
}

function getDayRange(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  return { start, end };
}

@Injectable()
export class FinancialImportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expensesService: ExpensesService,
  ) {}

  getTemplates() {
    return [
      {
        id: 'generic',
        name: 'Plantilla genérica',
        description: 'Columnas recomendadas: fecha, descripcion, monto, tipo, categoria.',
        amountMode: 'SIGNED',
        fieldMapping: getTemplateMapping('generic'),
      },
      {
        id: 'bancoestado',
        name: 'BancoEstado básico',
        description: 'Mapeo simple para exportaciones con fecha, descripción y monto firmado.',
        amountMode: 'SIGNED',
        fieldMapping: getTemplateMapping('bancoestado'),
      },
      {
        id: 'santander',
        name: 'Santander cargo / abono',
        description: 'Mapeo para cartolas con columnas separadas de cargo y abono.',
        amountMode: 'DEBIT_CREDIT',
        fieldMapping: getTemplateMapping('santander'),
      },
      {
        id: 'bci',
        name: 'BCI cargo / abono',
        description: 'Mapeo para glosa, fecha movimiento, cargo y abono.',
        amountMode: 'DEBIT_CREDIT',
        fieldMapping: getTemplateMapping('bci'),
      },
    ];
  }

  async createPreview(createImportPreviewDto: CreateImportPreviewDto) {
    const rows = parseCsv(createImportPreviewDto.csvText, createImportPreviewDto.delimiter);
    const normalizedMovements = rows
      .map((row, index) => normalizeMovement(row, index + 2, createImportPreviewDto))
      .filter((movement): movement is NormalizedMovement => Boolean(movement));

    if (!normalizedMovements.length) {
      throw new BadRequestException('No se encontraron movimientos válidos en el archivo. Revisa encabezados, descripción y monto.');
    }

    const movementsWithDuplicateInfo = await Promise.all(
      normalizedMovements.map(async (movement) => {
        const duplicate = await this.findPossibleDuplicate(movement);
        const status = duplicate
          ? ImportedMovementStatus.DUPLICATE
          : movement.suggestedType === ImportedMovementType.UNKNOWN || !movement.parsedDate
            ? ImportedMovementStatus.PENDING
            : ImportedMovementStatus.CLASSIFIED;

        return {
          ...movement,
          duplicateScore: duplicate ? 100 : 0,
          possibleDuplicateId: duplicate?.id,
          status,
        };
      }),
    );

    const duplicateRows = movementsWithDuplicateInfo.filter((movement) => movement.status === ImportedMovementStatus.DUPLICATE).length;

    const batch = await this.prisma.importBatch.create({
      data: {
        fileName: normalizeText(createImportPreviewDto.fileName),
        source: normalizeText(createImportPreviewDto.source) ?? 'CSV manual',
        totalRows: movementsWithDuplicateInfo.length,
        duplicateRows,
        status: 'PREVIEW',
        notes: normalizeText(createImportPreviewDto.notes),
        movements: {
          create: movementsWithDuplicateInfo.map((movement) => ({
            rowNumber: movement.rowNumber,
            rawDate: movement.rawDate,
            rawDescription: movement.rawDescription,
            rawAmount: movement.rawAmount,
            parsedDate: movement.parsedDate,
            description: movement.description,
            amount: movement.amount,
            suggestedType: movement.suggestedType,
            suggestedCategory: movement.suggestedCategory,
            suggestedPaymentMethod: movement.suggestedPaymentMethod,
            duplicateScore: movement.duplicateScore,
            possibleDuplicateId: movement.possibleDuplicateId,
            status: movement.status,
          })),
        },
      },
      include: {
        movements: {
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    return this.enrichBatch(batch);
  }

  async findBatches() {
    const batches = await this.prisma.importBatch.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { movements: true },
        },
      },
      take: 20,
    });

    return batches;
  }

  async findBatch(id: string) {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id },
      include: {
        movements: {
          include: { debt: true },
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!batch) throw new NotFoundException('El lote de importación no existe.');

    return this.enrichBatch(batch);
  }

  async updateMovement(id: string, updateImportedMovementDto: UpdateImportedMovementDto) {
    const currentMovement = await this.prisma.importedMovement.findUnique({ where: { id } });

    if (!currentMovement) throw new NotFoundException('El movimiento importado no existe.');

    if (currentMovement.status === ImportedMovementStatus.IMPORTED) {
      throw new BadRequestException('No puedes editar un movimiento que ya fue importado.');
    }

    const nextType = updateImportedMovementDto.suggestedType ?? currentMovement.suggestedType;
    const nextParsedDate = updateImportedMovementDto.parsedDate
      ? new Date(`${updateImportedMovementDto.parsedDate}T00:00:00.000Z`)
      : currentMovement.parsedDate;

    const updatedMovement = await this.prisma.importedMovement.update({
      where: { id },
      data: {
        parsedDate: nextParsedDate,
        description: updateImportedMovementDto.description?.trim(),
        amount: updateImportedMovementDto.amount,
        suggestedType: nextType,
        suggestedCategory: normalizeText(updateImportedMovementDto.suggestedCategory),
        suggestedPaymentMethod: normalizeText(updateImportedMovementDto.suggestedPaymentMethod),
        debtId: updateImportedMovementDto.debtId,
        notes: normalizeText(updateImportedMovementDto.notes),
        status: nextType === ImportedMovementType.UNKNOWN || !nextParsedDate
          ? ImportedMovementStatus.PENDING
          : ImportedMovementStatus.CLASSIFIED,
      },
      include: { debt: true },
    });

    await this.recalculateBatch(updatedMovement.batchId);
    return updatedMovement;
  }

  async ignoreMovement(id: string) {
    const movement = await this.prisma.importedMovement.findUnique({ where: { id } });

    if (!movement) throw new NotFoundException('El movimiento importado no existe.');

    if (movement.status === ImportedMovementStatus.IMPORTED) {
      throw new BadRequestException('No puedes ignorar un movimiento que ya fue importado.');
    }

    const updatedMovement = await this.prisma.importedMovement.update({
      where: { id },
      data: { status: ImportedMovementStatus.IGNORED },
    });

    await this.recalculateBatch(updatedMovement.batchId);
    return updatedMovement;
  }

  async commitBatch(id: string, commitImportBatchDto: CommitImportBatchDto) {
    const batch = await this.prisma.importBatch.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { rowNumber: 'asc' },
        },
      },
    });

    if (!batch) throw new NotFoundException('El lote de importación no existe.');

    const selectedIds = new Set(commitImportBatchDto.movementIds ?? []);
    const movementsToImport = batch.movements.filter((movement) => {
      if (selectedIds.size > 0 && !selectedIds.has(movement.id)) return false;
      return (
  movement.status === ImportedMovementStatus.PENDING ||
  movement.status === ImportedMovementStatus.CLASSIFIED
);
    });

    const imported: Array<{ movementId: string; entityType: string; entityId: string }> = [];
    const errors: Array<{ movementId: string; rowNumber: number; message: string }> = [];

    for (const movement of movementsToImport) {
      try {
        const result = await this.importMovement(movement);
        imported.push({ movementId: movement.id, entityType: result.entityType, entityId: result.entityId });

        await this.prisma.importedMovement.update({
          where: { id: movement.id },
          data: {
            status: ImportedMovementStatus.IMPORTED,
            importedEntityType: result.entityType,
            importedEntityId: result.entityId,
          },
        });
      } catch (error) {
        errors.push({
          movementId: movement.id,
          rowNumber: movement.rowNumber,
          message: error instanceof Error ? error.message : 'No se pudo importar el movimiento.',
        });
      }
    }

    const updatedBatch = await this.recalculateBatch(id, errors.length ? 'PARTIALLY_COMMITTED' : 'COMMITTED');

    return {
      batch: updatedBatch,
      imported,
      errors,
      message: errors.length
        ? 'Importación parcial completada. Algunos movimientos requieren revisión.'
        : 'Importación completada correctamente.',
    };
  }

  private async importMovement(movement: {
    id: string;
    parsedDate: Date | null;
    description: string;
    amount: number;
    suggestedType: ImportedMovementType;
    suggestedCategory: string | null;
    suggestedPaymentMethod: string | null;
    debtId: string | null;
    notes: string | null;
  }) {
    if (!movement.parsedDate) {
      throw new BadRequestException('El movimiento no tiene una fecha válida.');
    }

    if (movement.suggestedType === ImportedMovementType.UNKNOWN) {
      throw new BadRequestException('Debes clasificar el movimiento antes de importarlo.');
    }

    if (!movement.suggestedCategory) {
      throw new BadRequestException('Debes asignar una categoría antes de importar.');
    }

    if (movement.suggestedType === ImportedMovementType.INCOME) {
      const income = await this.prisma.income.create({
        data: {
          description: movement.description,
          amount: movement.amount,
          category: movement.suggestedCategory,
          receivedAt: movement.parsedDate,
          paymentMethod: movement.suggestedPaymentMethod,
          notes: movement.notes ?? 'Importado desde CSV.',
        },
      });

      return { entityType: 'INCOME', entityId: income.id };
    }

    const expense = await this.expensesService.create({
      description: movement.description,
      amount: movement.amount,
      category: movement.suggestedType === ImportedMovementType.DEBT_PAYMENT ? 'Pago de deuda' : movement.suggestedCategory,
      spentAt: movement.parsedDate.toISOString(),
      paymentMethod: movement.suggestedPaymentMethod ?? undefined,
      type: movement.suggestedType === ImportedMovementType.DEBT_PAYMENT ? ExpenseType.DEBT_PAYMENT : ExpenseType.COMMON,
      debtId: movement.suggestedType === ImportedMovementType.DEBT_PAYMENT ? movement.debtId ?? undefined : undefined,
      notes: movement.notes ?? 'Importado desde CSV.',
    });

    return { entityType: 'EXPENSE', entityId: expense.id };
  }

  private async findPossibleDuplicate(movement: NormalizedMovement) {
    if (!movement.parsedDate || movement.suggestedType === ImportedMovementType.UNKNOWN) return undefined;

    const { start, end } = getDayRange(movement.parsedDate);

    if (movement.suggestedType === ImportedMovementType.INCOME) {
      return this.prisma.income.findFirst({
        where: {
          amount: movement.amount,
          receivedAt: { gte: start, lte: end },
          description: { contains: movement.description.slice(0, 24), mode: 'insensitive' },
        },
      });
    }

    return this.prisma.expense.findFirst({
      where: {
        amount: movement.amount,
        spentAt: { gte: start, lte: end },
        description: { contains: movement.description.slice(0, 24), mode: 'insensitive' },
      },
    });
  }

  private async recalculateBatch(id: string, forcedStatus?: string) {
    const movements = await this.prisma.importedMovement.findMany({ where: { batchId: id } });
    const importedRows = movements.filter((movement) => movement.status === ImportedMovementStatus.IMPORTED).length;
    const duplicateRows = movements.filter((movement) => movement.status === ImportedMovementStatus.DUPLICATE).length;

    const status = forcedStatus
      ?? (importedRows > 0 && importedRows + duplicateRows + movements.filter((m) => m.status === ImportedMovementStatus.IGNORED).length === movements.length
        ? 'COMMITTED'
        : 'PREVIEW');

    return this.prisma.importBatch.update({
      where: { id },
      data: {
        importedRows,
        duplicateRows,
        totalRows: movements.length,
        status,
      },
      include: {
        movements: {
          include: { debt: true },
          orderBy: { rowNumber: 'asc' },
        },
      },
    });
  }

  private enrichBatch<T extends { movements?: Array<{ status: ImportedMovementStatus; suggestedType: ImportedMovementType }> }>(batch: T) {
    const movements = batch.movements ?? [];

    return {
      ...batch,
      summary: {
        total: movements.length,
        pending: movements.filter((movement) => movement.status === ImportedMovementStatus.PENDING).length,
        classified: movements.filter((movement) => movement.status === ImportedMovementStatus.CLASSIFIED).length,
        imported: movements.filter((movement) => movement.status === ImportedMovementStatus.IMPORTED).length,
        duplicates: movements.filter((movement) => movement.status === ImportedMovementStatus.DUPLICATE).length,
        ignored: movements.filter((movement) => movement.status === ImportedMovementStatus.IGNORED).length,
        incomes: movements.filter((movement) => movement.suggestedType === ImportedMovementType.INCOME).length,
        expenses: movements.filter((movement) => movement.suggestedType === ImportedMovementType.EXPENSE).length,
        debtPayments: movements.filter((movement) => movement.suggestedType === ImportedMovementType.DEBT_PAYMENT).length,
      },
    };
  }
}
