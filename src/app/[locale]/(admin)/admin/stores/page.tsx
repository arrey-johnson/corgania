import { StorefrontPublishForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Stores" };

export default async function Page() {
  await requireAdminArea("stores");
  const supabase = await createClient();
  const { data: stores } = supabase
    ? await supabase
        .from("storefronts")
        .select("id, slug, display_name, country, city, industry, is_published, organization_id, organizations(legal_name, membership_status), updated_at")
        .order("updated_at", { ascending: false })
        .limit(200)
    : { data: [] };

  const rows = stores ?? [];
  const published = rows.filter((s) => s.is_published).length;

  return (
    <div>
      <AdminHeader
        title="Seller storefronts"
        description="Moderate publication. Unpublished or suspended-seller storefronts stay hidden from the public marketplace via RLS."
      />
      <AdminStatRow items={[
        { label: "Storefronts", value: rows.length },
        { label: "Published", value: published },
        { label: "Hidden", value: rows.length - published },
        { label: "Countries", value: new Set(rows.map((s) => s.country)).size },
      ]} />
      <AdminTable
        headers={["Store", "Organisation", "Location", "Status", "Actions"]}
        empty={rows.length === 0 ? "No storefronts yet. Sellers create them after membership approval." : undefined}
      >
        {rows.map((s) => {
          const org = Array.isArray(s.organizations) ? s.organizations[0] : s.organizations;
          return (
            <tr key={s.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{s.display_name}</p>
                <p className="text-xs text-slate-body">/{s.slug}</p>
              </td>
              <td className="px-4 py-3">
                <p>{org?.legal_name ?? "—"}</p>
                {org?.membership_status && <Badge className="mt-1">{org.membership_status.replace(/_/g, " ")}</Badge>}
              </td>
              <td className="px-4 py-3 text-slate-body">{[s.city, s.country].filter(Boolean).join(", ")}{s.industry ? ` · ${s.industry}` : ""}</td>
              <td className="px-4 py-3"><Badge className={s.is_published ? "bg-emerald-50 text-emerald-800" : ""}>{s.is_published ? "published" : "unpublished"}</Badge></td>
              <td className="px-4 py-3"><StorefrontPublishForm storefrontId={s.id} isPublished={s.is_published} /></td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
