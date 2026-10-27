import { getLocale, getTranslations } from "next-intl/server";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Card } from "@/components/ui/primitives";
import { Link, redirect } from "@/i18n/navigation";
import { homePathFor, requireSession } from "@/lib/auth/guards";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("setPasswordTitle") };
}

export default async function Page() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("account");
  const session = await requireSession();
  if (!session) redirect({ href: "/login", locale });

  const home = homePathFor(session!);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{t("setPasswordTitle")}</h1>
        <p className="mt-2 text-sm text-slate-body">{t("setPasswordHint")}</p>
      </div>
      <Card className="p-6">
        <PasswordChangeForm mode="set" />
        <p className="mt-5 text-sm text-slate-body">
          <Link href={home} className="font-semibold text-brand-blue hover:underline">
            {t("backToApp")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
