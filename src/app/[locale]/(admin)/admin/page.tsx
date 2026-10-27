import Link from "next/link";
import {
  ContinentBars,
  GrowthChart,
  PipelineChart,
  StatusDonut,
} from "@/components/admin/overview-charts";
import { WorldPresenceMap } from "@/components/admin/world-presence-map";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";

export const metadata = { title: "Admin — Overview" };

export default async function Page() {
  await requireAdminArea("overview");
  const data = await getAdminDashboardData();
  const { totals } = data;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-brand-blue px-6 py-8 text-white sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(220,38,38,0.45), transparent 35%), radial-gradient(circle at 10% 80%, rgba(255,255,255,0.12), transparent 40%)",
          }}
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Operations overview</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Corgania command centre</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">
            Live membership geography, verification pipeline and growth — coloured for sellers (blue), buyers (red), and dual-role organisations (teal).
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat label="Organisations" value={totals.organisations} hint={`${totals.approved} approved`} />
            <HeroStat label="Seller-capable" value={totals.sellers + totals.both} hint="Blue on the map" />
            <HeroStat label="Buyer-capable" value={totals.buyers + totals.both} hint="Red on the map" />
            <HeroStat label="Open verifications" value={totals.openVerifications} hint={`${totals.pending} not yet approved`} />
          </div>
        </div>
      </div>

      <WorldPresenceMap countries={data.countries} />

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Growth (last 6 months)" subtitle="New organisations and applications by month">
          <GrowthChart data={data.monthlyOrgs} />
        </Panel>
        <Panel title="Membership pipeline" subtitle="Where organisations sit in Corgania Verify">
          <PipelineChart data={data.pipeline} />
        </Panel>
        <Panel title="Status mix" subtitle="Current membership_status distribution">
          <StatusDonut data={data.statusBreakdown} />
        </Panel>
        <Panel title="By continent" subtitle="Seller vs buyer capability across continents">
          <ContinentBars data={data.continents} />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Quick links</h2>
          <div className="mt-4 grid gap-2">
            {([
              { href: "/admin/applications", label: "Applications", value: totals.applications },
              { href: "/admin/verifications", label: "Verifications", value: totals.openVerifications },
              { href: "/admin/inspections", label: "Inspections", value: totals.inspections },
              { href: "/admin/members", label: "All members", value: totals.organisations },
            ] as const).map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 text-sm font-medium text-ink transition hover:border-brand-blue hover:bg-white">
                <span>{item.label}</span>
                <Badge>{item.value}</Badge>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">Recent applications</h2>
              <p className="mt-1 text-sm text-slate-body">Latest seller and buyer submissions</p>
            </div>
            <Link href="/admin/applications" className="text-sm font-semibold text-brand-blue underline">View all</Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wider text-slate-body">
                <tr>
                  <th className="py-2 pr-3">Organisation</th>
                  <th className="py-2 pr-3">Kind</th>
                  <th className="py-2 pr-3">Country</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentApplications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-body">No applications yet — the map and charts stay ready as members join.</td>
                  </tr>
                )}
                {data.recentApplications.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className="py-3 pr-3 font-medium text-ink">{a.orgName}</td>
                    <td className="py-3 pr-3 capitalize text-slate-body">{a.kind}</td>
                    <td className="py-3 pr-3 text-slate-body">{a.country}</td>
                    <td className="py-3"><Badge>{a.status.replace(/_/g, " ")}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {data.countries.length > 0 && (
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Country presence</h2>
          <p className="mt-1 text-sm text-slate-body">Markets with at least one Corgania organisation</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.countries.slice(0, 12).map((c) => (
              <div key={c.code} className="rounded-xl border border-line bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: c.role === "buyer" ? "#DC2626" : c.role === "seller" ? "#123B7A" : "#0F766E",
                    }}
                    title={c.role}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-body">{c.continent}</p>
                <p className="mt-2 text-sm text-slate-body">
                  <span className="font-semibold text-brand-blue">{c.sellers}</span> sellers ·{" "}
                  <span className="font-semibold text-brand-red">{c.buyers}</span> buyers
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/65">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-white/70">{hint}</p>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-body">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
