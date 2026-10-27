import type { ReactNode } from "react";
import { Card } from "@/components/ui/primitives";

export function AdminHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-body">{description}</p>
      </div>
      {actions}
    </div>
  );
}

export function AdminStatRow({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-body">{item.label}</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}

export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: ReactNode;
  empty?: string;
}) {
  return (
    <div className="mt-8 overflow-x-auto rounded-xl border border-line bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-line bg-surface text-xs uppercase tracking-wider text-slate-body">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <p className="border-t border-line px-4 py-8 text-center text-sm text-slate-body">{empty}</p>
      )}
    </div>
  );
}
