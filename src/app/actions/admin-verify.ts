"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { MEMBERSHIP_TRANSITIONS, assertTransition } from "@/lib/domain/state-machines";
import { writeAudit } from "@/lib/services/audit";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/result";
import {
  adminDecisionSchema,
  adminRecommendSchema,
  adminReviewSchema,
  completeInspectionSchema,
  scheduleInspectionSchema,
} from "@/lib/validation/schemas";

export type { ActionResult };

async function staffClient() {
  const session = await requireStaff();
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase is not configured");
  return { session, supabase };
}

function deny(message: string): ActionResult {
  return { ok: false, error: message };
}

function revalidateAdmin() {
  revalidatePath("/admin/applications");
  revalidatePath("/admin/verifications");
  revalidatePath("/admin/inspections");
  revalidatePath("/admin/members");
  revalidatePath("/onboarding/status");
}

export async function startCaseReview(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.reviewVerification(session.roles)) return deny("Only verification reviewers can start a review");
    const parsed = adminReviewSchema.safeParse({
      caseId: formData.get("caseId"),
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { data: vcase, error } = await supabase
      .from("verification_cases")
      .select("id, organization_id, application_id, status, reviewer_id")
      .eq("id", parsed.data.caseId)
      .single();
    if (error || !vcase) return { ok: false, error: "Case not found" };

    const { error: upErr } = await supabase
      .from("verification_cases")
      .update({
        status: "in_progress",
        reviewer_id: session.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vcase.id);
    if (upErr) return { ok: false, error: upErr.message };

    if (vcase.application_id) {
      await supabase
        .from("membership_applications")
        .update({
          status: "under_review",
          reviewed_by: session.userId,
          review_notes: parsed.data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", vcase.application_id);
    }
    await supabase
      .from("organizations")
      .update({ membership_status: "under_review", updated_at: new Date().toISOString() })
      .eq("id", vcase.organization_id);

    await writeAudit({
      actorId: session.userId,
      organizationId: vcase.organization_id,
      action: "verification.review.started",
      entityType: "verification_cases",
      entityId: vcase.id,
      metadata: { notes: parsed.data.notes ?? null },
    });
    revalidateAdmin();
    return { ok: true, message: "Review started" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function requestMoreInfo(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.reviewVerification(session.roles)) return deny("Only verification reviewers can request more information");
    const caseId = String(formData.get("caseId") || "");
    const notes = String(formData.get("notes") || "").trim();
    if (!caseId || notes.length < 5) return { ok: false, error: "Case and notes (min 5 characters) are required" };

    const { data: vcase } = await supabase
      .from("verification_cases")
      .select("id, organization_id, application_id")
      .eq("id", caseId)
      .single();
    if (!vcase) return { ok: false, error: "Case not found" };

    await supabase.from("verification_cases").update({
      status: "info_required",
      reviewer_id: session.userId,
      updated_at: new Date().toISOString(),
    }).eq("id", caseId);

    if (vcase.application_id) {
      await supabase.from("membership_applications").update({
        status: "info_required",
        reviewed_by: session.userId,
        review_notes: notes,
        updated_at: new Date().toISOString(),
      }).eq("id", vcase.application_id);
    }
    await supabase.from("organizations").update({
      membership_status: "info_required",
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.organization_id);

    await writeAudit({
      actorId: session.userId,
      organizationId: vcase.organization_id,
      action: "verification.info_required",
      entityType: "verification_cases",
      entityId: caseId,
      metadata: { notes },
    });
    revalidateAdmin();
    return { ok: true, message: "Information requested from applicant" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function recommendCase(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.reviewVerification(session.roles)) return deny("Only verification reviewers can recommend a case");
    const parsed = adminRecommendSchema.safeParse({
      caseId: formData.get("caseId"),
      recommendation: formData.get("recommendation"),
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { data: vcase } = await supabase
      .from("verification_cases")
      .select("id, organization_id, application_id, reviewer_id")
      .eq("id", parsed.data.caseId)
      .single();
    if (!vcase) return { ok: false, error: "Case not found" };

    const { error } = await supabase.from("verification_cases").update({
      status: "recommended",
      reviewer_id: session.userId,
      recommendation: parsed.data.recommendation,
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.id);
    if (error) return { ok: false, error: error.message };

    if (vcase.application_id) {
      await supabase.from("membership_applications").update({
        status: "verification_in_progress",
        reviewed_by: session.userId,
        review_notes: parsed.data.notes || parsed.data.recommendation,
        updated_at: new Date().toISOString(),
      }).eq("id", vcase.application_id);
    }
    await supabase.from("organizations").update({
      membership_status: "verification_in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.organization_id);

    await writeAudit({
      actorId: session.userId,
      organizationId: vcase.organization_id,
      action: "verification.recommended",
      entityType: "verification_cases",
      entityId: vcase.id,
    });
    revalidateAdmin();
    return { ok: true, message: "Recommendation recorded — awaiting independent approver" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function decideCase(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.approveVerification(session.roles)) return deny("Only verification approvers can make the final decision");
    const parsed = adminDecisionSchema.safeParse({
      caseId: formData.get("caseId"),
      decision: formData.get("decision"),
      decisionNotes: formData.get("decisionNotes"),
      notes: formData.get("notes") || undefined,
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { data: vcase } = await supabase
      .from("verification_cases")
      .select("id, organization_id, application_id, kind, status, reviewer_id, approver_id")
      .eq("id", parsed.data.caseId)
      .single();
    if (!vcase) return { ok: false, error: "Case not found" };
    if (vcase.status !== "recommended" && parsed.data.decision === "approved") {
      return { ok: false, error: "Only recommended cases can be approved" };
    }
    if (vcase.reviewer_id && vcase.reviewer_id === session.userId) {
      return { ok: false, error: "Reviewer and approver must be different people" };
    }

    const nextVerify = parsed.data.decision === "approved" ? "approved" : "rejected";
    const nextMembership = parsed.data.decision === "approved" ? "approved" : "rejected";
    try {
      assertTransition(MEMBERSHIP_TRANSITIONS, "verification_in_progress", nextMembership);
    } catch {
      // Allow from under_review / submitted paths when rejecting early
      if (parsed.data.decision === "approved") {
        return { ok: false, error: "Organisation is not ready for approval" };
      }
    }

    const { error } = await supabase.from("verification_cases").update({
      status: nextVerify,
      approver_id: session.userId,
      decision_notes: parsed.data.decisionNotes,
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.id);
    if (error) return { ok: false, error: error.message };

    if (vcase.application_id) {
      await supabase.from("membership_applications").update({
        status: nextMembership,
        reviewed_by: session.userId,
        review_notes: parsed.data.decisionNotes,
        updated_at: new Date().toISOString(),
      }).eq("id", vcase.application_id);
    }

    const orgPatch: {
      membership_status: "approved" | "rejected";
      updated_at: string;
      can_buy?: boolean;
      can_sell?: boolean;
      membership_expires_at?: string | null;
    } = {
      membership_status: nextMembership,
      updated_at: new Date().toISOString(),
    };
    let planLabel = "";
    if (parsed.data.decision === "approved") {
      if (vcase.kind === "buyer") orgPatch.can_buy = true;
      if (vcase.kind === "seller") orgPatch.can_sell = true;
      const { assignPlanOnApproval, membershipExpiryForApproval } = await import("@/lib/billing/assign-plan");
      const approvedAt = new Date();
      orgPatch.membership_expires_at = membershipExpiryForApproval(approvedAt);
      const assigned = await assignPlanOnApproval(vcase.organization_id, approvedAt);
      if (!assigned.ok) return { ok: false, error: assigned.error };
      planLabel = assigned.grant.label;
    }
    await supabase.from("organizations").update(orgPatch).eq("id", vcase.organization_id);

    await writeAudit({
      actorId: session.userId,
      organizationId: vcase.organization_id,
      action: `verification.${parsed.data.decision}`,
      entityType: "verification_cases",
      entityId: vcase.id,
      metadata: { decisionNotes: parsed.data.decisionNotes, kind: vcase.kind, planLabel: planLabel || undefined },
    });
    revalidateAdmin();
    return {
      ok: true,
      message:
        parsed.data.decision === "approved"
          ? `Membership approved — ${planLabel}`
          : "Application rejected",
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function scheduleInspection(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.reviewVerification(session.roles) && !can.moderateMarketplace(session.roles)) {
      return deny("Insufficient role to schedule inspections");
    }
    const parsed = scheduleInspectionSchema.safeParse({
      caseId: formData.get("caseId"),
      scheduledAt: formData.get("scheduledAt"),
      location: formData.get("location"),
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { data: vcase } = await supabase
      .from("verification_cases")
      .select("id, organization_id")
      .eq("id", parsed.data.caseId)
      .single();
    if (!vcase) return { ok: false, error: "Case not found" };

    const { data: row, error } = await supabase.from("inspections").insert({
      case_id: vcase.id,
      organization_id: vcase.organization_id,
      inspector_id: session.userId,
      scheduled_at: new Date(parsed.data.scheduledAt).toISOString(),
      location: parsed.data.location,
    }).select("id").single();
    if (error) return { ok: false, error: error.message };

    await supabase.from("verification_cases").update({
      status: "in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.id);
    await supabase.from("organizations").update({
      membership_status: "verification_in_progress",
      updated_at: new Date().toISOString(),
    }).eq("id", vcase.organization_id);

    await writeAudit({
      actorId: session.userId,
      organizationId: vcase.organization_id,
      action: "inspection.scheduled",
      entityType: "inspections",
      entityId: row.id,
    });
    revalidateAdmin();
    return { ok: true, message: "Inspection scheduled" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function completeInspection(formData: FormData): Promise<ActionResult> {
  try {
    const { session, supabase } = await staffClient();
    if (!can.reviewVerification(session.roles) && !can.moderateMarketplace(session.roles)) {
      return deny("Insufficient role to complete inspections");
    }
    const parsed = completeInspectionSchema.safeParse({
      inspectionId: formData.get("inspectionId"),
      findings: formData.get("findings"),
      outcome: formData.get("outcome"),
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };

    const { data: insp } = await supabase
      .from("inspections")
      .select("id, case_id, organization_id")
      .eq("id", parsed.data.inspectionId)
      .single();
    if (!insp) return { ok: false, error: "Inspection not found" };

    const { error } = await supabase.from("inspections").update({
      findings: parsed.data.findings,
      outcome: parsed.data.outcome,
      completed_at: new Date().toISOString(),
      inspector_id: session.userId,
    }).eq("id", insp.id);
    if (error) return { ok: false, error: error.message };

    await writeAudit({
      actorId: session.userId,
      organizationId: insp.organization_id,
      action: "inspection.completed",
      entityType: "inspections",
      entityId: insp.id,
      metadata: { outcome: parsed.data.outcome },
    });
    revalidateAdmin();
    return { ok: true, message: "Inspection completed" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
