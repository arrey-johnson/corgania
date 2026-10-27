import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/primitives";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("suppliersTitle") };
}

export default async function Page() {
  const t = await getTranslations("marketplace");
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">{t("suppliersTitle")}</h1>
      <div className="mt-6">
        <EmptyState title={t("suppliersEmpty")}>{t("emptyCatalogueText")}</EmptyState>
      </div>
    </div>
  );
}
