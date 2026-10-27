"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Label, Card } from "@/components/ui/primitives";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getPostLoginPath } from "@/app/actions/auth";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validation/schemas";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" }) {
  const t = useTranslations("auth");
  const c = useTranslations("common");
  const router = useRouter();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    const fd = new FormData(e.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setError(t("notConfigured"));
      return;
    }
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(String(fd.get("email")), {
          redirectTo: `${location.origin}/auth/callback?next=/update-password`,
        });
        if (error) throw error;
        setInfo(t("recoverySent"));
      } else if (mode === "login") {
        const parsed = loginSchema.safeParse(Object.fromEntries(fd));
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
        const { data: signedIn, error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) throw error;
        let dest = "/onboarding";
        try {
          dest = await getPostLoginPath();
        } catch {
          /* ignore */
        }
        if (dest === "/login" || dest === "/onboarding") {
          const uid = signedIn.user?.id;
          if (uid) {
            const [{ data: roles }, { data: memberships }] = await Promise.all([
              supabase.from("platform_roles").select("role").eq("user_id", uid),
              supabase
                .from("organization_members")
                .select("organization_id, organizations(membership_status, membership_expires_at)")
                .eq("user_id", uid)
                .eq("is_active", true),
            ]);
            if (roles?.length) dest = "/admin";
            else {
              const approved = (memberships ?? []).some((m) => {
                const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
                return (
                  org?.membership_status === "approved" &&
                  (!org.membership_expires_at || new Date(org.membership_expires_at) > new Date())
                );
              });
              if (approved) dest = "/marketplace";
              else if ((memberships ?? []).length) dest = "/onboarding/status";
            }
          }
        }
        router.push(dest);
        router.refresh();
      } else {
        const parsed = registerSchema.safeParse({
          ...Object.fromEntries(fd),
          country: String(fd.get("country") || "CM"),
          intent: String(fd.get("intent") || "seller"),
        });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
            data: {
              full_name: parsed.data.fullName,
              organisation_name: parsed.data.organisationName,
              intent: parsed.data.intent,
              country: parsed.data.country,
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          router.push("/onboarding");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? t("welcomeBack") : mode === "register" ? t("startApplication") : t("recoverAccount");
  const hint = mode === "register" ? t("registerHint") : mode === "login" ? t("loginHint") : t("forgotHint");
  const submitLabel = busy ? c("pleaseWait") : mode === "login" ? c("signIn") : mode === "register" ? t("createAccount") : t("sendRecovery");

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-end">
          <LanguageSwitcher variant="compact" />
        </div>
        <Link href="/">
          <Image src="/brand/corgania-logo.png" alt="Corgania" width={320} height={128} className="mx-auto h-16 w-auto sm:h-20" />
        </Link>
        <h1 className="mt-6 text-center font-display text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-body">{hint}</p>
        {!isSupabaseConfigured && (
          <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{t("setupRequired")}</p>
        )}
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {mode === "register" && (
            <>
              <div>
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input id="fullName" name="fullName" required autoComplete="name" />
              </div>
              <div>
                <Label htmlFor="organisationName">{t("organisationName")}</Label>
                <Input id="organisationName" name="organisationName" required autoComplete="organization" />
              </div>
              <div>
                <Label htmlFor="intent">{t("joiningAs")}</Label>
                <select id="intent" name="intent" className="h-11 w-full rounded-md border border-line px-3 text-sm">
                  <option value="seller">{t("intentSeller")}</option>
                  <option value="buyer">{t("intentBuyer")}</option>
                  <option value="both">{t("intentBoth")}</option>
                </select>
              </div>
              <input type="hidden" name="country" value="CM" />
            </>
          )}
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          {mode !== "forgot" && (
            <div>
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm font-medium text-brand-red">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-sm text-slate-body">
              {info}
            </p>
          )}
          <Button type="submit" variant="red" className="w-full" disabled={busy}>
            {submitLabel}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-body">
          {mode === "login" ? (
            <>
              {t("newTo")}{" "}
              <Link className="font-semibold text-brand-blue" href="/register">
                {c("becomeMember")}
              </Link>{" "}
              ·{" "}
              <Link className="font-semibold text-brand-blue" href="/forgot-password">
                {t("forgotPassword")}
              </Link>
            </>
          ) : (
            <>
              {t("alreadyRegistered")}{" "}
              <Link className="font-semibold text-brand-blue" href="/login">
                {c("signIn")}
              </Link>
            </>
          )}
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-xs text-slate-body underline">
            ← {c("backHome")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
