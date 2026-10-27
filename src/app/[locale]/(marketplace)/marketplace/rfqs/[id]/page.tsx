import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/primitives";

export default async function Page() {
  const t = await getTranslations("marketplace");
  return (
    <div className="mt-6">
      <EmptyState title={t("rfqUnavailable")}>{t("rfqUnavailableText")}</EmptyState>
    </div>
  );
}
