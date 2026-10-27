import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SetupGate } from "@/components/shared/setup-gate";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";

export default async function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("marketplace");
  const c = await getTranslations("common");
  const a = await getTranslations("account");
  const links: [string, string][] = [
    [t("navHome"), "/marketplace"],
    [t("products"), "/marketplace/products"],
    [t("suppliers"), "/marketplace/suppliers"],
    [t("rfqs"), "/marketplace/rfqs"],
    [`${t("dashboard")} · ${c("buyerRole")}`, "/dashboard/buyer"],
    [`${t("dashboard")} · ${c("sellerRole")}`, "/dashboard/seller"],
    [t("messages"), "/dashboard/messages"],
    [t("orders"), "/dashboard/orders"],
    [t("settings"), "/dashboard/settings"],
  ];

  if (!isSupabaseConfigured) {
    return (
      <>
        <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
        <SetupGate area="Corgania Marketplace" />
      </>
    );
  }
  const s = await requireSession();
  if (!s || !s.canTrade) {
    return (
      <>
        <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
        <SetupGate area="Corgania Marketplace" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <SiteBar label={t("membersOnly")} accountLabel={a("navLabel")} />
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1" aria-label="Marketplace">
            {links.map(([l, h]) => (
              <Link key={h} href={h} className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-white hover:text-brand-blue">
                {l}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function SiteBar({ label, accountLabel }: { label: string; accountLabel: string }) {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Image src="/brand/corgania-logo.png" alt="Corgania" width={340} height={136} className="h-10 w-auto sm:h-12" />
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/account/security" className="hidden text-sm font-medium text-brand-blue hover:underline sm:inline">
            {accountLabel}
          </Link>
          <LanguageSwitcher variant="compact" />
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-blue">{label}</span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
