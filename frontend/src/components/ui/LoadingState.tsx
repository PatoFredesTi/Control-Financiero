interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = 'Cargando información',
  description = 'Estamos preparando los datos financieros.',
}: LoadingStateProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-300 shadow-xl">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
