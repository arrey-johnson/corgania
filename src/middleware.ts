import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  return updateSession(request, intlResponse);
}

export const config = {
  // Skip locale rewrite for static public assets (images, brand, topojson, etc.)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|images/|geo/|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|webp|ico|json)$).*)",
  ],
};
