import { getTranslations } from "next-intl/server";
import { BuyerApplicationForm, DocumentUploadForm } from "@/components/onboarding/application-forms";
import { OrgCreateForm } from "@/components/onboarding/org-create-form";
import { SetupGate } from "@/components/shared/setup-gate";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import { getOnboardingSnapshot } from "@/lib/services/onboarding";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return { title: t("buyerApp") };
}

export default async function Page() {
  const t = await getTranslations("onboarding");
  if (!isSupabaseConfigured) return <SetupGate area={t("buyerApp")} />;
  const s = await requireSession();
  if (!s) return <SetupGate area={t("buyerApp")} />;
  const snap = await getOnboardingSnapshot(s.userId);
  const buyerApp = snap.applications.find((a) => a.kind === "buyer");
  const buyerCase = snap.cases.find((c) => c.kind === "buyer");
  const docs = snap.documents.filter((d) => d.case_id === buyerCase?.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm"><Link href="/onboarding" className="font-semibold text-brand-blue">{t("back")}</Link></p>
      <h1 className="mt-4 font-display text-4xl font-semibold">{t("buyerApp")}</h1>
      <p className="mt-3 text-slate-body">{t("buyerIntro")}</p>

      {!snap.org ? (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-xl font-semibold">{t("createFirst")}</h2>
          <div className="mt-4"><OrgCreateForm defaultIntent="buyer" /></div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {buyerApp && (
            <Card className="p-5">
              <Badge>{buyerApp.status.replace(/_/g, " ")}</Badge>
              <p className="mt-2 text-sm text-slate-body">
                {buyerApp.status === "info_required"
                  ? `${t("infoRequired")}${buyerApp.review_notes ? ` ${buyerApp.review_notes}` : ""}`
                  : t("buyerOnFile")}
              </p>
            </Card>
          )}
          {(!buyerApp || buyerApp.status === "draft" || buyerApp.status === "info_required" || buyerApp.status === "rejected") && (
            <Card className="p-6">
              <h2 className="font-display text-2xl font-semibold">{buyerApp ? t("updateResubmit") : t("appDetails")}</h2>
              <div className="mt-4"><BuyerApplicationForm /></div>
            </Card>
          )}
          {buyerCase && (
            <Card className="p-6">
              <h2 className="font-display text-2xl font-semibold">{t("verifyDocs")}</h2>
              {docs.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {docs.map((d) => (
                    <li key={d.id} className="flex justify-between gap-3 border-b border-line py-2">
                      <span>{d.doc_type.replace(/_/g, " ")} — {d.file_name}</span>
                      <Badge>{d.status.replace(/_/g, " ")}</Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4"><DocumentUploadForm caseId={buyerCase.id} kind="buyer" /></div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
