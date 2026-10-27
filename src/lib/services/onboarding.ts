import type { ApplicationKind, MembershipStatus, VerificationStatus } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type OnboardingSnapshot = {
  org: {
    id: string;
    legal_name: string;
    membership_status: MembershipStatus;
    can_buy: boolean;
    can_sell: boolean;
    registration_country: string;
  } | null;
  applications: Array<{
    id: string;
    kind: ApplicationKind;
    status: MembershipStatus;
    submitted_at: string | null;
    review_notes: string | null;
    updated_at: string;
  }>;
  cases: Array<{
    id: string;
    kind: ApplicationKind;
    status: VerificationStatus;
    application_id: string | null;
    recommendation: string | null;
    decision_notes: string | null;
  }>;
  documents: Array<{
    id: string;
    case_id: string;
    doc_type: string;
    file_name: string;
    status: string;
    created_at: string;
  }>;
};

export async function getOnboardingSnapshot(userId: string): Promise<OnboardingSnapshot> {
  const empty: OnboardingSnapshot = { org: null, applications: [], cases: [], documents: [] };
  const supabase = await createClient();
  if (!supabase) return empty;

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, organizations(id, legal_name, membership_status, can_buy, can_sell, registration_country)")
    .eq("user_id", userId)
    .eq("is_active", true)
    .limit(5);

  type OrgEmbed = {
    id: string; legal_name: string; membership_status: MembershipStatus;
    can_buy: boolean; can_sell: boolean; registration_country: string;
  };
  const first = (memberships ?? [])[0] as
    | { organization_id: string; organizations: OrgEmbed | OrgEmbed[] | null }
    | undefined;
  const rawOrg = first?.organizations;
  const orgRow = Array.isArray(rawOrg) ? rawOrg[0] : rawOrg;
  if (!orgRow) return empty;

  const orgId = orgRow.id;
  const [{ data: apps }, { data: cases }] = await Promise.all([
    supabase
      .from("membership_applications")
      .select("id, kind, status, submitted_at, review_notes, updated_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
    supabase
      .from("verification_cases")
      .select("id, kind, status, application_id, recommendation, decision_notes")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false }),
  ]);

  const caseIds = (cases ?? []).map((c) => c.id);
  const { data: docs } = caseIds.length
    ? await supabase
        .from("verification_documents")
        .select("id, case_id, doc_type, file_name, status, created_at")
        .in("case_id", caseIds)
        .order("created_at", { ascending: false })
    : { data: [] as OnboardingSnapshot["documents"] };

  return {
    org: {
      id: orgRow.id,
      legal_name: orgRow.legal_name,
      membership_status: orgRow.membership_status,
      can_buy: orgRow.can_buy,
      can_sell: orgRow.can_sell,
      registration_country: orgRow.registration_country,
    },
    applications: apps ?? [],
    cases: cases ?? [],
    documents: docs ?? [],
  };
}

export {
  ALLOWED_DOC_MIME,
  BUYER_DOC_TYPES,
  MAX_DOC_BYTES,
  SELLER_DOC_TYPES,
} from "@/lib/services/onboarding-docs";
