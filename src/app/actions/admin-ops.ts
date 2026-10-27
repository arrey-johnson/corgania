"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { writeAudit } from "@/lib/services/audit";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/result";

async function staff() {
  const session = await requireStaff();
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return { session, supabase };
}

function deny(message: string): ActionResult {
  return { ok: false, error: message };
}

function revalidateAdmin(paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

export async function setOrganisationStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.manageMembers(session.roles)) return deny("Only operations, approvers or super admins can change membership status");
    const orgId = String(formData.get("orgId") || "");
    const status = String(formData.get("status") || "");
    const allowed = ["approved", "suspended", "rejected", "expired"] as const;
    if (!orgId || !allowed.includes(status as (typeof allowed)[number])) {
      return { ok: false, error: "Organisation and a valid status are required" };
    }
    const patch: Record<string, unknown> = {
      membership_status: status,
      updated_at: new Date().toISOString(),
    };
    let planLabel = "";
    if (status === "approved") {
      const { assignPlanOnApproval, membershipExpiryForApproval } = await import("@/lib/billing/assign-plan");
      const approvedAt = new Date();
      patch.membership_expires_at = membershipExpiryForApproval(approvedAt);
      const assigned = await assignPlanOnApproval(orgId, approvedAt);
      if (!assigned.ok) return { ok: false, error: assigned.error };
      planLabel = assigned.grant.label;
    }
    const { error } = await supabase.from("organizations").update(patch).eq("id", orgId);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      organizationId: orgId,
      action: `org.status.${status}`,
      entityType: "organizations",
      entityId: orgId,
      metadata: planLabel ? { planLabel } : {},
    });
    revalidateAdmin(["/admin/members", "/admin", "/onboarding/status", "/admin/finance"]);
    return {
      ok: true,
      message: planLabel ? `Organisation marked ${status} — ${planLabel}` : `Organisation marked ${status}`,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setStorefrontPublished(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.moderateMarketplace(session.roles)) return deny("Only operations or super admins can moderate storefronts");
    const id = String(formData.get("storefrontId") || "");
    const publish = String(formData.get("publish") || "") === "true";
    if (!id) return { ok: false, error: "Storefront required" };
    const { data, error } = await supabase
      .from("storefronts")
      .update({ is_published: publish, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, organization_id")
      .single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      organizationId: data.organization_id,
      action: publish ? "storefront.published" : "storefront.unpublished",
      entityType: "storefronts",
      entityId: id,
    });
    revalidateAdmin(["/admin/stores"]);
    return { ok: true, message: publish ? "Storefront published" : "Storefront unpublished" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setProductStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.moderateMarketplace(session.roles)) return deny("Only operations or super admins can moderate products");
    const id = String(formData.get("productId") || "");
    const status = String(formData.get("status") || "");
    const allowed = ["draft", "pending_review", "approved", "rejected", "archived"] as const;
    if (!id || !allowed.includes(status as (typeof allowed)[number])) {
      return { ok: false, error: "Product and valid status required" };
    }
    const { data, error } = await supabase
      .from("products")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, organization_id")
      .single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      organizationId: data.organization_id,
      action: `product.status.${status}`,
      entityType: "products",
      entityId: id,
    });
    revalidateAdmin(["/admin/products"]);
    return { ok: true, message: `Product ${status.replace(/_/g, " ")}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setRfqStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.moderateMarketplace(session.roles)) return deny("Only operations or super admins can manage RFQs");
    const id = String(formData.get("rfqId") || "");
    const status = String(formData.get("status") || "");
    const allowed = ["published", "closed", "cancelled", "expired"] as const;
    if (!id || !allowed.includes(status as (typeof allowed)[number])) {
      return { ok: false, error: "RFQ and valid status required" };
    }
    const { data, error } = await supabase
      .from("rfqs")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, buyer_org_id")
      .single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      organizationId: data.buyer_org_id,
      action: `rfq.status.${status}`,
      entityType: "rfqs",
      entityId: id,
    });
    revalidateAdmin(["/admin/rfqs"]);
    return { ok: true, message: `RFQ ${status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setOrderStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.moderateMarketplace(session.roles)) return deny("Only operations or super admins can update orders");
    const id = String(formData.get("orderId") || "");
    const status = String(formData.get("status") || "");
    const note = String(formData.get("note") || "").trim();
    if (!id || !status) return { ok: false, error: "Order and status required" };
    const { data: order, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, buyer_org_id, seller_org_id")
      .single();
    if (error) return { ok: false, error: error.message };
    await supabase.from("order_milestones").insert({
      order_id: id,
      status,
      note: note || `Staff set status to ${status}`,
      actor_id: session.userId,
    });
    await writeAudit({
      actorId: session.userId,
      organizationId: order.buyer_org_id,
      action: `order.status.${status}`,
      entityType: "orders",
      entityId: id,
      metadata: { note: note || null, seller_org_id: order.seller_org_id },
    });
    revalidateAdmin(["/admin/orders", "/admin/trade-services"]);
    return { ok: true, message: `Order updated to ${status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setDisputeStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staff();
    if (!can.moderateMarketplace(session.roles) && !can.reviewVerification(session.roles)) {
      return deny("Insufficient role to update disputes");
    }
    const id = String(formData.get("disputeId") || "");
    const status = String(formData.get("status") || "");
    const resolution = String(formData.get("resolution") || "").trim();
    const allowed = ["open", "under_review", "resolved", "escalated"] as const;
    if (!id || !allowed.includes(status as (typeof allowed)[number])) {
      return { ok: false, error: "Dispute and valid status required" };
    }
    const { data, error } = await supabase
      .from("disputes")
      .update({
        status,
        resolution: resolution || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, opened_by_org, order_id")
      .single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      organizationId: data.opened_by_org,
      action: `dispute.status.${status}`,
      entityType: "disputes",
      entityId: id,
      metadata: { resolution: resolution || null },
    });
    revalidateAdmin(["/admin/trade-services", "/admin/orders"]);
    return { ok: true, message: `Dispute ${status.replace(/_/g, " ")}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertArticle(formData: FormData): Promise<ActionResult> {
  try {
    const { session } = await staff();
    if (!can.manageCms(session.roles)) return deny("Only content editors or super admins can manage Insights");
    const admin = createServiceClient();
    if (!admin) return { ok: false, error: "Service role required for CMS writes" };

    const id = String(formData.get("articleId") || "");
    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const excerpt = String(formData.get("excerpt") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const status = String(formData.get("status") || "draft");
    if (!title || !slug) return { ok: false, error: "Title and slug are required" };
    if (!["draft", "scheduled", "published", "archived"].includes(status)) {
      return { ok: false, error: "Invalid article status" };
    }

    const row = {
      title,
      slug,
      excerpt,
      body,
      status,
      author_id: session.userId,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await admin.from("articles").update(row).eq("id", id);
      if (error) return { ok: false, error: error.message };
      await writeAudit({
        actorId: session.userId,
        action: "article.updated",
        entityType: "articles",
        entityId: id,
        metadata: { status },
      });
      revalidateAdmin(["/admin/insights", "/insights"]);
      return { ok: true, id, message: "Article updated" };
    }

    const { data, error } = await admin.from("articles").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      action: "article.created",
      entityType: "articles",
      entityId: data.id,
      metadata: { status },
    });
    revalidateAdmin(["/admin/insights", "/insights"]);
    return { ok: true, id: data.id, message: "Article created" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function setArticleStatus(formData: FormData): Promise<ActionResult> {
  try {
    const { session } = await staff();
    if (!can.manageCms(session.roles)) return deny("Only content editors or super admins can manage Insights");
    const admin = createServiceClient();
    if (!admin) return { ok: false, error: "Service role required for CMS writes" };
    const id = String(formData.get("articleId") || "");
    const status = String(formData.get("status") || "");
    if (!id || !["draft", "published", "archived"].includes(status)) {
      return { ok: false, error: "Article and status required" };
    }
    const { error } = await admin.from("articles").update({
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      action: `article.status.${status}`,
      entityType: "articles",
      entityId: id,
    });
    revalidateAdmin(["/admin/insights", "/insights"]);
    return { ok: true, message: `Article ${status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function upsertSubscriptionPlan(formData: FormData): Promise<ActionResult> {
  try {
    const { session } = await staff();
    if (!can.manageFinance(session.roles)) return deny("Only finance or super admins can manage plans");
    const admin = createServiceClient();
    if (!admin) return { ok: false, error: "Service role required for finance writes" };
    const name = String(formData.get("name") || "").trim();
    const slug = String(formData.get("slug") || "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const price = Number(formData.get("price") || 0);
    const billing = String(formData.get("billingPeriod") || "monthly");
    if (!name || !slug) return { ok: false, error: "Name and slug required" };
    if (!["monthly", "annual"].includes(billing)) return { ok: false, error: "Invalid billing period" };
    const { data, error } = await admin.from("subscription_plans").upsert({
      name,
      slug,
      price,
      currency: "USD",
      billing_period: billing,
      is_active: true,
      features: {},
    }, { onConflict: "slug" }).select("id").single();
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      action: "plan.upserted",
      entityType: "subscription_plans",
      entityId: data.id,
    });
    revalidateAdmin(["/admin/finance", "/admin/settings"]);
    return { ok: true, id: data.id, message: "Plan saved" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function grantPlatformRole(formData: FormData): Promise<ActionResult> {
  try {
    const { session } = await staff();
    if (!can.manageStaff(session.roles)) return deny("Only super admins can grant staff roles");
    const admin = createServiceClient();
    if (!admin) return { ok: false, error: "Service role required" };
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const role = String(formData.get("role") || "");
    const roles = [
      "super_admin", "operations", "verification_reviewer", "verification_approver",
      "finance", "content_editor", "support",
    ];
    if (!email || !roles.includes(role)) return { ok: false, error: "Valid email and role required" };

    const { data: listed } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const user = (listed?.users ?? []).find((u) => u.email?.toLowerCase() === email);
    if (!user) return { ok: false, error: "No auth user with that email" };

    const { error } = await admin.from("platform_roles").upsert(
      { user_id: user.id, role },
      { onConflict: "user_id,role" },
    );
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      action: "staff.role.granted",
      entityType: "platform_roles",
      entityId: user.id,
      metadata: { role, email },
    });
    revalidateAdmin(["/admin/settings"]);
    return { ok: true, message: `Granted ${role} to ${email}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function revokePlatformRole(formData: FormData): Promise<ActionResult> {
  try {
    const { session } = await staff();
    if (!can.manageStaff(session.roles)) return deny("Only super admins can revoke staff roles");
    const admin = createServiceClient();
    if (!admin) return { ok: false, error: "Service role required" };
    const userId = String(formData.get("userId") || "");
    const role = String(formData.get("role") || "");
    if (!userId || !role) return { ok: false, error: "User and role required" };
    if (userId === session.userId && role === "super_admin") {
      return { ok: false, error: "You cannot revoke your own super_admin role" };
    }
    const { error } = await admin.from("platform_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) return { ok: false, error: error.message };
    await writeAudit({
      actorId: session.userId,
      action: "staff.role.revoked",
      entityType: "platform_roles",
      entityId: userId,
      metadata: { role },
    });
    revalidateAdmin(["/admin/settings"]);
    return { ok: true, message: "Role revoked" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
