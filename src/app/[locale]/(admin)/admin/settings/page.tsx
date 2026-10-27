import { GrantRoleForm, RevokeRoleForm } from "@/components/admin/ops-forms";
import { AdminHeader, AdminStatRow } from "@/components/admin/admin-ui";
import { PasswordChangeForm } from "@/components/auth/password-change-form";
import { Badge, Card } from "@/components/ui/primitives";
import { Link } from "@/i18n/navigation";
import { requireAdminArea } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Admin — Settings" };

export default async function Page() {
  await requireAdminArea("settings");
  const a = await getTranslations("account");
  const admin = createServiceClient();
  const supabase = await createClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  const { data: roles } = admin
    ? await admin.from("platform_roles").select("user_id, role, created_at, profiles(full_name, email)").order("created_at", { ascending: false })
    : supabase
      ? await supabase.from("platform_roles").select("user_id, role, created_at, profiles(full_name, email)").order("created_at", { ascending: false })
      : { data: [] };

  const { data: plans } = admin
    ? await admin.from("subscription_plans").select("id, name, is_active")
    : { data: [] };

  const { count: auditCount } = admin
    ? await admin.from("audit_logs").select("id", { count: "exact", head: true })
    : { count: 0 };

  const roleRows = roles ?? [];
  const uniqueStaff = new Set(roleRows.map((r) => r.user_id)).size;

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Platform settings"
        description="Staff roles, environment status and subscription plan inventory. Grant roles carefully — reviewer and approver must remain different people."
      />
      <AdminStatRow items={[
        { label: "Staff users", value: uniqueStaff },
        { label: "Role grants", value: roleRows.length },
        { label: "Plans", value: (plans ?? []).length },
        { label: "Audit events", value: auditCount ?? 0 },
      ]} />

      <Card className="p-5">
        <h2 className="font-display text-xl font-semibold">{a("yourAccount")}</h2>
        <p className="mt-1 text-sm text-slate-body">{a("changePasswordHint")}</p>
        {user?.email && (
          <p className="mt-2 text-sm text-slate-body">
            {a("signedInAs")} <span className="font-medium text-ink">{user.email}</span>
          </p>
        )}
        <div className="mt-4 max-w-md">
          <PasswordChangeForm mode="change" email={user?.email} />
        </div>
        <p className="mt-3 text-xs text-slate-body">
          <Link href="/account/security" className="font-medium text-brand-blue hover:underline">
            {a("securityTitle")}
          </Link>
        </p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Grant staff role</h2>
          <p className="mt-1 text-sm text-slate-body">Looks up an existing auth user by email and attaches a platform role.</p>
          <div className="mt-4"><GrantRoleForm /></div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-xl font-semibold">Environment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-line pb-2">
              <dt className="text-slate-body">Site URL</dt>
              <dd className="font-medium text-ink">{env.siteUrl}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line pb-2">
              <dt className="text-slate-body">Supabase project</dt>
              <dd className="font-medium text-ink">{env.supabaseUrl ? new URL(env.supabaseUrl).hostname.split(".")[0] : "not configured"}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line pb-2">
              <dt className="text-slate-body">Service role</dt>
              <dd className="font-medium text-ink">{admin ? "available" : "missing"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-body">Active plans</dt>
              <dd className="font-medium text-ink">{(plans ?? []).filter((p) => p.is_active).length}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-slate-body">Manage plan pricing under Finance. Rotate the service-role key if it was ever shared outside a secure channel.</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-xl font-semibold">Staff role directory</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-slate-body">
              <tr>
                <th className="py-2 pr-3">Person</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Granted</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roleRows.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-body">No platform roles found.</td></tr>
              )}
              {roleRows.map((r) => {
                const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
                return (
                  <tr key={`${r.user_id}-${r.role}`} className="border-b border-line last:border-0 align-middle">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-ink">{profile?.full_name || profile?.email || r.user_id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-body">{profile?.email}</p>
                    </td>
                    <td className="py-3 pr-3"><Badge>{r.role}</Badge></td>
                    <td className="py-3 pr-3 text-slate-body">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3"><RevokeRoleForm userId={r.user_id} role={r.role} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
