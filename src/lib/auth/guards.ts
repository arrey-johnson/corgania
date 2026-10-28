import { redirect as nextRedirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
  canAccessArea,
  type AdminArea,
  type PlatformRole,
  primaryRoleLabel,
} from "@/lib/auth/roles";
import { withLocale } from "@/i18n/path";
import type { AppLocale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export type SessionContext = {
  userId: string;
  orgId: string | null;
  canTrade: boolean;
  canBuy: boolean;
  canSell: boolean;
  isStaff: boolean;
  roles: PlatformRole[];
  roleLabel: string;
};

type MembershipRow = {
  organization_id: string;
  organizations:
    | {
        membership_status: string;
        membership_expires_at: string | null;
        can_buy?: boolean | null;
        can_sell?: boolean | null;
      }
    | {
        membership_status: string;
        membership_expires_at: string | null;
        can_buy?: boolean | null;
        can_sell?: boolean | null;
      }[]
    | null;
};

async function localeRedirect(href: string): Promise<never> {
  const locale = (await getLocale()) as AppLocale;
  nextRedirect(withLocale(href, locale));
}

/** Home route after login / auth callback — staff, members, and applicants each land in their area. */
export function homePathFor(session: SessionContext): string {
  if (session.isStaff) return "/admin";
  if (session.canTrade) return "/marketplace";
  return session.orgId ? "/onboarding/status" : "/onboarding";
}

/** Server-side gate for private areas. Registration alone never grants marketplace access. */
export async function requireSession(): Promise<SessionContext | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: memberships }, { data: staff }] = await Promise.all([
    supabase
      .from("organization_members")
      .select("organization_id, organizations(membership_status, membership_expires_at, can_buy, can_sell)")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase.from("platform_roles").select("role").eq("user_id", user.id),
  ]);

  const roles = (staff ?? []).map((r) => r.role).filter(Boolean) as PlatformRole[];
  const rows = (memberships ?? []) as unknown as MembershipRow[];
  const approved = rows.find((m) => {
    const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
    return (
      org?.membership_status === "approved" &&
      (!org.membership_expires_at || new Date(org.membership_expires_at) > new Date())
    );
  });
  const approvedOrg = approved
    ? Array.isArray(approved.organizations)
      ? approved.organizations[0]
      : approved.organizations
    : null;

  return {
    userId: user.id,
    orgId: approved?.organization_id ?? rows[0]?.organization_id ?? null,
    canTrade: Boolean(approved),
    canBuy: Boolean(approvedOrg?.can_buy),
    canSell: Boolean(approvedOrg?.can_sell),
    isStaff: roles.length > 0,
    roles,
    roleLabel: primaryRoleLabel(roles),
  };
}

export async function requireApprovedMember(): Promise<SessionContext> {
  const s = await requireSession();
  if (!s) return localeRedirect("/login");
  if (s.isStaff) return localeRedirect("/admin");
  if (!s.canTrade) return localeRedirect("/onboarding/status");
  return s;
}

export async function requireStaff(): Promise<SessionContext> {
  const s = await requireSession();
  if (!s) return localeRedirect("/login");
  if (!s.isStaff) return localeRedirect(homePathFor({ ...s, isStaff: false }));
  return s;
}

/** Gate a specific admin area by platform role. */
export async function requireAdminArea(area: AdminArea): Promise<SessionContext> {
  const s = await requireStaff();
  if (!canAccessArea(s.roles, area)) return localeRedirect("/admin");
  return s;
}
