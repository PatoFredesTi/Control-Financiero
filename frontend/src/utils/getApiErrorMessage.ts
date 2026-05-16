type ApiError = {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
  message?: string;
};

export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado.') {
  const apiError = error as ApiError | null;
  const message = apiError?.response?.data?.message;

  if (Array.isArray(message)) return message.join(' ');
  if (message) return message;
  if (apiError?.message) return apiError.message;

  return fallback;
}
