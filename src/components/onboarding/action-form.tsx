"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import type { ActionResult } from "@/lib/actions/result";
import { Button } from "@/components/ui/button";

export function ActionForm({
  action,
  children,
  submitLabel,
  className,
  encType,
  compact,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  encType?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("common");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const result = await action(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInfo(result.message ?? t("saved"));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("somethingWrong"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={className} encType={encType} noValidate>
      {children}
      {error && (
        <p role="alert" className={`${compact ? "mt-1 text-xs" : "mt-3 text-sm"} font-medium text-brand-red`}>
          {error}
        </p>
      )}
      {info && (
        <p role="status" className={`${compact ? "mt-1 text-xs" : "mt-3 text-sm"} text-slate-body`}>
          {info}
        </p>
      )}
      <Button type="submit" variant={compact ? "outline" : "red"} size={compact ? "sm" : "md"} className={compact ? "mt-1" : "mt-5"} disabled={busy}>
        {busy ? t("pleaseWait") : submitLabel}
      </Button>
    </form>
  );
}
