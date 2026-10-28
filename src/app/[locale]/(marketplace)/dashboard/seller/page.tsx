import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { Card, EmptyState } from "@/components/ui/primitives";
import { requireSession } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import type { AppLocale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketplace" });
  return { title: t("sellerDash") };
}

export default async function Page() {
  const locale = (await getLocale()) as AppLocale;
  const t = await getTranslations("marketplace");
  const session = await requireSession();
  if (!session?.canTrade) redirect({ href: "/onboarding/status", locale });
  if (!session!.canSell) redirect({ href: session!.canBuy ? "/dashboard/buyer" : "/marketplace", locale });

  const supabase = await createClient();
  const orgId = session!.orgId;

  const [{ count: productCount }, { count: orderCount }, { data: products }, { data: store }] = await Promise.all([
    orgId && supabase
      ? supabase.from("products").select("id", { count: "exact", head: true }).eq("organization_id", orgId)
      : Promise.resolve({ count: 0 }),
    orgId && supabase
      ? supabase.from("orders").select("id", { count: "exact", head: true }).eq("seller_org_id", orgId)
      : Promise.resolve({ count: 0 }),
    orgId && supabase
      ? supabase
          .from("products")
          .select("id, name, status, slug")
          .eq("organization_id", orgId)
          .order("updated_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
    orgId && supabase
      ? supabase.from("storefronts").select("id, display_name, slug, is_published").eq("organization_id", orgId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-red">{t("sellerWorkspace")}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">{t("sellerDash")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-body">{t("sellerDashIntro")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("statProducts")} value={productCount ?? 0} href="/marketplace/products" />
        <StatCard label={t("statOrders")} value={orderCount ?? 0} href="/dashboard/orders" />
        <StatCard
          label={t("statStorefront")}
          value={store?.is_published ? t("published") : t("unpublished")}
          href="/marketplace/suppliers"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold text-ink">{t("sellerActions")}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <ActionLink href="/marketplace/products" title={t("manageCatalogue")} help={t("manageCatalogueHelp")} />
            <ActionLink href="/marketplace/rfqs" title={t("respondRfqs")} help={t("respondRfqsHelp")} />
            <ActionLink href="/dashboard/orders" title={t("fulfilOrders")} help={t("fulfilOrdersHelp")} />
            <ActionLink href="/dashboard/messages" title={t("messagesTitle")} help={t("sellerMessagesHelp")} />
          </ul>
          {store && (
            <p className="mt-4 rounded-md bg-surface px-3 py-2 text-xs text-slate-body">
              {t("storeStatus")}: <span className="font-semibold text-ink">{store.display_name}</span>
              {" · "}
              {store.is_published ? t("published") : t("unpublished")}
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold text-ink">{t("recentProducts")}</h2>
          {(products ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState title={t("productsEmpty")}>{t("sellerProductEmptyHelp")}</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {(products ?? []).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-slate-body">{p.status}</p>
                  </div>
                  {p.slug ? (
                    <Link href={`/marketplace/products/${p.slug}`} className="shrink-0 font-semibold text-brand-blue hover:underline">
                      {t("view")}
                    </Link>
                  ) : null}
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
