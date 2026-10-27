import Image from "next/image";
import { ArrowRight, BadgeCheck, FileCheck2, Globe2, Handshake, LineChart, Search, ShieldCheck, Ship, Tractor } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Card, Badge, SectionHeading, EmptyState } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { PRODUCT_CATEGORIES, TARGET_REGION_KEYS } from "@/lib/constants";
import { listPublishedArticles } from "@/lib/services/articles";
import { getCommoditySeries } from "@/lib/providers/market-data";

export default async function HomePage() {
  const t = await getTranslations("home");
  const c = await getTranslations("categories");
  const regions = await getTranslations("regions");
  const common = await getTranslations("common");
  const [articles, cocoa] = await Promise.all([listPublishedArticles(3), getCommoditySeries("cocoa")]);
  const regionList = TARGET_REGION_KEYS.map((k) => regions(k)).join(", ");

  const divisions = [
    { icon: LineChart, name: t("divInsightsName"), text: t("divInsightsText") },
    { icon: Globe2, name: t("divMarketplaceName"), text: t("divMarketplaceText") },
    { icon: ShieldCheck, name: t("divVerifyName"), text: t("divVerifyText") },
    { icon: Ship, name: t("divTradeName"), text: t("divTradeText") },
  ];
  const steps: [string, string][] = [
    [t("step1Title"), t("step1Text")],
    [t("step2Title"), t("step2Text")],
    [t("step3Title"), t("step3Text")],
    [t("step4Title"), t("step4Text")],
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-blue-dark text-white">
        <Image src="/images/hero-africa-trade-network.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover object-[68%_center] opacity-40" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-brand-blue-dark/25" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-blue-dark/70 via-brand-blue-dark/35 to-brand-blue-dark/60" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-brand-blue-dark/70 to-transparent" />
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center justify-center px-4 py-10 text-center sm:min-h-[calc(100svh-4.5rem)] sm:px-6 lg:min-h-[calc(100svh-5rem)] lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center">
            <Badge className="bg-white/15 text-white backdrop-blur-sm">{t("badge")}</Badge>
            <h1 className="mt-5 font-display text-[clamp(1.35rem,5.5vw,3.6rem)] font-semibold leading-[1.1] drop-shadow-sm">
              <span className="block">
                <span className="underline decoration-brand-red decoration-[5px] underline-offset-8">{t("headline1a")}</span>
                {t("headline1b")}
              </span>
              <span className="block">{t("headline2")}</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">{t("subhead")}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="inline-flex h-12 items-center rounded-md bg-brand-red px-6 font-semibold text-white shadow-lg hover:bg-brand-red-dark">
                {t("ctaMember")} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/markets" className="inline-flex h-12 items-center rounded-md border border-white/50 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm hover:bg-white/20">
                {t("ctaMarkets")}
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/85">
              <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> {t("proofVerified")}</span>
              <span className="flex items-center gap-2"><FileCheck2 className="h-4 w-4" /> {t("proofDocumented")}</span>
              <span className="flex items-center gap-2"><Handshake className="h-4 w-4" /> {t("proofBuyers", { regions: regionList })}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("ecosystemEyebrow")} title={t("ecosystemTitle")}>
          {t("ecosystemIntro")}
        </SectionHeading>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {divisions.map((d) => (
            <Card key={d.name} className="p-6">
              <d.icon className="h-8 w-8 text-brand-blue" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{d.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-body">{d.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Card className="border-t-4 border-t-brand-blue p-8">
            <Tractor className="h-8 w-8 text-brand-blue" />
            <h3 className="mt-4 font-display text-2xl font-semibold">{t("sellersTitle")}</h3>
            <p className="mt-3 leading-relaxed text-slate-body">{t("sellersText")}</p>
            <Link href="/membership/sellers" className="mt-6 inline-flex items-center font-semibold text-brand-blue">
              {t("sellersCta")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Card>
          <Card className="border-t-4 border-t-brand-red p-8">
            <Search className="h-8 w-8 text-brand-red" />
            <h3 className="mt-4 font-display text-2xl font-semibold">{t("buyersTitle")}</h3>
            <p className="mt-3 leading-relaxed text-slate-body">{t("buyersText")}</p>
            <Link href="/membership/buyers" className="mt-6 inline-flex items-center font-semibold text-brand-red">
              {t("buyersCta")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t("categoriesEyebrow")} title={t("categoriesTitle")} />
          <Link href="/products" className="font-semibold text-brand-blue">
            {t("browseCategories")} <ArrowRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/products/${cat.slug}`} className="group">
              <Card className="h-full p-6 transition-shadow group-hover:shadow-lg">
                <h3 className="font-display text-lg font-semibold text-ink group-hover:text-brand-blue">{c(`${cat.slug}.name`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-body">{c(`${cat.slug}.blurb`)}</p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-red">
                  {common("explore")} <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-blue-dark text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">{t("insightsEyebrow")}</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">{t("insightsTitle")}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{t("insightsText")}</p>
          <div className="mt-8 rounded-xl border border-white/20 bg-white/5 p-6">
            {cocoa.status === "unavailable" ? (
              <p className="text-sm leading-relaxed text-white/85">
                <strong className="text-white">{t("pricesUnavailable")}</strong>
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-white/85">
                {common("seriesLoaded", { source: cocoa.source })}{" "}
                <strong className="text-white">
                  {cocoa.latestValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {cocoa.unit}
                </strong>
                {" · "}
                {cocoa.updatedAt}
              </p>
            )}
            <Link href="/commodities" className="mt-4 inline-flex items-center font-semibold text-white underline underline-offset-4">
              {t("visitCommodities")} <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("howEyebrow")} title={t("howTitle")} />
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([title, text], i) => (
            <li key={title}>
              <Card className="h-full p-6">
                <span className="font-display text-4xl font-semibold text-brand-red">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-body">{text}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-xl border border-line bg-surface p-6 sm:flex sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-slate-body">
            <strong className="text-ink">{t("trustProcess")}</strong> {t("trustText")}
          </p>
          <Link href="/how-it-works" className="mt-4 inline-flex items-center font-semibold text-brand-blue sm:mt-0">
            {t("howVerification")} <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={t("newsEyebrow")} title={t("newsTitle")} />
        <div className="mt-8">
          {articles.length === 0 ? (
            <EmptyState title={t("emptyInsightsTitle")}>{t("emptyInsightsText")}</EmptyState>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {articles.map((a) => (
                <Link key={a.slug} href={`/insights/${a.slug}`}>
                  <Card className="h-full p-6">
                    <Badge>{a.category?.name ?? common("insightsFallback")}</Badge>
                    <h3 className="mt-3 font-display text-xl font-semibold text-ink">{a.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-body">{a.excerpt}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-ink sm:text-4xl">{t("finalTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-body">{t("finalText")}</p>
          <Link href="/register" className="mt-8 inline-flex h-12 items-center rounded-md bg-brand-red px-6 font-semibold text-white hover:bg-brand-red-dark">
            {t("finalCta")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
