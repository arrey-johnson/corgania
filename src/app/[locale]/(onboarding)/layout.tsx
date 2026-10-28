import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Link, redirect } from "@/i18n/navigation";
import { homePathFor, requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppLocale } from "@/i18n/routing";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("onboarding");

  if (isSupabaseConfigured) {
    const session = await requireSession();
    if (session?.isStaff) redirect({ href: "/admin", locale });
    if (session?.canTrade) redirect({ href: homePathFor(session), locale });
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-line">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-4 overflow-hidden px-4 sm:h-14 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            <Link href="/account/security" className="text-xs font-bold uppercase tracking-wider text-brand-blue hover:underline">
              {t("accountSecurity")}
            </Link>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">{t("title")}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
