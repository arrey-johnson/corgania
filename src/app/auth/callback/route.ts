import { NextResponse } from "next/server";
import { homePathFor, requireSession } from "@/lib/auth/guards";
import { withLocale } from "@/i18n/path";
import { locales, type AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

function pickLocale(request: Request): AppLocale {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const fromCookie = match?.[1];
  if (fromCookie && (locales as readonly string[]).includes(fromCookie)) {
    return fromCookie as AppLocale;
  }
  return "en";
}

/** Handles email confirmation & recovery redirects from Supabase Auth. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next");
  const locale = pickLocale(request);

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const safeNext =
          requestedNext?.startsWith("/") &&
          !requestedNext.startsWith("//") &&
          !requestedNext.includes("://")
            ? requestedNext
            : null;
        if (safeNext) {
          return NextResponse.redirect(`${origin}${withLocale(safeNext, locale)}`);
        }
        const session = await requireSession();
        const dest = session ? homePathFor(session) : "/onboarding";
        return NextResponse.redirect(`${origin}${withLocale(dest, locale)}`);
      }
    }
  }
  return NextResponse.redirect(`${origin}${withLocale("/login", locale)}?error=auth_callback`);
}
