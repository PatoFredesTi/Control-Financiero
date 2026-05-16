import { api } from '../../../services/api';
import type { NotificationCenterFilters, NotificationCenterResponse, NotificationsSummary } from '../types/notification';

function buildParams(filters: NotificationCenterFilters = {}) {
  const params = new URLSearchParams();

  if (filters.month) params.set('month', String(filters.month));
  if (filters.year) params.set('year', String(filters.year));
  if (filters.daysAhead) params.set('daysAhead', String(filters.daysAhead));
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.category) params.set('category', filters.category);

  return params.toString();
}

export async function getNotificationCenter(filters: NotificationCenterFilters = {}) {
  const query = buildParams(filters);
  const { data } = await api.get<NotificationCenterResponse>(`/notifications/center${query ? `?${query}` : ''}`);
  return data;
}

export async function getNotificationsSummary(filters: Pick<NotificationCenterFilters, 'month' | 'year' | 'daysAhead'> = {}) {
  const query = buildParams(filters);
  const { data } = await api.get<NotificationsSummary>(`/notifications/summary${query ? `?${query}` : ''}`);
  return data;
}
