import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { getCommoditySeries } from "@/lib/providers/market-data";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "commodities" });
  return { title: t("title") };
}

const SLUGS = ["cocoa", "coffee", "cotton", "timber"] as const;

export default async function Page() {
  const t = await getTranslations("commodities");
  const series = await Promise.all(SLUGS.map(async (slug) => ({ slug, data: await getCommoditySeries(slug) })));
  const anyOk = series.some((s) => s.data.status === "ok");
  const firstFail = series.find((s) => s.data.status === "unavailable");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {!anyOk && firstFail?.data.status === "unavailable" && (
          <div className="mb-8">
            <EmptyState title={t("feedPending")}>{firstFail.data.reason}</EmptyState>
          </div>
        )}
        {anyOk && (
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-slate-body">{t("attribution")}</p>
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {series.map(({ slug, data }) => {
            const name = t(slug);
            const unit =
              data.status === "ok"
                ? data.unit
                : slug === "timber"
                  ? t("unitM3")
                  : slug === "cotton"
                    ? t("unitKg")
                    : t("unitKg");
            return (
              <Link key={slug} href={`/commodities/${slug}`}>
                <Card className="h-full p-6">
                  <h2 className="font-display text-xl font-semibold text-ink">{name}</h2>
                  <p className="mt-1 text-sm text-slate-body">{unit}</p>
                  {data.status === "ok" ? (
                    <>
                      <p className="mt-4 font-display text-2xl font-semibold text-ink">
                        {data.latestValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      <p className="mt-1 text-xs text-slate-body">
                        {data.seriesLabel} · {data.updatedAt}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-brand-red">{t("viewSeries")}</p>
                    </>
                  ) : (
                    <p className="mt-4 text-sm font-semibold text-brand-red">{t("dataPending")}</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
