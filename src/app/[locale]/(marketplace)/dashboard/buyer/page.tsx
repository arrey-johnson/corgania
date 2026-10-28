import { getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { Card, EmptyState } from "@/components/ui/primitives";
import { requireSession } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("buyerDash") };
}

export default async function Page() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("marketplace");
  const session = await requireSession();
  if (!session?.canTrade) redirect({ href: "/onboarding/status", locale });
  if (!session!.canBuy) redirect({ href: session!.canSell ? "/dashboard/seller" : "/marketplace", locale });

  const supabase = await createClient();
  const orgId = session!.orgId;

  const [{ count: rfqCount }, { count: orderCount }, { data: recentRfqs }] = await Promise.all([
    orgId && supabase
      ? supabase.from("rfqs").select("id", { count: "exact", head: true }).eq("buyer_org_id", orgId)
      : Promise.resolve({ count: 0 }),
    orgId && supabase
      ? supabase.from("orders").select("id", { count: "exact", head: true }).eq("buyer_org_id", orgId)
      : Promise.resolve({ count: 0 }),
    orgId && supabase
      ? supabase
          .from("rfqs")
          .select("id, product_name, status, created_at")
          .eq("buyer_org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">{t("buyerWorkspace")}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{t("buyerDash")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-body">{t("buyerDashIntro")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("statOpenRfqs")} value={rfqCount ?? 0} href="/marketplace/rfqs" />
        <StatCard label={t("statOrders")} value={orderCount ?? 0} href="/dashboard/orders" />
        <StatCard label={t("statSuppliers")} value="—" href="/marketplace/suppliers" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold text-ink">{t("buyerActions")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <ActionLink href="/marketplace/products" title={t("browseProducts")} help={t("browseProductsHelp")} />
            <ActionLink href="/marketplace/rfqs" title={t("rfqTitle")} help={t("rfqHelp")} />
            <ActionLink href="/dashboard/messages" title={t("messagesTitle")} help={t("buyerMessagesHelp")} />
            <ActionLink href="/dashboard/orders" title={t("ordersTitle")} help={t("buyerOrdersHelp")} />
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold text-ink">{t("recentRfqs")}</h2>
          {(recentRfqs ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState title={t("rfqsEmpty")}>{t("buyerRfqEmptyHelp")}</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {(recentRfqs ?? []).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{r.product_name}</p>
                    <p className="text-xs text-slate-body">{r.status}</p>
                  </div>
                  <Link href={`/marketplace/rfqs/${r.id}`} className="shrink-0 font-semibold text-brand-blue hover:underline">
                    {t("view")}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-line bg-white p-4 shadow-[0_1px_3px_rgba(18,59,122,0.06)] transition hover:border-brand-blue">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-body">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
    </Link>
  );
}

function ActionLink({ href, title, help }: { href: string; title: string; help: string }) {
  return (
    <li>
      <Link href={href} className="block rounded-lg px-3 py-2.5 hover:bg-surface">
        <p className="font-semibold text-brand-blue">{title}</p>
        <p className="text-xs text-slate-body">{help}</p>
      </Link>
    </li>
  );
}
