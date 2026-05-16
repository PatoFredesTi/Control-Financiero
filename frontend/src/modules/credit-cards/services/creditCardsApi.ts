import { api } from '../../../services/api';
import type { CreateCreditCardInput, CreateInstallmentPurchaseInput, CreditCard, CreditCardSummary, Installment, InstallmentPurchase, UpcomingInstallmentsResponse } from '../types/creditCard';

export async function getCreditCards() {
  const response = await api.get<CreditCard[]>('/credit-cards');
  return response.data;
}

export async function getCreditCardSummary() {
  const response = await api.get<CreditCardSummary>('/credit-cards/summary');
  return response.data;
}

export async function createCreditCard(input: CreateCreditCardInput) {
  const response = await api.post<CreditCard>('/credit-cards', input);
  return response.data;
}

export async function createInstallmentPurchase(cardId: string, input: CreateInstallmentPurchaseInput) {
  const response = await api.post<InstallmentPurchase>(`/credit-cards/${cardId}/purchases`, input);
  return response.data;
}

export async function getCardPurchases(cardId: string) {
  const response = await api.get<InstallmentPurchase[]>(`/credit-cards/${cardId}/purchases`);
  return response.data;
}

export async function getUpcomingInstallments(month: number, year: number) {
  const response = await api.get<UpcomingInstallmentsResponse>('/credit-cards/installments/upcoming', {
    params: { month, year },
  });
  return response.data;
}

export async function payInstallment(id: string, input: { paidAt?: string; paymentMethod?: string; notes?: string } = {}) {
  const response = await api.post<Installment>(`/credit-cards/installments/${id}/pay`, input);
  return response.data;
}
