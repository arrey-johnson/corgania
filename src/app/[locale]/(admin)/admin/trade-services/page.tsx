import { DisputeStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Trade Services" };

export default async function Page() {
  await requireAdminArea("trade-services");
  const supabase = await createClient();
  const [{ data: assured }, { data: shipments }, { data: docs }, { data: disputes }, { data: payments }] = supabase
    ? await Promise.all([
        supabase
          .from("orders")
          .select("id, reference, status, currency, total_amount, buyer:buyer_org_id(legal_name), seller:seller_org_id(legal_name), updated_at")
          .eq("trade_mode", "corgania_assured")
          .order("updated_at", { ascending: false })
          .limit(100),
        supabase
          .from("shipments")
          .select("id, order_id, carrier, tracking_reference, origin, destination, status, estimated_arrival, orders(reference)")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("trade_documents")
          .select("id, order_id, doc_type, file_name, created_at, organizations(legal_name)")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("disputes")
          .select("id, order_id, reason, status, resolution, opened_by_org, organizations:opened_by_org(legal_name), orders(reference), created_at")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("payment_records")
          .select("id, order_id, method, reference, amount, currency, status, created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Trade Services"
        description="Corgania-Assured cases: documentation, shipments, payment evidence and dispute handling."
      />
      <AdminStatRow items={[
        { label: "Assured orders", value: (assured ?? []).length },
        { label: "Shipments", value: (shipments ?? []).length },
        { label: "Trade documents", value: (docs ?? []).length },
        { label: "Open disputes", value: (disputes ?? []).filter((d) => d.status === "open" || d.status === "under_review").length },
      ]} />

      <section>
        <h2 className="font-display text-xl font-semibold">Corgania-Assured orders</h2>
        <AdminTable
          headers={["Reference", "Parties", "Value", "Status"]}
          empty={(assured ?? []).length === 0 ? "No Corgania-Assured orders yet." : undefined}
        >
          {(assured ?? []).map((o) => {
            const buyer = Array.isArray(o.buyer) ? o.buyer[0] : o.buyer;
            const seller = Array.isArray(o.seller) ? o.seller[0] : o.seller;
            return (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{o.reference}</td>
                <td className="px-4 py-3 text-slate-body">{buyer?.legal_name ?? "—"} ? {seller?.legal_name ?? "—"}</td>
                <td className="px-4 py-3">{o.currency} {Number(o.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3"><Badge>{o.status.replace(/_/g, " ")}</Badge></td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Shipments</h2>
        <AdminTable
          headers={["Order", "Carrier / tracking", "Route", "ETA", "Status"]}
          empty={(shipments ?? []).length === 0 ? "No shipments logged." : undefined}
        >
          {(shipments ?? []).map((s) => {
            const order = Array.isArray(s.orders) ? s.orders[0] : s.orders;
            return (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{order?.reference ?? s.order_id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-slate-body">{s.carrier ?? "—"}{s.tracking_reference ? ` · ${s.tracking_reference}` : ""}</td>
                <td className="px-4 py-3 text-slate-body">{[s.origin, s.destination].filter(Boolean).join(" ? ") || "—"}</td>
                <td className="px-4 py-3 text-slate-body">{s.estimated_arrival ? new Date(s.estimated_arrival).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><Badge>{s.status}</Badge></td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-semibold">Trade documents</h2>
          <div className="mt-4 space-y-2">
            {(docs ?? []).length === 0 && <Card className="p-4 text-sm text-slate-body">No trade documents uploaded.</Card>}
            {(docs ?? []).slice(0, 20).map((d) => {
              const org = Array.isArray(d.organizations) ? d.organizations[0] : d.organizations;
              return (
                <Card key={d.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium text-ink">{d.doc_type.replace(/_/g, " ")} — {d.file_name}</p>
                    <p className="text-xs text-slate-body">{org?.legal_name ?? "—"} · {new Date(d.created_at).toLocaleString()}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold">Payment evidence</h2>
          <div className="mt-4 space-y-2">
            {(payments ?? []).length === 0 && <Card className="p-4 text-sm text-slate-body">No payment records yet. Settlement remains with approved providers only.</Card>}
            {(payments ?? []).slice(0, 20).map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{p.status.replace(/_/g, " ")}</Badge>
                  <span className="text-sm font-medium">{p.currency} {p.amount != null ? Number(p.amount).toLocaleString() : "—"}</span>
                </div>
                <p className="mt-1 text-xs text-slate-body">{p.method ?? "method n/a"}{p.reference ? ` · ${p.reference}` : ""} · {new Date(p.created_at).toLocaleString()}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Disputes</h2>
        <div className="mt-4 space-y-4">
          {(disputes ?? []).length === 0 && <Card className="p-4 text-sm text-slate-body">No disputes opened.</Card>}
          {(disputes ?? []).map((d) => {
            const org = Array.isArray(d.organizations) ? d.organizations[0] : d.organizations;
            const order = Array.isArray(d.orders) ? d.orders[0] : d.orders;
            return (
              <Card key={d.id} className="grid gap-4 p-5 lg:grid-cols-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{d.status.replace(/_/g, " ")}</Badge>
                    <span className="text-sm text-slate-body">Order {order?.reference ?? d.order_id.slice(0, 8)}</span>
                  </div>
                  <p className="mt-2 font-medium text-ink">{org?.legal_name ?? "Organisation"}</p>
                  <p className="mt-2 text-sm text-slate-body">{d.reason}</p>
                  {d.resolution && <p className="mt-2 text-sm text-emerald-800">Resolution: {d.resolution}</p>}
                </div>
                <DisputeStatusForm disputeId={d.id} current={d.status} />
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
