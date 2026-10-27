import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Link, redirect } from "@/i18n/navigation";
import { homePathFor, requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppLocale } from "@/i18n/routing";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("account");

  if (!isSupabaseConfigured) {
    redirect({ href: "/login", locale });
  }

  const session = await requireSession();
  if (!session) {
    redirect({ href: "/login", locale });
  }

  const home = homePathFor(session!);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image src="/brand/corgania-logo.png" alt="Corgania" width={340} height={136} className="h-10 w-auto sm:h-12" />
            </Link>
            <span className="hidden text-xs font-bold uppercase tracking-wider text-brand-blue sm:inline">{t("navLabel")}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={home} className="text-sm font-medium text-brand-blue hover:underline">
              {t("backToApp")}
            </Link>
            <LanguageSwitcher variant="compact" />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
