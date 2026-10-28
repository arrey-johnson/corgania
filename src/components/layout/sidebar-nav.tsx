"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { NavLink } from "@/components/layout/nav-link";
import { cn } from "@/lib/utils";

export type SidebarItem = { href: string; label: string; exact?: boolean };

function NavList({
  items,
  ariaLabel,
  onNavigate,
}: {
  items: SidebarItem[];
  ariaLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1" aria-label={ariaLabel}>
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          exact={item.exact}
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-white hover:text-brand-blue"
          activeClassName="bg-white text-brand-blue shadow-sm ring-1 ring-line"
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Desktop sidebar column — scrolls independently of the main pane. */
export function SidebarNav({
  items,
  ariaLabel,
  footer,
}: {
  items: SidebarItem[];
  ariaLabel: string;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4">
        <NavList items={items} ariaLabel={ariaLabel} />
      </div>
      {footer && (
        <div className="shrink-0 border-t border-line px-4 py-3 text-[11px] leading-relaxed text-slate-body">
          {footer}
        </div>
      )}
    </aside>
  );
}

/** Mobile menu control — place inside the scrolling main column. */
export function MobileSidebarMenu({
  items,
  ariaLabel,
  footer,
}: {
  items: SidebarItem[];
  ariaLabel: string;
  footer?: React.ReactNode;
}) {
  const c = useTranslations("common");
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4 lg:hidden">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold text-ink"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        {c("menu")}
      </button>
      {open && (
        <div className="mt-2 rounded-xl border border-line bg-white p-2 shadow-sm">
          <NavList items={items} ariaLabel={ariaLabel} onNavigate={() => setOpen(false)} />
          {footer && (
            <div className="mt-3 border-t border-line px-3 pt-3 text-[11px] leading-relaxed text-slate-body">{footer}</div>
          )}
        </div>
      )}
    </div>
  );
}

export function sidebarLinkClass(active: boolean) {
  return cn(
    "block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-white hover:text-brand-blue",
    active && "bg-white text-brand-blue shadow-sm ring-1 ring-line",
  );
}
