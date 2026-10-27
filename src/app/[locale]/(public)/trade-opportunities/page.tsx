import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tradeOpportunities" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("tradeOpportunities");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <Prose>
        <p>{t("body")}</p>
        <p>
          <Link className="font-semibold text-brand-blue underline" href="/membership/buyers">
            {t("buyerMembership")}
          </Link>{" "}
          ·{" "}
          <Link className="font-semibold text-brand-blue underline" href="/membership/sellers">
            {t("sellerMembership")}
          </Link>
        </p>
      </Prose>
    </>
  );
}
