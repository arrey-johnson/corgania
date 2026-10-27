import { getTranslations } from "next-intl/server";
import { PageHero, Prose } from "@/components/shared/info-page";
import { Card } from "@/components/ui/primitives";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "howItWorks" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("howItWorks");
  const h = await getTranslations("home");
  const steps: [string, string][] = [
    [h("step1Title"), h("step1Text")],
    [h("step2Title"), h("step2Text")],
    [h("step3Title"), h("step3Text")],
    [h("step4Title"), h("step4Text")],
  ];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("hero")}>
        {t("lead")}
      </PageHero>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps.map(([title, text], i) => (
            <Card key={title} className="p-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                {i + 1} · {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-body">{text}</p>
            </Card>
          ))}
        </div>
        <Prose>
          <p>
            <strong>{h("trustProcess")}</strong> {h("trustText")}
          </p>
        </Prose>
      </div>
    </>
  );
}
