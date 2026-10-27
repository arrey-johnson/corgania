import { createServiceClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/database.types";

/** Append-only audit via service role (no client INSERT policy on audit_logs). */
export async function writeAudit(input: {
  actorId: string | null;
  organizationId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Json;
}) {
  const admin = createServiceClient();
  if (!admin) return { ok: false as const, error: "Service role not configured" };
  const { error } = await admin.from("audit_logs").insert({
    actor_id: input.actorId,
    organization_id: input.organizationId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
