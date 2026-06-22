import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({ children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-3xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 ${className ?? ''}`}>
      {children}
    </button>
  );
}
