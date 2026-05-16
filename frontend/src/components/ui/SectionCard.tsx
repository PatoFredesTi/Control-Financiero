import type { ReactNode } from 'react';

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <section className={`rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl sm:p-6 ${className}`}>
      {children}
    </section>
  );
}
