"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { locales, type AppLocale } from "@/i18n/routing";

const LOCALE_COOKIE = "NEXT_LOCALE";

export async function setLocalePreference(locale: AppLocale) {
  if (!(locales as readonly string[]).includes(locale)) return { ok: false as const };

  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ locale }).eq("id", user.id);
    }
  }

  return { ok: true as const };
}
