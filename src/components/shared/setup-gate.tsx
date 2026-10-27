"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { isSupabaseConfigured } from "@/lib/env";

/** Honest gate for private areas when Supabase/session/membership isn't ready. */
export function SetupGate({ area }: { area: string }) {
  const t = useTranslations("onboarding");
  const c = useTranslations("common");

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-14">
      <Card className="max-w-lg p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">{c("membersOnly")}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">{area}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-body">
          {isSupabaseConfigured ? t("restricted") : t("supabaseNeeded")}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/login" className="rounded-md bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white">
            {c("signIn")}
          </Link>
          <Link href="/register" className="rounded-md bg-brand-red px-5 py-2.5 text-sm font-semibold text-white">
            {c("becomeMember")}
          </Link>
        </div>
      </Card>
    </div>
  );
}
