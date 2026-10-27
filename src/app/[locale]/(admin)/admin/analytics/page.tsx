import {
  ContinentBars,
  GrowthChart,
  PipelineChart,
  StatusDonut,
} from "@/components/admin/overview-charts";
import { AdminHeader, AdminStatRow } from "@/components/admin/admin-ui";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Analytics" };

export default async function Page() {
  await requireAdminArea("analytics");
  const data = await getAdminDashboardData();
  const supabase = await createClient();

  const [{ count: products }, { count: rfqs }, { count: orders }, { count: messages }, { data: audit }] = supabase
    ? await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("rfqs").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("id, action, entity_type, created_at, actor_id").order("created_at", { ascending: false }).limit(25),
      ])
    : [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { data: [] }];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Analytics"
        description="Operational analytics computed only from live Corgania data — never fabricated metrics."
      />
      <AdminStatRow items={[
        { label: "Organisations", value: data.totals.organisations },
        { label: "Products", value: products ?? 0 },
        { label: "RFQs", value: rfqs ?? 0 },
        { label: "Orders", value: orders ?? 0 },
      ]} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Seller-capable orgs" value={data.totals.sellers + data.totals.both} />
        <MetricCard label="Buyer-capable orgs" value={data.totals.buyers + data.totals.both} />
        <MetricCard label="Messages exchanged" value={messages ?? 0} />
        <MetricCard label="Markets with presence" value={data.countries.length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Growth</h2>
          <p className="mt-1 text-sm text-slate-body">Organisations and applications over six months</p>
          <div className="mt-4"><GrowthChart data={data.monthlyOrgs} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Verify pipeline</h2>
          <p className="mt-1 text-sm text-slate-body">Membership funnel from submitted to decision</p>
          <div className="mt-4"><PipelineChart data={data.pipeline} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Membership status</h2>
          <div className="mt-4"><StatusDonut data={data.statusBreakdown} /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Continent mix</h2>
          <div className="mt-4"><ContinentBars data={data.continents} /></div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-xl font-semibold">Recent audit activity</h2>
        <p className="mt-1 text-sm text-slate-body">Latest staff actions written to audit_logs</p>
        <ul className="mt-4 divide-y divide-line">
          {(audit ?? []).length === 0 && <li className="py-6 text-sm text-slate-body">No audit events yet.</li>}
          {(audit ?? []).map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
              <div>
                <Badge>{row.action}</Badge>
                <span className="ml-2 text-slate-body">{row.entity_type}</span>
              </div>
              <span className="text-xs text-slate-body">{new Date(row.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-body">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</p>
    </Card>
  );
}
