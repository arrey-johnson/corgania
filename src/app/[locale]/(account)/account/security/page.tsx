import { getTranslations } from "next-intl/server";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Card } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account" });
  return { title: t("securityTitle") };
}

export default async function Page() {
  const t = await getTranslations("account");
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{t("securityTitle")}</h1>
        <p className="mt-2 text-sm text-slate-body">{t("securityHint")}</p>
        {user?.email && (
          <p className="mt-1 text-sm text-slate-body">
            {t("signedInAs")} <span className="font-medium text-ink">{user.email}</span>
          </p>
        )}
      </div>
      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-ink">{t("changePassword")}</h2>
        <p className="mt-1 text-sm text-slate-body">{t("changePasswordHint")}</p>
        <div className="mt-5">
          <PasswordChangeForm mode="change" email={user?.email} />
        </div>
      </Card>
    </div>
  );
}
