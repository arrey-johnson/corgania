import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { Card, Badge, EmptyState } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { listPublishedArticles } from "@/lib/services/articles";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insightsPage" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("insightsPage");
  const articles = await listPublishedArticles(24);

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {articles.length === 0 ? (
          <EmptyState title={t("emptyTitle")}>{t("emptyText")}</EmptyState>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <Link key={a.slug} href={`/insights/${a.slug}`}>
                <Card className="h-full p-6">
                  <Badge>{a.category?.name ?? t("fallback")}</Badge>
                  <h2 className="mt-3 font-display text-xl font-semibold text-ink">{a.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-body">{a.excerpt}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
