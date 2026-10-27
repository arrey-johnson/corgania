import { getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/primitives";

export async function PlaceholderPage({ title, children }: { title: string; children?: string }) {
  const t = await getTranslations("common");
  const m = await getTranslations("marketplace");
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      <div className="mt-6">
        <EmptyState title={t("nothingYet")}>{children ?? m("placeholderBody")}</EmptyState>
      </div>
    </div>
  );
}
