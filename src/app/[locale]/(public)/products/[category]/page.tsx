import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";
import { Link } from "@/i18n/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export async function generateStaticParams() {
  return PRODUCT_CATEGORIES.map((c) => ({ category: c.slug }));
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = PRODUCT_CATEGORIES.find((x) => x.slug === category);
  if (!cat) notFound();

  const t = await getTranslations("products");
  const c = await getTranslations("categories");
  const common = await getTranslations("common");

  return (
    <>
      <PageHero eyebrow={t("categoryEyebrow")} title={c(`${cat.slug}.name`)}>
        {c(`${cat.slug}.blurb`)}
      </PageHero>
      <Prose>
        <p>{t("categoryBody")}</p>
        <p>
          <Link className="font-semibold text-brand-blue underline" href="/register">
            {common("applyMembership")}
          </Link>{" "}
          {t("applyOrExplore")}{" "}
          <Link className="font-semibold text-brand-blue underline" href="/markets">
            {t("exploreMarkets")}
          </Link>{" "}
          {t("shipsFrom")}
        </p>
      </Prose>
    </>
  );
}
