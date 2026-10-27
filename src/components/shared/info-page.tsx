import type { ReactNode } from "react";
export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-brand-blue text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">{children}</div>}
      </div>
    </section>
  );
}
export function Prose({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="max-w-3xl space-y-5 text-base leading-relaxed text-slate-body [&_h2]:pt-4 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink [&_strong]:text-ink">{children}</div></div>;
}
