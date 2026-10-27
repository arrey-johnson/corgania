import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/shared/info-page";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { FOUNDERS_FREE_DAYS, STANDARD_ANNUAL_PRICE_USD, foundersEnrollmentEndsAt } from "@/lib/billing/plans";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("membership");
  const n = await getTranslations("nav");
  const enrollmentEnd = foundersEnrollmentEndsAt().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">{t("pricingEyebrow")}</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink">{t("pricingTitle")}</h2>
          <p className="mt-3 max-w-2xl text-slate-body">{t("pricingLead")}</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Card className="border-t-4 border-t-brand-red p-8">
              <Badge>{t("foundersBadge")}</Badge>
              <h3 className="mt-4 font-display text-2xl font-semibold">{t("foundersName")}</h3>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">{t("foundersPrice")}</p>
              <p className="mt-1 text-sm text-slate-body">{t("foundersPeriod")}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-body">{t("foundersBody")}</p>
              <p className="mt-3 text-xs text-slate-body">
                {FOUNDERS_FREE_DAYS} days · enrollment through {enrollmentEnd}
              </p>
            </Card>
            <Card className="border-t-4 border-t-brand-blue p-8">
              <h3 className="font-display text-2xl font-semibold">{t("standardName")}</h3>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">{t("standardPrice")}</p>
              <p className="mt-1 text-sm text-slate-body">{t("standardPeriod")}</p>
              <p className="mt-4 text-sm leading-relaxed text-slate-body">{t("standardBody")}</p>
              <p className="mt-3 text-xs font-semibold text-brand-blue">USD {STANDARD_ANNUAL_PRICE_USD} / year</p>
            </Card>
          </div>
          <p className="mt-6 text-sm text-slate-body">{t("noteVerify")}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <Card className="border-t-4 border-t-brand-blue p-8">
          <h2 className="font-display text-2xl font-semibold">{n("forSellers")}</h2>
          <p className="mt-3 leading-relaxed text-slate-body">{t("sellersCard")}</p>
          <Link href="/membership/sellers" className="mt-5 inline-block font-semibold text-brand-blue">
            {n("forSellers")} →
          </Link>
        </Card>
        <Card className="border-t-4 border-t-brand-red p-8">
          <h2 className="font-display text-2xl font-semibold">{n("forBuyers")}</h2>
          <p className="mt-3 leading-relaxed text-slate-body">{t("buyersCard")}</p>
          <Link href="/membership/buyers" className="mt-5 inline-block font-semibold text-brand-red">
            {n("forBuyers")} →
          </Link>
        </Card>
      </div>
    </>
  );
}
