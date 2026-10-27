import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_CATALOG } from "@/lib/billing/plans";

/** Idempotent upsert of Founder's + Standard Annual plans (service role). */
export async function ensureDefaultMembershipPlans(): Promise<{ ok: boolean; error?: string }> {
  const admin = createServiceClient();
  if (!admin) return { ok: false, error: "Service role not configured" };

  for (const plan of PLAN_CATALOG) {
    const { error } = await admin.from("subscription_plans").upsert(
      {
        slug: plan.slug,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        billing_period: plan.billing_period,
        features: plan.features,
        is_active: true,
      },
      { onConflict: "slug" },
    );
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}
