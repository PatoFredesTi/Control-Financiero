interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'No pudimos cargar la información', message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-100 shadow-xl">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-red-100/80">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-xl bg-red-400 px-4 py-2 text-sm font-semibold text-red-950 transition hover:bg-red-300"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
