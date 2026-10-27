"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/guards";
import { MEMBERSHIP_TRANSITIONS, assertTransition } from "@/lib/domain/state-machines";
import { writeAudit } from "@/lib/services/audit";
import { ALLOWED_DOC_MIME, MAX_DOC_BYTES } from "@/lib/services/onboarding";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/result";
import {
  buyerApplicationSchema,
  orgCreateSchema,
  sellerApplicationSchema,
} from "@/lib/validation/schemas";

export type { ActionResult };

async function authed() {
  const session = await requireSession();
  if (!session) return { error: "Sign in required" as const, session: null, supabase: null };
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase is not configured" as const, session: null, supabase: null };
  return { error: null, session, supabase };
}

export async function createOrganisation(formData: FormData): Promise<ActionResult> {
  const gate = await authed();
  if (gate.error || !gate.session || !gate.supabase) return { ok: false, error: gate.error ?? "Unavailable" };

  const parsed = orgCreateSchema.safeParse({
    legalName: formData.get("legalName"),
    tradingName: formData.get("tradingName") || undefined,
    registrationCountry: String(formData.get("registrationCountry") || "").toUpperCase(),
    registrationNumber: formData.get("registrationNumber") || undefined,
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone") || undefined,
    intent: formData.get("intent"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid organisation details" };

  const canBuy = parsed.data.intent === "buyer" || parsed.data.intent === "both";
  const canSell = parsed.data.intent === "seller" || parsed.data.intent === "both";

  const { data: orgId, error } = await gate.supabase.rpc("create_organization_with_owner", {
    p_legal_name: parsed.data.legalName,
    p_registration_country: parsed.data.registrationCountry,
    p_trading_name: parsed.data.tradingName || null,
    p_registration_number: parsed.data.registrationNumber || null,
    p_contact_email: parsed.data.contactEmail,
    p_contact_phone: parsed.data.contactPhone || null,
    p_can_buy: canBuy,
    p_can_sell: canSell,
  });
  if (error) return { ok: false, error: error.message };
  if (!orgId) return { ok: false, error: "Organisation was not created" };

  await writeAudit({
    actorId: gate.session.userId,
    organizationId: orgId,
    action: "org.created",
    entityType: "organizations",
    entityId: orgId,
    metadata: { intent: parsed.data.intent },
  });

  revalidatePath("/onboarding");
  revalidatePath("/onboarding/status");
  return { ok: true, id: orgId, message: "Organisation created" };
}

async function submitApplication(kind: "seller" | "buyer", formData: FormData): Promise<ActionResult> {
  const gate = await authed();
  if (gate.error || !gate.session || !gate.supabase) return { ok: false, error: gate.error ?? "Unavailable" };

  const schema = kind === "seller" ? sellerApplicationSchema : buyerApplicationSchema;
  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid application" };

  const orgId = gate.session.orgId;
  if (!orgId) return { ok: false, error: "Create your organisation before submitting an application" };

  const { data: existing } = await gate.supabase
    .from("membership_applications")
    .select("id, status")
    .eq("organization_id", orgId)
    .eq("kind", kind)
    .in("status", ["draft", "submitted", "under_review", "info_required", "verification_in_progress", "approved"])
    .maybeSingle();

  if (existing && existing.status !== "draft" && existing.status !== "info_required" && existing.status !== "rejected") {
    return { ok: false, error: `A ${kind} application is already in progress` };
  }

  const payload = parsed.data;
  let applicationId = existing?.id;

  if (applicationId) {
    const from = existing!.status;
    if (from !== "draft" && from !== "info_required" && from !== "rejected") {
      return { ok: false, error: "Application cannot be resubmitted in its current status" };
    }
    if (from === "rejected") {
      try { assertTransition(MEMBERSHIP_TRANSITIONS, "rejected", "submitted"); } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid transition" };
      }
    } else if (from === "draft") {
      try { assertTransition(MEMBERSHIP_TRANSITIONS, "draft", "submitted"); } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid transition" };
      }
    } else if (from === "info_required") {
      try { assertTransition(MEMBERSHIP_TRANSITIONS, "info_required", "under_review"); } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : "Invalid transition" };
      }
    }
    const nextStatus = from === "info_required" ? "under_review" : "submitted";
    const { error } = await gate.supabase
      .from("membership_applications")
      .update({
        payload,
        status: nextStatus,
        submitted_by: gate.session.userId,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await gate.supabase
      .from("membership_applications")
      .insert({
        organization_id: orgId,
        kind,
        status: "submitted",
        payload,
        submitted_by: gate.session.userId,
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    applicationId = data.id;
  }

  const { data: existingCase } = await gate.supabase
    .from("verification_cases")
    .select("id, status")
    .eq("organization_id", orgId)
    .eq("kind", kind)
    .not("status", "in", "(approved,rejected,expired)")
    .maybeSingle();

  let caseId = existingCase?.id;
  if (!caseId) {
    const { data: created, error: caseErr } = await gate.supabase
      .from("verification_cases")
      .insert({
        organization_id: orgId,
        application_id: applicationId,
        kind,
        status: "not_started",
      })
      .select("id")
      .single();
    if (caseErr) return { ok: false, error: caseErr.message };
    caseId = created.id;
  } else {
    await gate.supabase
      .from("verification_cases")
      .update({ application_id: applicationId, updated_at: new Date().toISOString() })
      .eq("id", caseId);
  }

  const orgUpdate: {
    membership_status: "submitted";
    updated_at: string;
    industry?: string;
    description?: string;
    website?: string | null;
  } = { membership_status: "submitted", updated_at: new Date().toISOString() };
  if ("industry" in payload) orgUpdate.industry = payload.industry;
  if ("description" in payload) orgUpdate.description = payload.description;
  if ("website" in payload) orgUpdate.website = payload.website || null;
  await gate.supabase.from("organizations").update(orgUpdate).eq("id", orgId);

  await writeAudit({
    actorId: gate.session.userId,
    organizationId: orgId,
    action: `application.${kind}.submitted`,
    entityType: "membership_applications",
    entityId: applicationId,
    metadata: { caseId },
  });

  revalidatePath("/onboarding");
  revalidatePath(`/onboarding/${kind}`);
  revalidatePath("/onboarding/status");
  return { ok: true, id: applicationId, message: "Application submitted for Corgania Verify review" };
}

export async function submitSellerApplication(formData: FormData) {
  return submitApplication("seller", formData);
}
export async function submitBuyerApplication(formData: FormData) {
  return submitApplication("buyer", formData);
}

export async function uploadVerificationDocument(formData: FormData): Promise<ActionResult> {
  const gate = await authed();
  if (gate.error || !gate.session || !gate.supabase) return { ok: false, error: gate.error ?? "Unavailable" };

  const caseId = String(formData.get("caseId") || "");
  const docType = String(formData.get("docType") || "");
  const file = formData.get("file");
  if (!caseId || !docType) return { ok: false, error: "Document type and case are required" };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file to upload" };
  if (file.size > MAX_DOC_BYTES) return { ok: false, error: "File must be 20 MB or smaller" };
  if (!ALLOWED_DOC_MIME.has(file.type)) return { ok: false, error: "Only PDF, JPEG, PNG or WebP files are accepted" };

  const orgId = gate.session.orgId;
  if (!orgId) return { ok: false, error: "Organisation required" };

  const { data: vcase, error: caseErr } = await gate.supabase
    .from("verification_cases")
    .select("id, organization_id")
    .eq("id", caseId)
    .eq("organization_id", orgId)
    .maybeSingle();
  if (caseErr || !vcase) return { ok: false, error: "Verification case not found" };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const path = `${orgId}/${caseId}/${docType}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await gate.supabase.storage
    .from("verification-documents")
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: doc, error: docErr } = await gate.supabase
    .from("verification_documents")
    .insert({
      case_id: caseId,
      organization_id: orgId,
      doc_type: docType,
      storage_path: path,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      status: "pending_review",
      uploaded_by: gate.session.userId,
    })
    .select("id")
    .single();
  if (docErr) return { ok: false, error: docErr.message };

  await writeAudit({
    actorId: gate.session.userId,
    organizationId: orgId,
    action: "verification.document.uploaded",
    entityType: "verification_documents",
    entityId: doc.id,
    metadata: { docType, caseId },
  });

  revalidatePath("/onboarding/status");
  revalidatePath("/onboarding/seller");
  revalidatePath("/onboarding/buyer");
  return { ok: true, id: doc.id, message: "Document uploaded" };
}
