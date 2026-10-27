import { OrgStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Members" };

export default async function Page() {
  await requireAdminArea("members");
  const supabase = await createClient();
  const { data: orgs } = supabase
    ? await supabase
        .from("organizations")
        .select("id, legal_name, trading_name, registration_country, membership_status, can_buy, can_sell, membership_expires_at, contact_email, created_at")
        .order("created_at", { ascending: false })
        .limit(300)
    : { data: [] };

  const rows = orgs ?? [];
  const approved = rows.filter((o) => o.membership_status === "approved").length;
  const suspended = rows.filter((o) => o.membership_status === "suspended").length;

  return (
    <div>
      <AdminHeader
        title="Organisations"
        description="Membership directory with suspend / approve / expire controls. Trading access requires approved status and a non-expired membership."
      />
      <AdminStatRow items={[
        { label: "Total", value: rows.length },
        { label: "Approved", value: approved },
        { label: "Suspended", value: suspended },
        { label: "Pending / other", value: rows.length - approved - suspended },
      ]} />
      <AdminTable
        headers={["Organisation", "Country", "Status", "Capabilities", "Expires", "Actions"]}
        empty={rows.length === 0 ? "No organisations yet. They appear after applicants create orgs during onboarding." : undefined}
      >
        {rows.map((o) => (
          <tr key={o.id} className="border-b border-line last:border-0 align-top">
            <td className="px-4 py-3">
              <p className="font-medium text-ink">{o.legal_name}</p>
              <p className="text-xs text-slate-body">{o.contact_email ?? o.trading_name ?? o.id.slice(0, 8)}</p>
            </td>
            <td className="px-4 py-3">{o.registration_country}</td>
            <td className="px-4 py-3"><Badge>{o.membership_status.replace(/_/g, " ")}</Badge></td>
            <td className="px-4 py-3 text-slate-body">
              {[o.can_buy && "buy", o.can_sell && "sell"].filter(Boolean).join(" · ") || "—"}
            </td>
            <td className="px-4 py-3 text-slate-body">
              {o.membership_expires_at ? new Date(o.membership_expires_at).toLocaleDateString() : "—"}
            </td>
            <td className="px-4 py-3"><OrgStatusForm orgId={o.id} current={o.membership_status === "approved" || o.membership_status === "suspended" || o.membership_status === "rejected" || o.membership_status === "expired" ? o.membership_status : "approved"} /></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
