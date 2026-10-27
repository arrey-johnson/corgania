import { getTranslations } from "next-intl/server";
import { EmptyState, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("marketplace");

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 max-w-2xl text-slate-body">{t("intro")}</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Link href="/marketplace/products">
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold">{t("browseProducts")}</h2>
            <p className="mt-1 text-sm text-slate-body">{t("browseProductsHelp")}</p>
          </Card>
        </Link>
        <Link href="/marketplace/rfqs">
          <Card className="p-6">
            <h2 className="font-display text-xl font-semibold">{t("rfqTitle")}</h2>
            <p className="mt-1 text-sm text-slate-body">{t("rfqHelp")}</p>
          </Card>
        </Link>
      </div>
      <div className="mt-6">
        <EmptyState title={t("emptyCatalogue")}>{t("emptyCatalogueText")}</EmptyState>
      </div>
    </div>
  );
}
