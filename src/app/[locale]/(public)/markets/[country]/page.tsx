import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";
import { Link } from "@/i18n/navigation";
import { LAUNCH_MARKET, PRODUCT_CATEGORIES } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  const t = await getTranslations({ locale, namespace: "markets" });
  return { title: t("profileTitle", { country: country.toUpperCase() }) };
}

export default async function Page({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  if (country.toLowerCase() !== LAUNCH_MARKET.code.toLowerCase()) notFound();

  const t = await getTranslations("markets");
  const c = await getTranslations("categories");
  const names = PRODUCT_CATEGORIES.map((cat) => c(`${cat.slug}.name`)).join(" · ");

  return (
    <>
      <PageHero eyebrow={t("profileEyebrow")} title={t("launchName")}>
        {t("launchNote")}
      </PageHero>
      <Prose>
        <p>{t("cameroonBody")}</p>
        <h2>{t("supplyCategories")}</h2>
        <p>{names}</p>
        <p>
          {t("liveNote")}{" "}
          <Link className="font-semibold text-brand-blue underline" href="/commodities">
            {t("commoditiesLink")}
          </Link>{" "}
          {t("liveNoteAfter")}
        </p>
      </Prose>
    </>
  );
}
