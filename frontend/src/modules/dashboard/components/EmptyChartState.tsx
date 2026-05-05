type EmptyChartStateProps = {
  message: string;
};

export function EmptyChartState({ message }: EmptyChartStateProps) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}
