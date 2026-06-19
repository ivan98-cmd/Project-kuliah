import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-3xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-slate-300 ${className ?? ''}`}>
      {children}
    </button>
  );
}
