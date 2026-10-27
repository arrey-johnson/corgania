import { createClient } from "@/lib/supabase/server";
export type Article = { slug: string; title: string; excerpt: string; published_at: string | null; category?: { name: string } | null };
/** DB-backed CMS reads. Returns [] (honest empty state) when Supabase isn't configured or no articles are published. */
export async function listPublishedArticles(limit = 6): Promise<Article[]> {
  const supabase = await createClient(); if (!supabase) return [];
  const { data, error } = await supabase.from("articles")
    .select("slug,title,excerpt,published_at, category:article_categories(name)")
    .eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  if (error) { console.error("[articles]", error.message); return []; }
  return (data ?? []) as unknown as Article[];
}
export async function getArticle(slug: string) {
  const supabase = await createClient(); if (!supabase) return null;
  const { data } = await supabase.from("articles").select("*, category:article_categories(name)").eq("slug", slug).eq("status", "published").maybeSingle();
  return data;
}
