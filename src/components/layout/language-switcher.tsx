"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeNames, type AppLocale, locales } from "@/i18n/routing";
import { setLocalePreference } from "@/app/actions/locale";

type Props = {
  variant?: "light" | "dark" | "compact";
};

export function LanguageSwitcher({ variant = "light" }: Props) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  async function onChange(next: string) {
    const nextLocale = next as AppLocale;
    try {
      await setLocalePreference(nextLocale);
    } catch {
      /* offline / unsigned — cookie via next-intl is enough */
    }
    router.replace(pathname, { locale: nextLocale });
    router.refresh();
  }

  const selectClass =
    variant === "dark"
      ? "rounded-md border border-white/25 bg-white/10 px-2 py-1.5 text-xs font-semibold text-white"
      : variant === "compact"
        ? "rounded-md border border-line bg-white px-2 py-1 text-xs font-semibold text-ink"
        : "rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-semibold text-ink";

  return (
    <label className="inline-flex items-center gap-1.5">
      <span className="sr-only">{t("language")}</span>
      <select
        className={selectClass}
        value={locale}
        onChange={(e) => void onChange(e.target.value)}
        aria-label={t("language")}
      >
        {locales.map((code) => (
          <option key={code} value={code} className="text-ink">
            {localeNames[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
