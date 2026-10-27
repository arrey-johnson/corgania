import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env, isSupabaseConfigured } from "@/lib/env";
import { stripLocalePrefix, withLocale } from "@/i18n/path";
import { locales, type AppLocale } from "@/i18n/routing";

const PROTECTED = ["/marketplace", "/dashboard", "/onboarding", "/admin"];

function localeFromPath(pathname: string): AppLocale {
  const seg = pathname.split("/")[1];
  return (locales as readonly string[]).includes(seg ?? "") ? (seg as AppLocale) : "en";
}

export async function updateSession(request: NextRequest, intlResponse?: NextResponse) {
  const response = intlResponse ?? NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const bare = stripLocalePrefix(pathname);
  const locale = localeFromPath(pathname);
  const needsAuth = PROTECTED.some((p) => bare === p || bare.startsWith(`${p}/`));

  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: { name: string; value: string; options?: Record<string, unknown> }[]) =>
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options as never)),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (needsAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = withLocale("/login", locale);
    url.searchParams.set("next", bare);
    return NextResponse.redirect(url);
  }

  return response;
}
