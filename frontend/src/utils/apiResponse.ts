export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string | string[];
    code: string;
    path?: string;
  };
  meta: {
    timestamp: string;
    version: string;
    [key: string]: unknown;
  };
}

export function unwrapApiResponse<T>(payload: T | ApiSuccessResponse<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    (payload as ApiSuccessResponse<T>).success === true &&
    'data' in payload
  ) {
    return (payload as ApiSuccessResponse<T>).data;
  }

  return payload as T;
}
