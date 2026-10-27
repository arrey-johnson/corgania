import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SetupGate } from "@/components/shared/setup-gate";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { navForRoles, type AdminArea } from "@/lib/auth/roles";
import { isSupabaseConfigured } from "@/lib/env";

const AREA_MSG: Record<AdminArea, string> = {
  overview: "overview",
  members: "members",
  applications: "applications",
  verifications: "verifications",
  inspections: "inspections",
  stores: "stores",
  products: "products",
  rfqs: "rfqs",
  orders: "orders",
  "trade-services": "tradeServices",
  finance: "finance",
  insights: "insightsCms",
  analytics: "analytics",
  settings: "settings",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("admin");
  const session = isSupabaseConfigured ? await requireSession() : null;
  const allowed = Boolean(session?.isStaff);
  const links = session ? navForRoles(session.roles) : [];

  if (!allowed) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link href="/">
                <Image src="/brand/corgania-logo.png" alt="Corgania" width={340} height={136} className="h-10 w-auto sm:h-12" />
              </Link>
              <span className="ml-4 rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {t("staff")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <SignOutButton />
            </div>
          </div>
        </header>
        <SetupGate area="Corgania Administration" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/">
              <Image src="/brand/corgania-logo.png" alt="Corgania" width={340} height={136} className="h-10 w-auto sm:h-12" />
            </Link>
            <span className="shrink-0 rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              {session!.roleLabel}
            </span>
            <span className="hidden truncate text-xs text-slate-body lg:inline">{session!.roles.join(" · ")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/account/security" className="hidden text-sm font-medium text-brand-blue hover:underline sm:inline">
              {t("accountSecurity")}
            </Link>
            <LanguageSwitcher variant="compact" />
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-8 space-y-1" aria-label="Admin">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-white hover:text-brand-blue"
              >
                {t(AREA_MSG[item.area] as "overview")}
              </Link>
            ))}
            <Link
              href="/account/security"
              className="block rounded-md px-3 py-2 text-sm font-medium text-ink hover:bg-white hover:text-brand-blue"
            >
              {t("accountSecurity")}
            </Link>
          </nav>
          <p className="mt-6 px-3 text-[11px] leading-relaxed text-slate-body">{t("roleHint")}</p>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
