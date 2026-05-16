export interface ApiMeta {
  requestId?: string;
  timestamp: string;
  version: string;
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code: string;
    path?: string;
  };
  meta: ApiMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

const API_VERSION = '2.9.0';

export function createApiMeta(extra?: Record<string, unknown>): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    version: API_VERSION,
    ...extra,
  };
}

export function createSuccessResponse<T>(data: T, meta?: Record<string, unknown>): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: createApiMeta(meta),
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  pagination: PaginationMeta,
  meta?: Record<string, unknown>,
): ApiSuccessResponse<{ items: T[]; pagination: PaginationMeta }> {
  return createSuccessResponse(
    {
      items,
      pagination,
    },
    meta,
  );
}
