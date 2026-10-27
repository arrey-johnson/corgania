import { ArticleCreateForm, ArticleStatusForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow, AdminTable } from "@/components/admin/admin-ui";
import { Badge, Card } from "@/components/ui/primitives";
import { requireAdminArea } from "@/lib/auth/guards";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin — Insights CMS" };

export default async function Page() {
  await requireAdminArea("insights");
  const db = createServiceClient() ?? await createClient();
  const [{ data: articles }, { data: categories }] = db
    ? await Promise.all([
        db
          .from("articles")
          .select("id, slug, title, status, published_at, updated_at, excerpt, article_categories(name)")
          .order("updated_at", { ascending: false })
          .limit(100),
        db.from("article_categories").select("id, name, slug").order("name"),
      ])
    : [{ data: [] }, { data: [] }];

  const rows = articles ?? [];

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Insights CMS"
        description="Draft, publish and archive Corgania Insights articles. Published pieces appear on the public site."
      />
      <AdminStatRow items={[
        { label: "Articles", value: rows.length },
        { label: "Published", value: rows.filter((a) => a.status === "published").length },
        { label: "Drafts", value: rows.filter((a) => a.status === "draft").length },
        { label: "Categories", value: (categories ?? []).length },
      ]} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">New article</h2>
          <p className="mt-1 text-sm text-slate-body">Creates a CMS entry immediately.</p>
          <div className="mt-4"><ArticleCreateForm /></div>
          {(categories ?? []).length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-body">Categories</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-body">
                {(categories ?? []).map((c) => <li key={c.id}>{c.name} <span className="text-xs">/{c.slug}</span></li>)}
              </ul>
            </div>
          )}
        </Card>

        <div className="lg:col-span-3">
          <AdminTable
            headers={["Article", "Category", "Status", "Updated", "Actions"]}
            empty={rows.length === 0 ? "No articles yet — create the first one." : undefined}
          >
            {rows.map((a) => {
              const cat = Array.isArray(a.article_categories) ? a.article_categories[0] : a.article_categories;
              return (
                <tr key={a.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{a.title}</p>
                    <p className="text-xs text-slate-body">/{a.slug}</p>
                    {a.excerpt && <p className="mt-1 line-clamp-2 text-xs text-slate-body">{a.excerpt}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-body">{cat?.name ?? "—"}</td>
                  <td className="px-4 py-3"><Badge>{a.status}</Badge></td>
                  <td className="px-4 py-3 text-slate-body">{new Date(a.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3"><ArticleStatusForm articleId={a.id} current={a.status} /></td>
                </tr>
              );
            })}
          </AdminTable>
        </div>
      </div>
    </div>
  );
}
