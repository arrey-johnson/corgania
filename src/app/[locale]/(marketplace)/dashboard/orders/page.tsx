import { getTranslations } from "next-intl/server";
import { PlaceholderPage } from "@/components/shared/placeholder";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("ordersTitle") };
}

export default async function Page() {
  const t = await getTranslations("marketplace");
  return <PlaceholderPage title={t("ordersTitle")} />;
}
