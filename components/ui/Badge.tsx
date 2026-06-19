import type { ReactNode } from 'react';

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-[#6D4BFF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
      {children}
    </span>
  );
}
