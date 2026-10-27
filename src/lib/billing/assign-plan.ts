import { createServiceClient } from "@/lib/supabase/server";
import { grantForApproval, type MembershipGrant, PLAN_SLUGS } from "@/lib/billing/plans";

type AssignResult =
  | { ok: true; grant: MembershipGrant; subscriptionId: string | null; invoiceId: string | null }
  | { ok: false; error: string };

/**
 * After Verify approval: set membership expiry and create/refresh subscription
 * (Founder's Plan or Standard Annual). Uses service role for finance tables.
 */
export async function assignPlanOnApproval(organizationId: string, approvedAt: Date = new Date()): Promise<AssignResult> {
  const grant = grantForApproval(approvedAt);
  const admin = createServiceClient();
  if (!admin) {
    return { ok: false, error: "Service role required to assign membership plans" };
  }

  const { ensureDefaultMembershipPlans } = await import("@/lib/billing/ensure-plans");
  const seeded = await ensureDefaultMembershipPlans();
  if (!seeded.ok) return { ok: false, error: seeded.error ?? "Could not seed membership plans" };

  const { data: plan, error: planErr } = await admin
    .from("subscription_plans")
    .select("id, slug, price, currency")
    .eq("slug", grant.planSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (planErr || !plan) {
    return {
      ok: false,
      error: planErr?.message ?? `Plan “${grant.planSlug}” is missing — run migration 0006_membership_plans.sql`,
    };
  }

  // One active subscription per org: close prior actives, then insert.
  await admin
    .from("subscriptions")
    .update({ status: "replaced" })
    .eq("organization_id", organizationId)
    .eq("status", "active");

  const { data: sub, error: subErr } = await admin
    .from("subscriptions")
    .insert({
      organization_id: organizationId,
      plan_id: plan.id,
      status: "active",
      current_period_end: grant.subscriptionPeriodEnd,
    })
    .select("id")
    .single();

  if (subErr) return { ok: false, error: subErr.message };

  let invoiceId: string | null = null;
  if (grant.invoiceAmount > 0) {
    const number = `INV-${new Date().getUTCFullYear()}-${Date.now().toString(36).toUpperCase()}-${organizationId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    const due = new Date(approvedAt);
    due.setUTCDate(due.getUTCDate() + 14);
    const { data: inv, error: invErr } = await admin
      .from("invoices")
      .insert({
        organization_id: organizationId,
        number,
        amount: grant.invoiceAmount,
        currency: plan.currency ?? "USD",
        status: "issued",
        due_at: due.toISOString(),
      })
      .select("id")
      .single();
    if (!invErr) invoiceId = inv?.id ?? null;
  }

  return { ok: true, grant, subscriptionId: sub.id, invoiceId };
}

/** Expiry ISO to patch onto organizations when approving. */
export function membershipExpiryForApproval(approvedAt: Date = new Date()): string {
  return grantForApproval(approvedAt).membershipExpiresAt;
}

export { PLAN_SLUGS };
