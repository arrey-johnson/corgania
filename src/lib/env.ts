/** Central env access. Supabase is optional for the public site; private features require it. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
