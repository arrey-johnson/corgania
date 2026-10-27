/**
 * One-shot: set password for every user with a platform_roles row.
 * Usage: node --env-file=.env.local scripts/reset-staff-passwords.mjs
 *
 * Pass NEW_PASSWORD via env (required). Does not print the password.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const newPassword = process.env.NEW_PASSWORD;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!newPassword || newPassword.length < 8) {
  console.error("Set NEW_PASSWORD (min 8 chars)");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: roleRows, error: roleErr } = await admin.from("platform_roles").select("user_id, role");
if (roleErr) {
  console.error("platform_roles:", roleErr.message);
  process.exit(1);
}

const byUser = new Map();
for (const row of roleRows ?? []) {
  const list = byUser.get(row.user_id) ?? [];
  list.push(row.role);
  byUser.set(row.user_id, list);
}

if (byUser.size === 0) {
  console.log("No staff users found in platform_roles.");
  process.exit(0);
}

const { data: listed, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
if (listErr) {
  console.error("listUsers:", listErr.message);
  process.exit(1);
}

const users = listed?.users ?? [];
let ok = 0;
let fail = 0;

for (const [userId, roles] of byUser) {
  const user = users.find((u) => u.id === userId);
  const email = user?.email ?? userId;
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) {
    console.error(`FAIL ${email} (${roles.join(", ")}): ${error.message}`);
    fail += 1;
  } else {
    console.log(`OK   ${email} (${roles.join(", ")})`);
    ok += 1;
  }
}

console.log(`\nDone. Updated ${ok}, failed ${fail}.`);
if (fail) process.exit(1);
