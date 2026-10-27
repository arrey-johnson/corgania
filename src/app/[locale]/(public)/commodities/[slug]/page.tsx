import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { EmptyState } from "@/components/ui/primitives";
import { CommodityChart } from "@/components/market/commodity-chart";
import { getCommoditySeries } from "@/lib/providers/market-data";

const SLUG_KEYS = ["cocoa", "coffee", "cotton", "timber"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "commodities" });
  const name = SLUG_KEYS.includes(slug as (typeof SLUG_KEYS)[number])
    ? t(slug as (typeof SLUG_KEYS)[number])
    : slug;
  return { title: t("pricesTitle", { name }) };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("commodities");
  const data = await getCommoditySeries(slug);
  const name = SLUG_KEYS.includes(slug as (typeof SLUG_KEYS)[number])
    ? t(slug as (typeof SLUG_KEYS)[number])
    : slug;

  return (
    <>
      <PageHero eyebrow={t("commodityEyebrow")} title={name}>
        {data.status === "ok"
          ? t("sourceLine", {
              source: data.source,
              unit: data.unit,
              currency: data.currency,
              updatedAt: data.updatedAt,
            })
          : t("benchmark")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {data.status === "unavailable" ? (
          <EmptyState title={t("noData")}>{data.reason}</EmptyState>
        ) : (
          <>
            <p className="mb-2 text-sm text-slate-body">{data.seriesLabel}</p>
            <p className="mb-6 text-sm text-slate-body">{t("attribution")}</p>
            <CommodityChart points={data.points} />
          </>
        )}
      </div>
    </>
  );
}
