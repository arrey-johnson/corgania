import { getTranslations } from "next-intl/server";
import { DocumentUploadForm, SellerApplicationForm } from "@/components/onboarding/application-forms";
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
  return { title: t("sellerApp") };
}

export default async function Page() {
  const t = await getTranslations("onboarding");
  if (!isSupabaseConfigured) return <SetupGate area={t("sellerApp")} />;
  const s = await requireSession();
  if (!s) return <SetupGate area={t("sellerApp")} />;
  const snap = await getOnboardingSnapshot(s.userId);
  const sellerApp = snap.applications.find((a) => a.kind === "seller");
  const sellerCase = snap.cases.find((c) => c.kind === "seller");
  const docs = snap.documents.filter((d) => d.case_id === sellerCase?.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <p className="text-sm"><Link href="/onboarding" className="font-semibold text-brand-blue">{t("back")}</Link></p>
      <h1 className="mt-4 font-display text-4xl font-semibold">{t("sellerApp")}</h1>
      <p className="mt-3 text-slate-body">{t("sellerIntro")}</p>

      {!snap.org ? (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-xl font-semibold">{t("createFirst")}</h2>
          <div className="mt-4"><OrgCreateForm defaultIntent="seller" /></div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {sellerApp && (
            <Card className="p-5">
              <Badge>{sellerApp.status.replace(/_/g, " ")}</Badge>
              <p className="mt-2 text-sm text-slate-body">
                {sellerApp.status === "info_required"
                  ? `${t("infoRequired")}${sellerApp.review_notes ? ` ${sellerApp.review_notes}` : ""}`
                  : t("sellerOnFile")}
              </p>
            </Card>
          )}
          {(!sellerApp || sellerApp.status === "draft" || sellerApp.status === "info_required" || sellerApp.status === "rejected") && (
            <Card className="p-6">
              <h2 className="font-display text-2xl font-semibold">{sellerApp ? t("updateResubmit") : t("appDetails")}</h2>
              <div className="mt-4"><SellerApplicationForm /></div>
            </Card>
          )}
          {sellerCase && (
            <Card className="p-6">
              <h2 className="font-display text-2xl font-semibold">{t("verifyDocs")}</h2>
              <p className="mt-2 text-sm text-slate-body">{t("uploadForCase", { id: `${sellerCase.id.slice(0, 8)}…` })}</p>
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
              <div className="mt-4"><DocumentUploadForm caseId={sellerCase.id} kind="seller" /></div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
