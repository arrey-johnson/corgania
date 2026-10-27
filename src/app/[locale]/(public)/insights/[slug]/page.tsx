import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHero, Prose } from "@/components/shared/info-page";
import { getArticle } from "@/lib/services/articles";

type FullArticle = { title: string; excerpt: string; body: string; seo_title?: string; seo_description?: string; category?: { name: string } | null };

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "insightsPage" });
  const a = (await getArticle(slug)) as unknown as FullArticle | null;
  return { title: a?.seo_title ?? a?.title ?? t("articleEyebrow"), description: a?.seo_description ?? a?.excerpt };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const t = await getTranslations("insightsPage");
  const { slug } = await params;
  const a = (await getArticle(slug)) as unknown as FullArticle | null;
  if (!a) notFound();
  return (
    <>
      <PageHero eyebrow={a.category?.name ?? t("fallback")} title={a.title}>{a.excerpt}</PageHero>
      <Prose><div className="whitespace-pre-line">{a.body}</div></Prose>
    </>
  );
}
