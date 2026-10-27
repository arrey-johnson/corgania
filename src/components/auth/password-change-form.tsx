"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { changePasswordSchema, setPasswordSchema } from "@/lib/validation/schemas";

type Mode = "change" | "set";

export function PasswordChangeForm({
  mode = "change",
  email,
  onSuccess,
}: {
  mode?: Mode;
  /** Required for re-auth when changing an existing password. */
  email?: string | null;
  onSuccess?: () => void;
}) {
  const t = useTranslations("account");
  const c = useTranslations("common");
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
      if (mode === "set") {
        const parsed = setPasswordSchema.safeParse({
          newPassword: String(fd.get("newPassword") ?? ""),
          confirmPassword: String(fd.get("confirmPassword") ?? ""),
        });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? t("invalid"));
        const { error: updErr } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
        if (updErr) throw updErr;
      } else {
        const parsed = changePasswordSchema.safeParse({
          currentPassword: String(fd.get("currentPassword") ?? ""),
          newPassword: String(fd.get("newPassword") ?? ""),
          confirmPassword: String(fd.get("confirmPassword") ?? ""),
        });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? t("invalid"));

        const {
          data: { user },
        } = await supabase.auth.getUser();
        const accountEmail = email || user?.email;
        if (!accountEmail) throw new Error(t("noEmail"));

        const { error: reauthErr } = await supabase.auth.signInWithPassword({
          email: accountEmail,
          password: parsed.data.currentPassword,
        });
        if (reauthErr) throw new Error(t("wrongCurrent"));

        const { error: updErr } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
        if (updErr) throw updErr;
      }

      setInfo(t("updated"));
      (e.target as HTMLFormElement).reset();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : c("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {mode === "change" && (
        <div>
          <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            minLength={8}
          />
        </div>
      )}
      <div>
        <Label htmlFor="newPassword">{t("newPassword")}</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
        <p className="mt-1 text-xs text-slate-body">{t("passwordHint")}</p>
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
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
      <Button type="submit" variant="red" disabled={busy}>
        {busy ? c("pleaseWait") : mode === "set" ? t("setPassword") : t("updatePassword")}
      </Button>
    </form>
  );
}
