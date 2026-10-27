"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const c = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<string | null>(null);

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

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:h-20 lg:gap-4 lg:px-8">
        <Link href="/" aria-label={c("homeAria")} className="flex shrink-0 items-center py-1">
          <Image src="/brand/corgania-logo.png" alt="Corgania" width={390} height={156} className="h-11 w-auto object-contain sm:h-12 lg:h-16" priority />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((g) => (
            <div key={g.label} className="relative" onMouseEnter={() => setDrop(g.label)} onMouseLeave={() => setDrop(null)}>
              <button className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-ink hover:text-brand-blue" aria-expanded={drop === g.label}>
                {g.label}
                <ChevronDown className={cn("h-4 w-4 transition-transform", drop === g.label && "rotate-180")} />
              </button>
              {drop === g.label && (
                <div className="absolute left-0 top-full w-64 rounded-xl border border-line bg-white p-2 shadow-xl">
                  {g.items.map(([label, href]) => (
                    <Link key={href} href={href} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-surface hover:text-brand-blue">
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link href="/contact" className="rounded-md px-3 py-2 text-sm font-semibold text-ink hover:text-brand-blue">
            {c("contact")}
          </Link>
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
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="compact" />
          <button className="rounded-md p-2" onClick={() => setOpen(!open)} aria-label={c("toggleMenu")} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-line bg-white px-4 py-4 lg:hidden" aria-label="Mobile">
          {NAV.flatMap((g) => g.items).map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
              {label}
            </Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-semibold">
            {c("contact")}
          </Link>
          <div className="mt-3 flex gap-2 px-3">
            <Link href="/login" className="flex-1 rounded-md border border-line py-2.5 text-center text-sm font-semibold text-brand-blue">
              {c("login")}
            </Link>
            <Link href="/register" className="flex-1 rounded-md bg-brand-red py-2.5 text-center text-sm font-semibold text-white">
              {c("becomeMember")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
