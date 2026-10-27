import Link from "next/link";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Applications" };

export default async function Page() {
  await requireAdminArea("applications");
  const supabase = await createClient();
  const { data: apps } = supabase
    ? await supabase
        .from("membership_applications")
        .select("id, kind, status, submitted_at, organization_id, review_notes, payload, organizations(legal_name, registration_country, membership_status)")
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  const rows = apps ?? [];

  return (
    <div>
      <AdminHeader
        title="Membership applications"
        description="Seller and buyer applications awaiting Corgania Verify. Open the verification queue to review documents and decide."
        actions={
          <Link href="/admin/verifications" className="rounded-md bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark">
            Open verifications
          </Link>
        }
      />
      <AdminStatRow items={[
        { label: "Applications", value: rows.length },
        { label: "Seller", value: rows.filter((a) => a.kind === "seller").length },
        { label: "Buyer", value: rows.filter((a) => a.kind === "buyer").length },
        { label: "Needs action", value: rows.filter((a) => ["submitted", "under_review", "info_required", "verification_in_progress"].includes(a.status)).length },
      ]} />
      <AdminTable
        headers={["Organisation", "Kind", "Country", "Submitted", "Status", "Notes"]}
        empty={rows.length === 0 ? "No applications yet." : undefined}
      >
        {rows.map((app) => {
          const org = Array.isArray(app.organizations) ? app.organizations[0] : app.organizations;
          const payload = (app.payload ?? {}) as Record<string, unknown>;
          return (
            <tr key={app.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{org?.legal_name ?? "Organisation"}</p>
                {typeof payload.industry === "string" && (
                  <p className="text-xs text-slate-body">{payload.industry}</p>
                )}
              </td>
              <td className="px-4 py-3 capitalize">{app.kind}</td>
              <td className="px-4 py-3">{org?.registration_country ?? "—"}</td>
              <td className="px-4 py-3 text-slate-body">
                {app.submitted_at ? new Date(app.submitted_at).toLocaleString() : "—"}
              </td>
              <td className="px-4 py-3">
                <Badge>{app.status.replace(/_/g, " ")}</Badge>
                {org?.membership_status && org.membership_status !== app.status && (
                  <p className="mt-1 text-xs text-slate-body">org: {org.membership_status.replace(/_/g, " ")}</p>
                )}
              </td>
              <td className="px-4 py-3 max-w-xs text-sm text-slate-body">{app.review_notes ?? "—"}</td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
