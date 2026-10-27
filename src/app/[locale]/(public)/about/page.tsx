import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("about");
  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <Prose>
        <p>{t("p1")}</p>
        <h2>{t("whereTitle")}</h2>
        <p>{t("whereText")}</p>
        <h2>{t("howTitle")}</h2>
        <p>{t("howText")}</p>
        <h2>{t("wontTitle")}</h2>
        <p>{t("wontText")}</p>
      </Prose>
    </>
  );
}
