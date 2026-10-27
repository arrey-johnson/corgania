import { ProductStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Products" };

export default async function Page() {
  await requireAdminArea("products");
  const supabase = await createClient();
  const { data: products } = supabase
    ? await supabase
        .from("products")
        .select("id, name, slug, status, country_of_origin, unit, moq, pricing_mode, currency, organization_id, organizations(legal_name), updated_at")
        .order("updated_at", { ascending: false })
        .limit(300)
    : { data: [] };

  const rows = products ?? [];
  const byStatus = (s: string) => rows.filter((p) => p.status === s).length;

  return (
    <div>
      <AdminHeader
        title="Product moderation"
        description="Approve, reject or archive catalogue listings. Products of suspended sellers are untradeable via RLS even if still approved."
      />
      <AdminStatRow items={[
        { label: "Products", value: rows.length },
        { label: "Approved", value: byStatus("approved") },
        { label: "Pending review", value: byStatus("pending_review") },
        { label: "Rejected / archived", value: byStatus("rejected") + byStatus("archived") },
      ]} />
      <AdminTable
        headers={["Product", "Seller", "Origin", "Pricing", "Status", "Actions"]}
        empty={rows.length === 0 ? "No products yet." : undefined}
      >
        {rows.map((p) => {
          const org = Array.isArray(p.organizations) ? p.organizations[0] : p.organizations;
          return (
            <tr key={p.id} className="border-b border-line last:border-0 align-top">
              <td className="px-4 py-3">
                <p className="font-medium text-ink">{p.name}</p>
                <p className="text-xs text-slate-body">{p.slug}</p>
              </td>
              <td className="px-4 py-3">{org?.legal_name ?? "—"}</td>
              <td className="px-4 py-3">{p.country_of_origin}</td>
              <td className="px-4 py-3 text-slate-body">
                {p.pricing_mode} · MOQ {p.moq} {p.unit} · {p.currency}
              </td>
              <td className="px-4 py-3"><Badge>{p.status.replace(/_/g, " ")}</Badge></td>
              <td className="px-4 py-3"><ProductStatusForm productId={p.id} current={p.status} /></td>
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
