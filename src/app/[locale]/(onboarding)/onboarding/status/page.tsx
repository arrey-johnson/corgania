import { getTranslations } from "next-intl/server";
import { SetupGate } from "@/components/shared/setup-gate";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import { getOnboardingSnapshot } from "@/lib/services/onboarding";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return { title: t("statusTitle") };
}

export default async function Page() {
  const t = await getTranslations("onboarding");
  if (!isSupabaseConfigured) return <SetupGate area={t("statusTitle")} />;
  const s = await requireSession();
  if (!s) return <SetupGate area={t("statusTitle")} />;
  const snap = await getOnboardingSnapshot(s.userId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm"><Link href="/onboarding" className="font-semibold text-brand-blue">{t("back")}</Link></p>
      <h1 className="mt-4 font-display text-4xl font-semibold">{t("statusTitle")}</h1>

      {!snap.org ? (
        <Card className="mt-8 p-6">
          <Badge>{t("noOrg")}</Badge>
          <p className="mt-3 text-sm text-slate-body">{t("noOrgHelp")}</p>
          <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-brand-blue underline">{t("goOnboarding")}</Link>
        </Card>
      ) : (
        <div className="mt-8 space-y-5">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl font-semibold">{snap.org.legal_name}</h2>
              <Badge>{snap.org.membership_status.replace(/_/g, " ")}</Badge>
              {s.canTrade && <Badge className="bg-emerald-50 text-emerald-800">{t("marketplaceAccess")}</Badge>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-body">
              {s.canTrade ? t("approvedAccess") : t("accessPending")}
            </p>
            <p className="mt-2 text-xs text-slate-body">
              {t("intended")}: {[snap.org.can_buy && t("canBuy"), snap.org.can_sell && t("canSell")].filter(Boolean).join(" · ") || t("notSet")} · {t("countryLabel")} {snap.org.registration_country}
            </p>
          </Card>

          {snap.applications.length === 0 ? (
            <Card className="p-6">
              <p className="text-sm text-slate-body">{t("noApplications")}</p>
              <div className="mt-3 flex gap-4 text-sm font-semibold">
                <Link className="text-brand-blue underline" href="/onboarding/seller">{t("sellerApp")}</Link>
                <Link className="text-brand-blue underline" href="/onboarding/buyer">{t("buyerApp")}</Link>
              </div>
            </Card>
          ) : (
            snap.applications.map((app) => {
              const vcase = snap.cases.find((c) => c.kind === app.kind);
              const docs = snap.documents.filter((d) => d.case_id === vcase?.id);
              const appTitle = app.kind === "seller" ? t("sellerApp") : t("buyerApp");
              return (
                <Card key={app.id} className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl font-semibold">{appTitle}</h3>
                    <Badge>{app.status.replace(/_/g, " ")}</Badge>
                    {vcase && <Badge className="bg-white">{t("verifyStatus", { status: vcase.status.replace(/_/g, " ") })}</Badge>}
                  </div>
                  {app.submitted_at && (
                    <p className="mt-2 text-xs text-slate-body">{t("submitted")} {new Date(app.submitted_at).toLocaleString()}</p>
                  )}
                  {app.review_notes && (
                    <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">{app.review_notes}</p>
                  )}
                  {vcase?.decision_notes && (
                    <p className="mt-3 text-sm text-slate-body">{t("decision")} {vcase.decision_notes}</p>
                  )}
                  {docs.length > 0 && (
                    <ul className="mt-4 space-y-1 text-sm text-slate-body">
                      {docs.map((d) => (
                        <li key={d.id}>{d.doc_type.replace(/_/g, " ")} — {d.file_name} ({d.status.replace(/_/g, " ")})</li>
                      ))}
                    </ul>
                  )}
                  <Link href={`/onboarding/${app.kind}`} className="mt-4 inline-block text-sm font-semibold text-brand-blue underline">
                    {t("openApp", { kind: app.kind })}
                  </Link>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
