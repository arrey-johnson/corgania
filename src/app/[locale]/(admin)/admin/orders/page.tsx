import { OrderStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Orders" };

export default async function Page() {
  await requireAdminArea("orders");
  const supabase = await createClient();
  const [{ data: orders }, { data: milestones }, { data: disputes }] = supabase
    ? await Promise.all([
        supabase
          .from("orders")
          .select("id, reference, status, trade_mode, currency, total_amount, service_fee_amount, buyer_org_id, seller_org_id, buyer:buyer_org_id(legal_name), seller:seller_org_id(legal_name), created_at, updated_at")
          .order("updated_at", { ascending: false })
          .limit(150),
        supabase.from("order_milestones").select("id, order_id, status, note, created_at").order("created_at", { ascending: false }).limit(300),
        supabase.from("disputes").select("id, order_id, status").eq("status", "open"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  const rows = orders ?? [];
  const openDisputes = (disputes ?? []).length;

  return (
    <div>
      <AdminHeader
        title="Orders"
        description="Transaction oversight across buyer and seller organisations. Status changes write an audit milestone."
      />
      <AdminStatRow items={[
        { label: "Orders", value: rows.length },
        { label: "Assured", value: rows.filter((o) => o.trade_mode === "corgania_assured").length },
        { label: "In dispute", value: rows.filter((o) => o.status === "disputed").length || openDisputes },
        { label: "Completed", value: rows.filter((o) => o.status === "completed").length },
      ]} />
      <AdminTable
        headers={["Reference", "Parties", "Mode", "Value", "Status", "Update"]}
        empty={rows.length === 0 ? "No orders yet." : undefined}
      >
        {rows.map((o) => {
          const buyer = Array.isArray(o.buyer) ? o.buyer[0] : o.buyer;
          const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
          const recent = (milestones ?? []).filter((m) => m.order_id === o.id).slice(0, 2);
          return (
            <tr key={o.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{o.reference}</p>
                <p className="text-xs text-slate-body">{new Date(o.updated_at).toLocaleString()}</p>
              </td>
              <td className="px-4 py-3 text-slate-body">
                <p><span className="font-medium text-ink">Buyer:</span> {buyer?.legal_name ?? "—"}</p>
                <p><span className="font-medium text-ink">Seller:</span> {seller?.legal_name ?? "—"}</p>
              </td>
              <td className="px-4 py-3"><Badge>{o.trade_mode.replace(/_/g, " ")}</Badge></td>
              <td className="px-4 py-3 text-slate-body">
                {o.currency} {Number(o.total_amount).toLocaleString()}
                {Number(o.service_fee_amount) > 0 && (
                  <span className="block text-xs">fee {Number(o.service_fee_amount).toLocaleString()}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge>{o.status.replace(/_/g, " ")}</Badge>
                {recent.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs text-slate-body">
                    {recent.map((m) => (
                      <li key={m.id}>{m.status.replace(/_/g, " ")}{m.note ? ` — ${m.note}` : ""}</li>
                    ))}
                  </ul>
                )}
              </td>
              <td className="px-4 py-3 min-w-48"><OrderStatusForm orderId={o.id} current={o.status} /></td>
            </tr>
          );
        })}
      </AdminTable>
      {openDisputes > 0 && (
        <Card className="mt-4 p-4 text-sm text-slate-body">
          {openDisputes} open dispute{openDisputes === 1 ? "" : "s"} — manage them under{" "}
          <Link className="font-semibold text-brand-blue underline" href="/admin/trade-services">
            Trade Services
          </Link>
          .
        </Card>
      )}
    </div>
  );
}
