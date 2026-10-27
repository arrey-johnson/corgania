import { getTranslations } from "next-intl/server";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("settingsTitle") };
}

export default async function Page() {
  const t = await getTranslations("marketplace");
  const a = await getTranslations("account");
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">{t("settingsTitle")}</h1>
        <p className="mt-2 text-sm text-slate-body">{a("securityHint")}</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-ink">{a("changePassword")}</h2>
        <p className="mt-1 text-sm text-slate-body">{a("changePasswordHint")}</p>
        {user?.email && (
          <p className="mt-2 text-sm text-slate-body">
            {a("signedInAs")} <span className="font-medium text-ink">{user.email}</span>
          </p>
        )}
        <div className="mt-5 max-w-md">
          <PasswordChangeForm mode="change" email={user?.email} />
        </div>
        <p className="mt-4 text-xs text-slate-body">
          <Link href="/account/security" className="font-medium text-brand-blue hover:underline">
            {a("securityTitle")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
