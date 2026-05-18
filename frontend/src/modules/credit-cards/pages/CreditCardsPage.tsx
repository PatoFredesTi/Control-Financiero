import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarClock, CreditCard, Landmark, Plus, ReceiptText, RefreshCw, ShieldCheck } from 'lucide-react';
import { ActionBanner } from '../../../components/ui/ActionBanner';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatCard } from '../../../components/ui/StatCard';
import { formatCurrency } from '../../../utils/formatCurrency';
import { getApiErrorMessage } from '../../../utils/getApiErrorMessage';
import { createCreditCard, createInstallmentPurchase, getCardPurchases, getCreditCardSummary, getCreditCards, getUpcomingInstallments, payInstallment } from '../services/creditCardsApi';
import type { CreditCard as CreditCardType } from '../types/creditCard';

const currentDate = new Date();
const initialCardForm = {
  name: '',
  issuer: '',
  limitAmount: 500000,
  billingDay: 25,
  paymentDueDay: 10,
  notes: '',
};

const initialPurchaseForm = {
  description: '',
  category: 'Compras',
  totalAmount: 120000,
  installmentsCount: 3,
  firstInstallmentAt: new Date().toISOString().slice(0, 10),
  notes: '',
};

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Activa',
    PAUSED: 'Pausada',
    CLOSED: 'Cerrada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    PENDING: 'Pendiente',
    PAID: 'Pagada',
  };
  return labels[status] ?? status;
}

function utilization(card: CreditCardType) {
  return card.limitAmount > 0 ? Math.round((card.usedAmount / card.limitAmount) * 100) : 0;
}

export function CreditCardsPage() {
  const queryClient = useQueryClient();
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [cardForm, setCardForm] = useState(initialCardForm);
  const [purchaseForm, setPurchaseForm] = useState(initialPurchaseForm);
  const [message, setMessage] = useState<{ variant: 'success' | 'error' | 'info' | 'warning'; text: string } | null>(null);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const summaryQuery = useQuery({ queryKey: ['credit-cards-summary'], queryFn: getCreditCardSummary });
  const cardsQuery = useQuery({ queryKey: ['credit-cards'], queryFn: getCreditCards });
  const upcomingQuery = useQuery({ queryKey: ['credit-card-upcoming', month, year], queryFn: () => getUpcomingInstallments(month, year) });
  const purchasesQuery = useQuery({
    queryKey: ['credit-card-purchases', selectedCardId],
    queryFn: () => getCardPurchases(selectedCardId),
    enabled: Boolean(selectedCardId),
  });

  const selectedCard = useMemo(() => cardsQuery.data?.find((card) => card.id === selectedCardId), [cardsQuery.data, selectedCardId]);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['credit-cards-summary'] });
    queryClient.invalidateQueries({ queryKey: ['credit-cards'] });
    queryClient.invalidateQueries({ queryKey: ['credit-card-upcoming'] });
    queryClient.invalidateQueries({ queryKey: ['credit-card-purchases'] });
  };

  const createCardMutation = useMutation({
    mutationFn: createCreditCard,
    onSuccess: (card) => {
      setMessage({ variant: 'success', text: 'Tarjeta creada correctamente.' });
      setCardForm(initialCardForm);
      setSelectedCardId(card.id);
      refreshAll();
    },
    onError: (error) => setMessage({ variant: 'error', text: getApiErrorMessage(error) }),
  });

  const createPurchaseMutation = useMutation({
    mutationFn: () => createInstallmentPurchase(selectedCardId, purchaseForm),
    onSuccess: () => {
      setMessage({ variant: 'success', text: 'Compra en cuotas registrada. El cupo utilizado fue actualizado y las cuotas fueron generadas.' });
      setPurchaseForm(initialPurchaseForm);
      refreshAll();
    },
    onError: (error) => setMessage({ variant: 'error', text: getApiErrorMessage(error) }),
  });

  const payInstallmentMutation = useMutation({
    mutationFn: (id: string) => payInstallment(id),
    onSuccess: () => {
      setMessage({ variant: 'success', text: 'Cuota pagada. Se registró un gasto común y se liberó cupo de la tarjeta.' });
      refreshAll();
    },
    onError: (error) => setMessage({ variant: 'error', text: getApiErrorMessage(error) }),
  });

  const onCreateCard = (event: FormEvent) => {
    event.preventDefault();
    createCardMutation.mutate(cardForm);
  };

  const onCreatePurchase = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCardId) {
      setMessage({ variant: 'warning', text: 'Selecciona una tarjeta antes de registrar una compra.' });
      return;
    }
    createPurchaseMutation.mutate();
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <section className="mx-auto max-w-7xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-300 transition hover:border-emerald-500 hover:text-emerald-300"><ArrowLeft size={16} /> Volver al dashboard</Link>

        <header className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl sm:p-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-300"><CreditCard size={30} /></div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">v2.3 — Tarjetas, cuotas y compromisos futuros</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Tarjetas de crédito</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">Registra tarjetas, controla cupo utilizado, divide compras en cuotas y convierte cuotas pagadas en gastos reales para entender tus compromisos futuros.</p>
        </header>

        {message ? <ActionBanner variant={message.variant} message={message.text} onClose={() => setMessage(null)} /> : null}
        {summaryQuery.isError ? <ActionBanner variant="error" message={getApiErrorMessage(summaryQuery.error)} /> : null}

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Tarjetas" value={summaryQuery.data?.totalCards ?? '—'} helper="Registradas" tone="info" />
          <StatCard label="Cupo total" value={formatCurrency(summaryQuery.data?.totalLimit ?? 0)} />
          <StatCard label="Cupo utilizado" value={formatCurrency(summaryQuery.data?.totalUsed ?? 0)} tone={(summaryQuery.data?.utilizationPercentage ?? 0) >= 80 ? 'danger' : 'warning'} helper={`${summaryQuery.data?.utilizationPercentage ?? 0}% utilizado`} />
          <StatCard label="Disponible" value={formatCurrency(summaryQuery.data?.totalAvailable ?? 0)} tone="success" />
          <StatCard label="Cuotas del mes" value={formatCurrency(summaryQuery.data?.currentMonthPending ?? 0)} helper="Pendientes" tone="warning" />
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={onCreateCard} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-3 text-violet-300"><Landmark size={24} /></div>
              <div>
                <h2 className="text-xl font-bold">Nueva tarjeta</h2>
                <p className="mt-1 text-sm text-slate-400">Define cupo, banco, día de facturación y día de pago.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">Nombre<input required value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-500" placeholder="Visa / Mastercard / Lider" /></label>
              <label className="space-y-2 text-sm text-slate-300">Banco / emisor<input value={cardForm.issuer} onChange={(e) => setCardForm({ ...cardForm, issuer: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-500" placeholder="Banco Demo" /></label>
              <label className="space-y-2 text-sm text-slate-300">Cupo total<input type="number" min="1" value={cardForm.limitAmount} onChange={(e) => setCardForm({ ...cardForm, limitAmount: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-500" /></label>
              <label className="space-y-2 text-sm text-slate-300">Día facturación<input type="number" min="1" max="31" value={cardForm.billingDay} onChange={(e) => setCardForm({ ...cardForm, billingDay: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-500" /></label>
              <label className="space-y-2 text-sm text-slate-300">Día pago<input type="number" min="1" max="31" value={cardForm.paymentDueDay} onChange={(e) => setCardForm({ ...cardForm, paymentDueDay: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-violet-500" /></label>
            </div>

            <button disabled={createCardMutation.isPending} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-violet-400 disabled:opacity-50"><Plus size={18} /> Crear tarjeta</button>
          </form>

          <form onSubmit={onCreatePurchase} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300"><ReceiptText size={24} /></div>
              <div>
                <h2 className="text-xl font-bold">Compra en cuotas</h2>
                <p className="mt-1 text-sm text-slate-400">Crea todas las cuotas futuras y actualiza el cupo utilizado.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">Tarjeta<select required value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500"><option value="">Selecciona una tarjeta</option>{cardsQuery.data?.map((card) => <option key={card.id} value={card.id}>{card.name} — disponible {formatCurrency(card.limitAmount - card.usedAmount)}</option>)}</select></label>
              <label className="space-y-2 text-sm text-slate-300">Descripción<input required value={purchaseForm.description} onChange={(e) => setPurchaseForm({ ...purchaseForm, description: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" placeholder="Notebook / pasajes / compra grande" /></label>
              <label className="space-y-2 text-sm text-slate-300">Categoría<input required value={purchaseForm.category} onChange={(e) => setPurchaseForm({ ...purchaseForm, category: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" /></label>
              <label className="space-y-2 text-sm text-slate-300">Monto total<input type="number" min="1" value={purchaseForm.totalAmount} onChange={(e) => setPurchaseForm({ ...purchaseForm, totalAmount: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" /></label>
              <label className="space-y-2 text-sm text-slate-300">Cuotas<input type="number" min="1" max="60" value={purchaseForm.installmentsCount} onChange={(e) => setPurchaseForm({ ...purchaseForm, installmentsCount: Number(e.target.value) })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" /></label>
              <label className="space-y-2 text-sm text-slate-300 md:col-span-2">Primera cuota<input type="date" required value={purchaseForm.firstInstallmentAt} onChange={(e) => setPurchaseForm({ ...purchaseForm, firstInstallmentAt: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-emerald-500" /></label>
            </div>

            <button disabled={createPurchaseMutation.isPending || !selectedCardId} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"><Plus size={18} /> Registrar compra</button>
          </form>
        </section>

        <section className="mb-8 rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">Tarjetas registradas</h2>
              <p className="mt-1 text-sm text-slate-400">Controla cupo, compras asociadas y estado.</p>
            </div>
            <button onClick={refreshAll} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-500 hover:text-violet-300"><RefreshCw size={16} /> Actualizar</button>
          </div>

          {cardsQuery.isLoading ? <EmptyState title="Cargando tarjetas" description="Estamos consultando tus tarjetas registradas." icon={<CreditCard size={32} />} /> : cardsQuery.data?.length === 0 ? <EmptyState title="Aún no hay tarjetas" description="Crea tu primera tarjeta para registrar compras en cuotas y compromisos futuros." icon={<CreditCard size={32} />} /> : (
            <div className="grid gap-5 lg:grid-cols-2">
              {cardsQuery.data?.map((card) => {
                const percentage = utilization(card);
                return (
                  <article key={card.id} className={`rounded-2xl border p-5 shadow-xl ${selectedCardId === card.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800 bg-slate-950/50'}`}>
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{card.name}</h3>
                        <p className="text-sm text-slate-400">{card.issuer || 'Sin emisor'} · {statusLabel(card.status)}</p>
                      </div>
                      <button onClick={() => setSelectedCardId(card.id)} className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-violet-500 hover:text-violet-300">Seleccionar</button>
                    </div>
                    <div className="mb-3 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-violet-400" style={{ width: `${Math.min(percentage, 100)}%` }} /></div>
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-xl bg-slate-900 p-3"><span className="block text-xs text-slate-500">Utilizado</span><strong>{formatCurrency(card.usedAmount)}</strong></div>
                      <div className="rounded-xl bg-slate-900 p-3"><span className="block text-xs text-slate-500">Disponible</span><strong>{formatCurrency(card.limitAmount - card.usedAmount)}</strong></div>
                      <div className="rounded-xl bg-slate-900 p-3"><span className="block text-xs text-slate-500">Compras</span><strong>{card._count?.purchases ?? 0}</strong></div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Facturación día {card.billingDay} · pago día {card.paymentDueDay}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Cuotas del mes</h2>
                <p className="mt-1 text-sm text-slate-400">Paga una cuota para registrar el gasto y liberar cupo.</p>
              </div>
              <div className="flex gap-2">
                <input type="number" min="1" max="12" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-20 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500" />
                <input type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-violet-500" />
              </div>
            </div>

            {upcomingQuery.isLoading ? <EmptyState title="Cargando cuotas" description="Buscando cuotas del período seleccionado." icon={<CalendarClock size={32} />} /> : upcomingQuery.data?.installments.length === 0 ? <EmptyState title="Sin cuotas en este período" description="No hay cuotas programadas para el mes seleccionado." icon={<ShieldCheck size={32} />} /> : (
              <div className="space-y-3">
                {upcomingQuery.data?.installments.map((installment) => (
                  <article key={installment.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-semibold">{installment.purchase?.description}</h3>
                        <p className="mt-1 text-sm text-slate-400">Cuota {installment.number}/{installment.purchase?.installmentsCount} · {new Date(installment.dueAt).toLocaleDateString('es-CL')} · {installment.purchase?.creditCard?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong>{formatCurrency(installment.amount)}</strong>
                        {installment.status === 'PENDING' ? <button onClick={() => payInstallmentMutation.mutate(installment.id)} disabled={payInstallmentMutation.isPending} className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">Pagar</button> : <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Pagada</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-2xl font-bold">Compras de la tarjeta seleccionada</h2>
            <p className="mt-1 text-sm text-slate-400">{selectedCard ? `${selectedCard.name} · ${formatCurrency(selectedCard.usedAmount)} utilizado` : 'Selecciona una tarjeta para ver sus compras.'}</p>

            <div className="mt-5">
              {!selectedCardId ? <EmptyState title="Selecciona una tarjeta" description="Al seleccionar una tarjeta podrás revisar sus compras en cuotas y el avance de pago." icon={<CreditCard size={32} />} /> : purchasesQuery.isLoading ? <EmptyState title="Cargando compras" description="Buscando compras asociadas a esta tarjeta." icon={<ReceiptText size={32} />} /> : purchasesQuery.data?.length === 0 ? <EmptyState title="Sin compras en cuotas" description="Registra una compra para generar cuotas futuras." icon={<ReceiptText size={32} />} /> : (
                <div className="space-y-4">
                  {purchasesQuery.data?.map((purchase) => {
                    const progress = purchase.totalAmount > 0 ? Math.round((purchase.paidAmount / purchase.totalAmount) * 100) : 0;
                    return (
                      <article key={purchase.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold">{purchase.description}</h3>
                            <p className="mt-1 text-sm text-slate-400">{purchase.category} · {statusLabel(purchase.status)}</p>
                          </div>
                          <strong>{formatCurrency(purchase.totalAmount)}</strong>
                        </div>
                        <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
                        <div className="grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                          <span>Pagado: {formatCurrency(purchase.paidAmount)}</span>
                          <span>Pendiente: {formatCurrency(purchase.pendingAmount)}</span>
                          <span>Cuotas: {purchase.installmentsCount}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
