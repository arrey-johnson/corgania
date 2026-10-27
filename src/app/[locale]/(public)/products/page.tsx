import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("products");
  const c = await getTranslations("categories");
  const common = await getTranslations("common");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {PRODUCT_CATEGORIES.map((cat) => (
          <Link key={cat.slug} href={`/products/${cat.slug}`}>
            <Card className="h-full p-6">
              <h2 className="font-display text-lg font-semibold text-ink">{c(`${cat.slug}.name`)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-body">{c(`${cat.slug}.blurb`)}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-brand-red">{common("viewCategory")}</span>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
