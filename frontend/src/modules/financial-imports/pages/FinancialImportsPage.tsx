import { ChangeEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, FileSpreadsheet, Filter, Info, RefreshCw, UploadCloud, Wand2 } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getDebts } from '../../debts/services/debtsApi';
import { commitImportBatch, createImportPreview, getImportBatch, ignoreImportedMovement, updateImportedMovement } from '../services/financialImportsApi';
import type { ImportBatch, ImportedMovement, ImportedMovementStatus, ImportedMovementType, UpdateImportedMovementInput } from '../types/financialImport';

const sampleCsv = `fecha;descripcion;monto;categoria;metodo\n2026-05-05;Sueldo empresa;1800000;Sueldo;Transferencia\n2026-05-06;Unimarc supermercado;-42500;;Tarjeta debito\n2026-05-08;Netflix;-9500;;Tarjeta credito\n2026-05-10;Pago deuda ABC;-120000;Pago de deuda;Transferencia\n2026-05-12;Venta producto;65000;Ventas;Transferencia`;

const statusClasses: Record<ImportedMovementStatus, string> = {
  PENDING: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  CLASSIFIED: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  IMPORTED: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  DUPLICATE: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  IGNORED: 'border-slate-700 bg-slate-800 text-slate-300',
};

const typeLabels: Record<ImportedMovementType, string> = {
  INCOME: 'Ingreso',
  EXPENSE: 'Gasto',
  DEBT_PAYMENT: 'Pago de deuda',
  UNKNOWN: 'Sin clasificar',
};

const statusLabels: Record<ImportedMovementStatus, string> = {
  PENDING: 'Pendiente',
  CLASSIFIED: 'Clasificado',
  IMPORTED: 'Importado',
  DUPLICATE: 'Duplicado',
  IGNORED: 'Ignorado',
};

function toInputDate(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

function isImportable(movement: ImportedMovement) {
  return ['PENDING', 'CLASSIFIED'].includes(movement.status);
}

export function FinancialImportsPage() {
  const [csvText, setCsvText] = useState(sampleCsv);
  const [fileName, setFileName] = useState('movimientos-demo.csv');
  const [source, setSource] = useState('CSV manual');
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t' | 'auto'>('auto');
  const [bankTemplate, setBankTemplate] = useState('generic');
  const [amountMode, setAmountMode] = useState<'SIGNED' | 'DEBIT_CREDIT'>('SIGNED');
  const [batch, setBatch] = useState<ImportBatch | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const debtsQuery = useQuery({
    queryKey: ['debts', 'financial-imports'],
    queryFn: () => getDebts(),
  });

  const previewMutation = useMutation({
    mutationFn: createImportPreview,
    onSuccess: (data) => {
      setBatch(data);
      setSelectedIds(data.movements.filter(isImportable).map((movement) => movement.id));
      setMessage({ type: 'success', text: 'Vista previa creada. Revisa las sugerencias antes de confirmar la importación.' });
    },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateImportedMovementInput }) => updateImportedMovement(id, input),
    onSuccess: async (_data, variables) => {
      if (!batch) return;
      const refreshedBatch = await getImportBatch(batch.id);
      setBatch(refreshedBatch);
      setSelectedIds((current) => current.includes(variables.id) ? current : [...current, variables.id]);
    },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) }),
  });

  const ignoreMutation = useMutation({
    mutationFn: ignoreImportedMovement,
    onSuccess: async (_data, id) => {
      if (!batch) return;
      const refreshedBatch = await getImportBatch(batch.id);
      setBatch(refreshedBatch);
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
      setMessage({ type: 'info', text: 'Movimiento marcado como ignorado.' });
    },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) }),
  });

  const commitMutation = useMutation({
    mutationFn: () => {
      if (!batch) throw new Error('No existe un lote para importar.');
      return commitImportBatch(batch.id, selectedIds);
    },
    onSuccess: (result) => {
      setBatch(result.batch);
      setSelectedIds([]);
      setMessage({ type: result.errors.length ? 'info' : 'success', text: result.message });
    },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error) }),
  });

  const importableCount = useMemo(() => batch?.movements.filter((movement) => selectedIds.includes(movement.id) && isImportable(movement)).length ?? 0, [batch, selectedIds]);

  const debts = debtsQuery.data ?? [];

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setCsvText(await file.text());
    setMessage({ type: 'info', text: `Archivo ${file.name} cargado. Ahora puedes generar la vista previa.` });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  };

  const updateMovement = (movement: ImportedMovement, field: keyof ImportedMovement | 'parsedDate', value: string | number | null) => {
    const normalizedValue = field === 'debtId' && value === '' ? null : value;

    updateMutation.mutate({
      id: movement.id,
      input: {
        [field]: normalizedValue,
      } as UpdateImportedMovementInput,
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al inicio</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400"><FileSpreadsheet size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">v2.8 — Importador mejorado</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Importar movimientos</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Carga movimientos desde CSV, usa plantillas por banco, modo cargo/abono, revisa sugerencias, detecta duplicados y convierte cada fila en ingreso, gasto o pago de deuda.</p>
        </header>

        {message ? <ActionBanner variant={message.type} message={message.text} onClose={() => setMessage(null)} /> : null}

        <section className="mb-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">1. Cargar CSV</h2>
                <p className="mt-1 text-sm text-slate-400">Encabezados soportados: fecha, descripción/glosa, monto, categoría, método y tipo.</p>
              </div>
              <UploadCloud className="text-emerald-300" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                <span>Nombre archivo</span>
                <input value={fileName} onChange={(event) => setFileName(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Origen</span>
                <input value={source} onChange={(event) => setSource(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Separador</span>
                <select value={delimiter} onChange={(event) => setDelimiter(event.target.value as ',' | ';' | '\t' | 'auto')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500">
                  <option value="auto">Detectar automáticamente</option>
                  <option value=";">Punto y coma (;)</option>
                  <option value=",">Coma (,)</option>
                  <option value="\t">Tabulación</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Plantilla banco</span>
                <select value={bankTemplate} onChange={(event) => setBankTemplate(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500">
                  <option value="generic">Genérica</option>
                  <option value="bancoestado">BancoEstado</option>
                  <option value="santander">Santander</option>
                  <option value="bci">BCI</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Modo de monto</span>
                <select value={amountMode} onChange={(event) => setAmountMode(event.target.value as 'SIGNED' | 'DEBIT_CREDIT')} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500">
                  <option value="SIGNED">Monto con signo</option>
                  <option value="DEBIT_CREDIT">Cargo / abono separados</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                <span>Subir archivo</span>
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-3 file:py-1 file:font-semibold file:text-slate-950" />
              </label>
            </div>

            <textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} rows={11} className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-200 outline-none focus:border-emerald-500" />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => previewMutation.mutate({ csvText, fileName, source, delimiter, bankTemplate, amountMode })} disabled={previewMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"><Wand2 size={18} /> Generar vista previa</button>
              <button onClick={() => setCsvText(sampleCsv)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><RefreshCw size={18} /> Usar ejemplo</button>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-start gap-3">
              <Info className="mt-1 shrink-0 text-sky-300" />
              <div>
                <h2 className="text-xl font-bold">Cómo funciona la conciliación</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">El sistema analiza la fecha, descripción y monto. Si encuentra un movimiento igual ya registrado, lo marca como duplicado. Si detecta palabras como sueldo, supermercado, Netflix o pago de deuda, sugiere tipo y categoría.</p>
              </div>
            </div>

            {batch ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard label="Filas detectadas" value={batch.summary.total} tone="info" />
                <StatCard label="Listas para importar" value={batch.summary.classified + batch.summary.pending} tone="success" />
                <StatCard label="Duplicados" value={batch.summary.duplicates} tone="danger" />
                <StatCard label="Ya importadas" value={batch.summary.imported} tone="success" />
              </div>
            ) : (
              <EmptyState title="Sin lote cargado" description="Pega un CSV o sube un archivo para generar una vista previa de importación." />
            )}

            {batch ? (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <h3 className="mb-2 font-semibold text-slate-200">Resumen de clasificación</h3>
                <div className="grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
                  <span>Ingresos: {batch.summary.incomes}</span>
                  <span>Gastos: {batch.summary.expenses}</span>
                  <span>Pagos deuda: {batch.summary.debtPayments}</span>
                </div>
              </div>
            ) : null}
          </article>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-bold">2. Revisar y confirmar movimientos</h2>
              <p className="mt-1 text-sm text-slate-400">Puedes ajustar fecha, tipo, categoría, método y deuda asociada antes de importar.</p>
            </div>
            <button onClick={() => commitMutation.mutate()} disabled={!batch || importableCount === 0 || commitMutation.isPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"><CheckCircle2 size={18} /> Importar seleccionados ({importableCount})</button>
          </div>

          {batch?.movements.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border-separate border-spacing-y-3 text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Sel.</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">Descripción</th>
                    <th className="px-3 py-2">Monto</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Método</th>
                    <th className="px-3 py-2">Deuda</th>
                    <th className="px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.movements.map((movement) => (
                    <tr key={movement.id} className="rounded-2xl bg-slate-950 align-top">
                      <td className="rounded-l-2xl px-3 py-4">
                        <input type="checkbox" checked={selectedIds.includes(movement.id)} disabled={!isImportable(movement)} onChange={() => toggleSelected(movement.id)} className="h-4 w-4 accent-emerald-500" />
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses[movement.status]}`}>{statusLabels[movement.status]}</span>
                        {movement.duplicateScore > 0 ? <p className="mt-2 text-xs text-rose-300">Posible duplicado</p> : null}
                      </td>
                      <td className="px-3 py-4">
                        <input type="date" defaultValue={toInputDate(movement.parsedDate)} disabled={movement.status === 'IMPORTED'} onBlur={(event) => updateMovement(movement, 'parsedDate', event.target.value)} className="w-36 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500" />
                      </td>
                      <td className="px-3 py-4">
                        <input defaultValue={movement.description} disabled={movement.status === 'IMPORTED'} onBlur={(event) => updateMovement(movement, 'description', event.target.value)} className="w-64 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500" />
                        <p className="mt-1 text-xs text-slate-500">Fila {movement.rowNumber}</p>
                      </td>
                      <td className="px-3 py-4">
                        <input type="number" defaultValue={movement.amount} min={1} disabled={movement.status === 'IMPORTED'} onBlur={(event) => updateMovement(movement, 'amount', Number(event.target.value))} className="w-32 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500" />
                        <p className="mt-1 text-xs text-slate-500">{formatCurrency(movement.amount)}</p>
                      </td>
                      <td className="px-3 py-4">
                        <select value={movement.suggestedType} disabled={movement.status === 'IMPORTED'} onChange={(event) => updateMovement(movement, 'suggestedType', event.target.value)} className="w-40 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500">
                          {Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-4">
                        <input defaultValue={movement.suggestedCategory ?? ''} disabled={movement.status === 'IMPORTED'} onBlur={(event) => updateMovement(movement, 'suggestedCategory', event.target.value)} className="w-44 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500" />
                      </td>
                      <td className="px-3 py-4">
                        <input defaultValue={movement.suggestedPaymentMethod ?? ''} disabled={movement.status === 'IMPORTED'} onBlur={(event) => updateMovement(movement, 'suggestedPaymentMethod', event.target.value)} className="w-44 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500" />
                      </td>
                      <td className="px-3 py-4">
                        <select value={movement.debtId ?? ''} disabled={movement.status === 'IMPORTED' || movement.suggestedType !== 'DEBT_PAYMENT'} onChange={(event) => updateMovement(movement, 'debtId', event.target.value)} className="w-48 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 outline-none focus:border-emerald-500">
                          <option value="">Seleccionar deuda</option>
                          {debts.map((debt) => <option key={debt.id} value={debt.id}>{debt.name} — {formatCurrency(debt.pendingAmount)}</option>)}
                        </select>
                      </td>
                      <td className="rounded-r-2xl px-3 py-4">
                        <button onClick={() => ignoreMutation.mutate(movement.id)} disabled={movement.status === 'IMPORTED'} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-500 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"><Filter size={14} /> Ignorar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin movimientos para revisar" description="Genera una vista previa para revisar movimientos y confirmar la carga masiva." />
          )}
        </section>
      </section>
    </main>
  );
}
