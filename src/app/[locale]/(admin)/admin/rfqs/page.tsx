import { RfqStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — RFQs" };

export default async function Page() {
  await requireAdminArea("rfqs");
  const supabase = await createClient();
  const [{ data: rfqs }, { data: quotes }] = supabase
    ? await Promise.all([
        supabase
          .from("rfqs")
          .select("id, product_name, quantity, unit, destination_country, status, deadline, buyer_org_id, organizations:buyer_org_id(legal_name), created_at")
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("quotations").select("id, rfq_id, status"),
      ])
    : [{ data: [] }, { data: [] }];

  const rows = rfqs ?? [];
  const quoteCount = (id: string) => (quotes ?? []).filter((q) => q.rfq_id === id).length;

  return (
    <div>
      <AdminHeader
        title="RFQ oversight"
        description="Platform view of buyer requests for quotation. Close, cancel or expire RFQs that need intervention."
      />
      <AdminStatRow items={[
        { label: "RFQs", value: rows.length },
        { label: "Published", value: rows.filter((r) => r.status === "published").length },
        { label: "Quotations", value: (quotes ?? []).length },
        { label: "Closed / awarded", value: rows.filter((r) => r.status === "closed" || r.status === "awarded").length },
      ]} />
      <AdminTable
        headers={["Product", "Buyer", "Qty", "Destination", "Deadline", "Quotes", "Status", "Actions"]}
        empty={rows.length === 0 ? "No RFQs yet." : undefined}
      >
        {rows.map((r) => {
          const org = Array.isArray(r.organizations) ? r.organizations[0] : r.organizations;
          return (
            <tr key={r.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3 font-medium text-ink">{r.product_name}</td>
              <td className="px-4 py-3">{org?.legal_name ?? "—"}</td>
              <td className="px-4 py-3 text-slate-body">{r.quantity} {r.unit}</td>
              <td className="px-4 py-3">{r.destination_country}</td>
              <td className="px-4 py-3 text-slate-body">{new Date(r.deadline).toLocaleDateString()}</td>
              <td className="px-4 py-3">{quoteCount(r.id)}</td>
              <td className="px-4 py-3"><Badge>{r.status}</Badge></td>
              <td className="px-4 py-3"><RfqStatusForm rfqId={r.id} current={["published", "closed", "cancelled", "expired"].includes(r.status) ? r.status : "published"} /></td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
