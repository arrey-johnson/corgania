import { CompleteInspectionForm, ScheduleInspectionForm } from "@/components/admin/verify-actions";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Inspections" };

export default async function Page() {
  await requireAdminArea("inspections");
  const supabase = await createClient();
  const [{ data: inspections }, { data: openCases }] = supabase
    ? await Promise.all([
        supabase
          .from("inspections")
          .select("id, case_id, organization_id, scheduled_at, completed_at, location, outcome, findings, organizations(legal_name)")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("verification_cases")
          .select("id, kind, status, organizations(legal_name)")
          .in("status", ["not_started", "in_progress", "info_required", "recommended"])
          .order("created_at", { ascending: false })
          .limit(50),
      ])
    : [{ data: [] }, { data: [] }];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Inspections</h1>
      <p className="mt-2 text-sm text-slate-body">Schedule and complete on-site or remote inspections linked to verification cases.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {(openCases ?? []).slice(0, 6).map((c) => {
          const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations;
          return (
            <Card key={c.id} className="p-5">
              <p className="font-semibold">{org?.legal_name ?? "Organisation"} <Badge className="ml-2 capitalize">{c.kind}</Badge></p>
              <div className="mt-3"><ScheduleInspectionForm caseId={c.id} /></div>
            </Card>
          );
        })}
      </div>

      <h2 className="mt-12 font-display text-2xl font-semibold">Inspection log</h2>
      <div className="mt-4 space-y-4">
        {(inspections ?? []).length === 0 && <Card className="p-6 text-sm text-slate-body">No inspections recorded.</Card>}
        {(inspections ?? []).map((insp) => {
          const org = Array.isArray(insp.organizations) ? insp.organizations[0] : insp.organizations;
          return (
            <Card key={insp.id} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{org?.legal_name ?? "Organisation"}</p>
                {insp.outcome ? <Badge>{insp.outcome}</Badge> : <Badge>scheduled</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-body">
                {insp.scheduled_at ? `Scheduled ${new Date(insp.scheduled_at).toLocaleString()}` : "Unscheduled"}
                {insp.location ? ` · ${insp.location}` : ""}
              </p>
              {insp.findings && <p className="mt-3 text-sm text-slate-body">{insp.findings}</p>}
              {!insp.completed_at && (
                <div className="mt-4 max-w-lg"><CompleteInspectionForm inspectionId={insp.id} /></div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
