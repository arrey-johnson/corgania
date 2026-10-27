import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("buyersTitle") };
}

export default async function Page() {
  const t = await getTranslations("membership");

  return (
    <>
      <PageHero eyebrow={t("buyersEyebrow")} title={t("buyersHero")}>
        {t("buyersLead")}
      </PageHero>
      <Prose>
        <h2>{t("buyersWhatTitle")}</h2>
        <p>{t("buyersWhat")}</p>
        <h2>{t("pricingEyebrow")}</h2>
        <p>
          <strong>{t("foundersName")}:</strong> {t("foundersPrice")} — {t("foundersPeriod")}.{" "}
          <strong>{t("standardName")}:</strong> {t("standardPrice")} {t("standardPeriod")}.
        </p>
        <p>{t("noteVerify")}</p>
        <h2>{t("buyersVerifyTitle")}</h2>
        <p>{t("buyersVerify")}</p>
        <p>
          <Link className="inline-flex h-11 items-center rounded-md bg-brand-blue px-5 font-semibold text-white" href="/register">
            {t("buyersCta")}
          </Link>
        </p>
      </Prose>
    </>
  );
}
