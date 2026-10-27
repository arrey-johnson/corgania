import { getTranslations } from "next-intl/server";
import { OrgCreateForm } from "@/components/onboarding/org-create-form";
import { SetupGate } from "@/components/shared/setup-gate";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { requireSession } from "@/lib/auth/guards";
import { isSupabaseConfigured } from "@/lib/env";
import { getOnboardingSnapshot } from "@/lib/services/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "onboarding" });
  return { title: t("title") };
}

export default async function Page() {
  const t = await getTranslations("onboarding");
  if (!isSupabaseConfigured) return <SetupGate area={t("title")} />;
  const s = await requireSession();
  if (!s) return <SetupGate area={t("title")} />;

  const snap = await getOnboardingSnapshot(s.userId);
  const supabase = await createClient();
  const meta = supabase ? (await supabase.auth.getUser()).data.user?.user_metadata : null;
  const defaultName = typeof meta?.organisation_name === "string" ? meta.organisation_name : "";
  const defaultIntent = typeof meta?.intent === "string" ? meta.intent : "seller";

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold">{t("hubHeading")}</h1>
      <p className="mt-3 max-w-2xl text-slate-body">{t("hubIntro")}</p>

      {!snap.org ? (
        <Card className="mt-8 p-6">
          <h2 className="font-display text-2xl font-semibold">{t("createOrg")}</h2>
          <p className="mt-2 text-sm text-slate-body">{t("createOrgHelp")}</p>
          <div className="mt-6">
            <OrgCreateForm defaultIntent={defaultIntent} defaultName={defaultName} />
          </div>
        </Card>
      ) : (
        <>
          <Card className="mt-8 flex flex-wrap items-center gap-3 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-body">{t("organisation")}</p>
              <p className="font-display text-xl font-semibold">{snap.org.legal_name}</p>
            </div>
            <Badge className="ml-auto">{snap.org.membership_status.replace(/_/g, " ")}</Badge>
            <Link href="/onboarding/status" className="text-sm font-semibold text-brand-blue underline">
              {t("viewStatus")}
            </Link>
          </Card>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <Link href="/onboarding/seller">
              <Card className="h-full p-6 transition hover:border-brand-blue">
                <h2 className="font-display text-xl font-semibold">{t("sellerApp")}</h2>
                <p className="mt-2 text-sm text-slate-body">{t("sellerAppHelp")}</p>
              </Card>
            </Link>
            <Link href="/onboarding/buyer">
              <Card className="h-full p-6 transition hover:border-brand-blue">
                <h2 className="font-display text-xl font-semibold">{t("buyerApp")}</h2>
                <p className="mt-2 text-sm text-slate-body">{t("buyerAppHelp")}</p>
              </Card>
            </Link>
            <Link href="/onboarding/status">
              <Card className="h-full p-6 transition hover:border-brand-blue">
                <h2 className="font-display text-xl font-semibold">{t("statusCard")}</h2>
                <p className="mt-2 text-sm text-slate-body">{t("statusCardHelp")}</p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
