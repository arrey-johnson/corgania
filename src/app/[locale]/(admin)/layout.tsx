import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileSidebarMenu, SidebarNav, type SidebarItem } from "@/components/layout/sidebar-nav";
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
      <div className="min-h-dvh overflow-x-hidden bg-surface">
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 overflow-hidden px-4 sm:h-14 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center">
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
              <span className="ml-3 shrink-0 rounded-full bg-brand-red px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
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

  const items: SidebarItem[] = [
    ...links.map((item) => ({
      href: item.href,
      label: t(AREA_MSG[item.area] as "overview"),
      exact: item.href === "/admin",
    })),
    { href: "/account/security", label: t("accountSecurity") },
  ];

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface">
      <header className="z-40 shrink-0 border-b border-line bg-white">
        <div className="mx-auto flex h-12 max-w-[1600px] items-center justify-between gap-3 overflow-hidden px-4 sm:h-14 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
            <span className="shrink-0 rounded-full bg-brand-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
              {session!.roleLabel}
            </span>
            <span className="hidden truncate text-xs text-slate-body xl:inline">{session!.roles.join(" · ")}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/account/security" className="hidden text-sm font-medium text-brand-blue hover:underline md:inline">
              {t("accountSecurity")}
            </Link>
            <LanguageSwitcher variant="compact" />
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden">
        <SidebarNav items={items} ariaLabel="Admin" footer={<p>{t("roleHint")}</p>} />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <MobileSidebarMenu items={items} ariaLabel="Admin" footer={<p>{t("roleHint")}</p>} />
          {children}
        </main>
      </div>
    </div>
  );
}
