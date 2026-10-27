"use server";

import { homePathFor, requireSession } from "@/lib/auth/guards";

/** Returns the dashboard/home path for the signed-in user (staff → admin, member → marketplace, else onboarding). */
export async function getPostLoginPath(): Promise<string> {
  const session = await requireSession();
  if (!session) return "/login";
  return homePathFor(session);
}
