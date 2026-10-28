import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileSidebarMenu, SidebarNav, type SidebarItem } from "@/components/layout/sidebar-nav";
import { SetupGate } from "@/components/shared/setup-gate";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("marketplace");
  const c = await getTranslations("common");
  const a = await getTranslations("account");

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-dvh overflow-x-hidden bg-surface">
        <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
        <SetupGate area="Corgania Marketplace" />
      </div>
    );
  }
  const s = await requireSession();
  if (!s || !s.canTrade) {
    return (
      <div className="min-h-dvh overflow-x-hidden bg-surface">
        <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
        <SetupGate area="Corgania Marketplace" />
      </div>
    );
  }

  const items: SidebarItem[] = [
    { href: "/marketplace", label: t("navHome"), exact: true },
    { href: "/marketplace/products", label: t("products") },
    { href: "/marketplace/suppliers", label: t("suppliers") },
    { href: "/marketplace/rfqs", label: t("rfqs") },
  ];
  if (s.canBuy) items.push({ href: "/dashboard/buyer", label: `${t("dashboard")} · ${c("buyerRole")}` });
  if (s.canSell) items.push({ href: "/dashboard/seller", label: `${t("dashboard")} · ${c("sellerRole")}` });
  items.push(
    { href: "/dashboard/messages", label: t("messages") },
    { href: "/dashboard/orders", label: t("orders") },
    { href: "/dashboard/settings", label: t("settings") },
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 overflow-hidden">
        <SidebarNav items={items} ariaLabel="Marketplace" />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <MobileSidebarMenu items={items} ariaLabel="Marketplace" />
          {children}
        </main>
      </div>
    </div>
  );
}

function SiteBar({ label, accountLabel }: { label: string; accountLabel: string }) {
  return (
    <header className="z-40 shrink-0 border-b border-line bg-white">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 overflow-hidden px-4 sm:h-14 sm:px-6 lg:px-8">
        <Link href="/" className="block h-7 w-[112px] shrink-0 sm:h-8 sm:w-[128px]">
          <Image
            src="/brand/corgania-logo.png"
            alt="Corgania"
            width={128}
            height={32}
            className="!h-full !w-full object-contain object-left"
            style={{ height: "100%", width: "100%" }}
            priority
          />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link href="/account/security" className="hidden text-sm font-medium text-brand-blue hover:underline sm:inline">
            {accountLabel}
          </Link>
          <LanguageSwitcher variant="compact" />
          <span className="hidden rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue md:inline">
            {label}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
