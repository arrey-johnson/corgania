import { PlanForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Finance" };

export default async function Page() {
  await requireAdminArea("finance");
  // Finance tables are readable by finance/super_admin; use service client for complete admin view.
  const { ensureDefaultMembershipPlans } = await import("@/lib/billing/ensure-plans");
  await ensureDefaultMembershipPlans();
  const db = createServiceClient() ?? await createClient();
  const [{ data: plans }, { data: subs }, { data: invoices }, { data: commissions }] = db
    ? await Promise.all([
        db.from("subscription_plans").select("id, slug, name, price, currency, billing_period, is_active").order("price"),
        db.from("subscriptions").select("id, status, current_period_end, created_at, organizations(legal_name), subscription_plans(name, price, currency)").order("created_at", { ascending: false }).limit(100),
        db.from("invoices").select("id, number, amount, currency, status, due_at, created_at, organizations(legal_name)").order("created_at", { ascending: false }).limit(100),
        db.from("commission_records").select("id, amount, currency, basis, created_at, organizations(legal_name), orders(reference)").order("created_at", { ascending: false }).limit(100),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const invoiceTotal = (invoices ?? []).reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const commissionTotal = (commissions ?? []).reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div className="space-y-10">
      <AdminHeader
        title="Finance"
        description="Founder's Plan (6 months free) and Standard Annual (USD 599/org/year for seller, buyer, or both). Subscriptions are assigned on Verify approval. Settlement stays with approved providers."
      />
      <AdminStatRow items={[
        { label: "Active plans", value: (plans ?? []).filter((p) => p.is_active).length },
        { label: "Subscriptions", value: (subs ?? []).length },
        { label: "Invoice volume", value: `USD ${invoiceTotal.toLocaleString()}` },
        { label: "Commissions logged", value: `USD ${commissionTotal.toLocaleString()}` },
      ]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Create / update plan</h2>
          <p className="mt-1 text-sm text-slate-body">Upserts by slug. Use for membership packaging.</p>
          <div className="mt-4"><PlanForm /></div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Plans</h2>
          <ul className="mt-4 space-y-3">
            {(plans ?? []).length === 0 && <li className="text-sm text-slate-body">No plans yet — create one on the left.</li>}
            {(plans ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-xs text-slate-body">{p.slug} · {p.billing_period}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{p.currency} {Number(p.price).toLocaleString()}</p>
                  <Badge className="mt-1">{p.is_active ? "active" : "inactive"}</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Subscriptions</h2>
        <AdminTable
          headers={["Organisation", "Plan", "Status", "Period end", "Started"]}
          empty={(subs ?? []).length === 0 ? "No subscriptions yet." : undefined}
        >
          {(subs ?? []).map((s) => {
            const org = Array.isArray(s.organizations) ? s.organizations[0] : s.organizations;
            const plan = Array.isArray(s.subscription_plans) ? s.subscription_plans[0] : s.subscription_plans;
            return (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{org?.legal_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-body">{plan?.name ?? "—"}{plan ? ` (${plan.currency} ${Number(plan.price).toLocaleString()})` : ""}</td>
                <td className="px-4 py-3"><Badge>{s.status}</Badge></td>
                <td className="px-4 py-3 text-slate-body">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3 text-slate-body">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Invoices</h2>
        <AdminTable
          headers={["Number", "Organisation", "Amount", "Due", "Status"]}
          empty={(invoices ?? []).length === 0 ? "No invoices issued." : undefined}
        >
          {(invoices ?? []).map((i) => {
            const org = Array.isArray(i.organizations) ? i.organizations[0] : i.organizations;
            return (
              <tr key={i.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{i.number}</td>
                <td className="px-4 py-3">{org?.legal_name ?? "—"}</td>
                <td className="px-4 py-3">{i.currency} {Number(i.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-body">{i.due_at ? new Date(i.due_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><Badge>{i.status}</Badge></td>
              </tr>
            );
          })}
        </AdminTable>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Commission records</h2>
        <AdminTable
          headers={["Organisation", "Order", "Amount", "Basis", "Logged"]}
          empty={(commissions ?? []).length === 0 ? "No commission records." : undefined}
        >
          {(commissions ?? []).map((c) => {
            const org = Array.isArray(c.organizations) ? c.organizations[0] : c.organizations;
            const order = Array.isArray(c.orders) ? c.orders[0] : c.orders;
            return (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{org?.legal_name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-body">{order?.reference ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{c.currency} {Number(c.amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-body">{c.basis ?? "—"}</td>
                <td className="px-4 py-3 text-slate-body">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            );
          })}
        </AdminTable>
      </section>
    </div>
  );
}
