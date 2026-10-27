import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { Card, Badge } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { LAUNCH_MARKET, TARGET_REGION_KEYS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("markets");
  const r = await getTranslations("regions");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Link href={`/markets/${LAUNCH_MARKET.code.toLowerCase()}`}>
            <Card className="h-full p-8">
              <Badge>{t("launchActive")}</Badge>
              <h2 className="mt-4 font-display text-3xl font-semibold text-ink">{t("launchName")}</h2>
              <p className="mt-3 leading-relaxed text-slate-body">{t("launchNote")}</p>
              <span className="mt-5 inline-block font-semibold text-brand-blue">{t("viewProfile")}</span>
            </Card>
          </Link>
          <Card className="p-8">
            <Badge>{t("buyerRegions")}</Badge>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink">{t("whereBuyers")}</h2>
            <ul className="mt-4 space-y-2 text-slate-body">
              {TARGET_REGION_KEYS.map((key) => (
                <li key={key}>
                  • {t("qualifiedIn", { region: r(key) })}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-body">{t("moreMarkets")}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
