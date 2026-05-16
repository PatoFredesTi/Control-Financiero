import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ActionBannerVariant = 'success' | 'error' | 'info' | 'warning';

type ActionBannerProps = {
  message?: string | null;
  variant?: ActionBannerVariant;
  onClose?: () => void;
};

const variantClasses: Record<ActionBannerVariant, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  error: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
  info: 'border-sky-500/30 bg-sky-500/10 text-sky-100',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
};

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

export function ActionBanner({ message, variant = 'info', onClose }: ActionBannerProps) {
  if (!message) return null;

  const Icon = icons[variant];

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm ${variantClasses[variant]}`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <p className="leading-6">{message}</p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
          aria-label="Cerrar mensaje"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
