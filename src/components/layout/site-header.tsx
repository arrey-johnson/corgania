"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NavLink } from "@/components/layout/nav-link";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const c = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);

  const NAV: { label: string; items: readonly (readonly [string, string])[] }[] = [
    {
      label: t("markets"),
      items: [
        [t("africanMarkets"), "/markets"],
        [t("commodities"), "/commodities"],
        [t("productsIndustries"), "/products"],
        [t("tradeOpportunities"), "/trade-opportunities"],
      ],
    },
    {
      label: t("insights"),
      items: [
        [t("newsAnalysis"), "/insights"],
        [t("howItWorks"), "/how-it-works"],
        [t("about"), "/about"],
      ],
    },
    {
      label: t("membership"),
      items: [
        [t("membershipOverview"), "/membership"],
        [t("forSellers"), "/membership/sellers"],
        [t("forBuyers"), "/membership/buyers"],
      ],
    },
  ];

  function sectionActive(items: readonly (readonly [string, string])[]) {
    return items.some(([_, href]) => pathname === href || pathname.startsWith(`${href}/`));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 overflow-hidden px-4 sm:h-16 sm:px-6 lg:gap-4 lg:px-8">
        <Link href="/" aria-label={c("homeAria")} className="block h-8 w-[128px] shrink-0 sm:h-9 sm:w-[148px] lg:h-10 lg:w-[168px]">
          <Image
            src="/brand/corgania-logo.png"
            alt="Corgania"
            width={168}
            height={40}
            className="!h-full !w-full object-contain object-left"
            style={{ height: "100%", width: "100%" }}
            priority
          />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((g) => {
            const active = sectionActive(g.items);
            return (
              <div key={g.label} className="relative" onMouseEnter={() => setDrop(g.label)} onMouseLeave={() => setDrop(null)}>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold hover:text-brand-blue",
                    active ? "text-brand-blue" : "text-ink",
                  )}
                  aria-expanded={drop === g.label}
                  aria-current={active ? "true" : undefined}
                >
                  {g.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", drop === g.label && "rotate-180")} />
                </button>
                {drop === g.label && (
                  <div className="absolute left-0 top-full w-64 rounded-xl border border-line bg-white p-2 shadow-xl">
                    {g.items.map(([label, href]) => (
                      <NavLink
                        key={href}
                        href={href}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface hover:text-brand-blue"
                        activeClassName="bg-surface text-brand-blue font-semibold"
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <NavLink
            href="/contact"
            exact
            className="rounded-md px-3 py-2 text-sm font-semibold text-ink hover:text-brand-blue"
            activeClassName="text-brand-blue"
          >
            {c("contact")}
          </NavLink>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Link href="/login" className="rounded-md px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-surface">
            {c("login")}
          </Link>
          <Link href="/register" className="rounded-md bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-red-dark">
            {c("becomeMember")}
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="compact" />
          <button
            type="button"
            className="rounded-md p-2"
            onClick={() => setOpen(!open)}
            aria-label={c("toggleMenu")}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="max-h-[min(70vh,520px)] overflow-y-auto border-t border-line bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          {NAV.map((g) => {
            const expanded = mobileSection === g.label;
            const active = sectionActive(g.items);
            return (
              <div key={g.label} className="border-b border-line last:border-0">
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold",
                    active ? "text-brand-blue" : "text-ink",
                  )}
                  aria-expanded={expanded}
                  onClick={() => setMobileSection(expanded ? null : g.label)}
                >
                  {g.label}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                </button>
                {expanded && (
                  <div className="pb-2 pl-2">
                    {g.items.map(([label, href]) => (
                      <NavLink
                        key={href}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="block rounded-md px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                        activeClassName="bg-surface text-brand-blue font-semibold"
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <NavLink
            href="/contact"
            exact
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md px-3 py-2.5 text-sm font-semibold text-ink"
            activeClassName="bg-surface text-brand-blue"
          >
            {c("contact")}
          </NavLink>
          <div className="mt-3 flex gap-2 px-3 pb-2">
            <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-line py-2.5 text-center text-sm font-semibold text-brand-blue">
              {c("login")}
            </Link>
            <Link href="/register" onClick={() => setOpen(false)} className="flex-1 rounded-md bg-brand-red py-2.5 text-center text-sm font-semibold text-white">
              {c("becomeMember")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
