import {
  DecideForm,
  RecommendForm,
  RequestInfoForm,
  ScheduleInspectionForm,
  StartReviewForm,
} from "@/components/admin/verify-actions";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { can } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Verifications" };

export default async function Page() {
  const session = await requireAdminArea("verifications");
  const canReview = can.reviewVerification(session.roles);
  const canApprove = can.approveVerification(session.roles);
  const supabase = await createClient();
  const { data: cases } = supabase
    ? await supabase
        .from("verification_cases")
        .select("id, kind, status, organization_id, application_id, reviewer_id, approver_id, recommendation, decision_notes, organizations(legal_name)")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const caseIds = (cases ?? []).map((c) => c.id);
  const { data: docs } = supabase && caseIds.length
    ? await supabase.from("verification_documents").select("id, case_id, doc_type, file_name, status").in("case_id", caseIds)
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Verifications</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-body">
        Document review, inspection assignment, recommendation, then independent approval. Signed in as{" "}
        <strong>{session.roleLabel}</strong>
        {canReview && !canApprove && " — you can review and recommend, but not approve."}
        {canApprove && !canReview && " — you can approve recommended cases; review actions stay with reviewers."}
        {canReview && canApprove && " — you hold both review and approve powers (typically super admin only)."}
      </p>
      <div className="mt-8 space-y-6">
        {(cases ?? []).length === 0 && <Card className="p-6 text-sm text-slate-body">No verification cases yet.</Card>}
        {(cases ?? []).map((vcase) => {
          const org = Array.isArray(vcase.organizations) ? vcase.organizations[0] : vcase.organizations;
          const caseDocs = (docs ?? []).filter((d) => d.case_id === vcase.id);
          return (
            <Card key={vcase.id} className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-semibold">{org?.legal_name ?? "Organisation"}</h2>
                <Badge className="capitalize">{vcase.kind}</Badge>
                <Badge>{vcase.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-body">Case {vcase.id}</p>
              {caseDocs.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-slate-body">
                  {caseDocs.map((d) => (
                    <li key={d.id}>{d.doc_type.replace(/_/g, " ")} — {d.file_name} ({d.status.replace(/_/g, " ")})</li>
                  ))}
                </ul>
              )}
              {vcase.recommendation && <p className="mt-3 text-sm"><span className="font-semibold">Recommendation:</span> {vcase.recommendation}</p>}
              {vcase.decision_notes && <p className="mt-2 text-sm"><span className="font-semibold">Decision:</span> {vcase.decision_notes}</p>}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {canReview && (vcase.status === "not_started" || vcase.status === "info_required") && (
                  <div className="rounded-lg border border-line p-4"><StartReviewForm caseId={vcase.id} /></div>
                )}
                {canReview && (vcase.status === "in_progress" || vcase.status === "not_started") && (
                  <div className="rounded-lg border border-line p-4"><RequestInfoForm caseId={vcase.id} /></div>
                )}
                {canReview && vcase.status === "in_progress" && (
                  <>
                    <div className="rounded-lg border border-line p-4"><RecommendForm caseId={vcase.id} /></div>
                    <div className="rounded-lg border border-line p-4"><ScheduleInspectionForm caseId={vcase.id} /></div>
                  </>
                )}
                {canApprove && vcase.status === "recommended" && (
                  <div className="rounded-lg border border-line p-4"><DecideForm caseId={vcase.id} /></div>
                )}
                {!canReview && !canApprove && (
                  <p className="text-sm text-slate-body">View-only for your role. Reviewers recommend; approvers decide.</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
