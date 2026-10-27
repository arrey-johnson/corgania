/**
 * Apply everything we can against the remote Supabase project using the service role:
 * - seed Founder's + Standard Annual plans
 * - ensure known staff platform_roles
 * - probe schema / report gaps
 *
 * Usage: node --env-file=.env.local scripts/supabase-sync.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PLANS = [
  {
    slug: "founders",
    name: "Founder's Plan",
    price: 0,
    currency: "USD",
    billing_period: "annual",
    is_active: true,
    features: {
      freeDays: 180,
      convertsTo: "standard_annual",
      enrollmentEnds: "2027-10-25",
      badge: "Founding Member",
      intents: ["seller", "buyer", "both"],
      summary:
        "Six months free after Corgania Verify approval during the founding window; then Standard Annual at USD 599/year.",
    },
  },
  {
    slug: "standard_annual",
    name: "Standard Annual",
    price: 599,
    currency: "USD",
    billing_period: "annual",
    is_active: true,
    features: {
      intents: ["seller", "buyer", "both"],
      summary: "USD 599 per organisation per year — seller, buyer, or both.",
    },
  },
];

/** Email → roles (from Corgania staff setup). */
const STAFF = [
  { email: "support@", match: (e) => e.startsWith("support@"), roles: ["super_admin"] },
  {
    email: "johnson@",
    match: (e) => e.startsWith("johnson@"),
    roles: ["verification_reviewer", "operations"],
  },
  {
    email: "lifanje@",
    match: (e) => e.startsWith("lifanje@"),
    roles: ["verification_approver", "operations"],
  },
];

const TABLES = [
  "profiles",
  "organizations",
  "organization_members",
  "platform_roles",
  "membership_applications",
  "verification_cases",
  "subscription_plans",
  "subscriptions",
  "invoices",
  "articles",
  "storefronts",
  "products",
  "orders",
];

async function upsertPlans() {
  console.log("\n== Membership plans ==");
  for (const plan of PLANS) {
    const { data, error } = await admin
      .from("subscription_plans")
      .upsert(plan, { onConflict: "slug" })
      .select("id, slug, name, price")
      .single();
    if (error) {
      console.error("  FAIL", plan.slug, error.message);
    } else {
      console.log(`  OK ${data.slug} — ${data.name} @ ${data.price} USD (${data.id})`);
    }
  }
}

async function ensureStaffRoles() {
  console.log("\n== Staff roles ==");
  const { data: listed, error } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    console.error("  FAIL listUsers", error.message);
    return;
  }
  const users = listed?.users ?? [];
  console.log(`  Auth users found: ${users.length}`);

  for (const rule of STAFF) {
    const user = users.find((u) => rule.match((u.email ?? "").toLowerCase()));
    if (!user) {
      console.warn(`  SKIP ${rule.email}* — no matching auth user`);
      continue;
    }
    for (const role of rule.roles) {
      const { error: roleErr } = await admin.from("platform_roles").upsert(
        { user_id: user.id, role },
        { onConflict: "user_id,role" },
      );
      // Some schemas use unique(user_id, role) — if upsert conflict target differs, try insert ignore
      if (roleErr) {
        const { error: insErr } = await admin.from("platform_roles").insert({ user_id: user.id, role });
        if (insErr && !/duplicate|unique/i.test(insErr.message)) {
          console.error(`  FAIL ${user.email} → ${role}:`, roleErr.message, "/", insErr.message);
          continue;
        }
      }
      console.log(`  OK ${user.email} → ${role}`);
    }
  }
}

async function probeTables() {
  console.log("\n== Schema probe ==");
  const missing = [];
  for (const table of TABLES) {
    const { error, count } = await admin.from(table).select("*", { count: "exact", head: true });
    if (error) {
      console.error(`  MISSING/ERROR ${table}: ${error.message}`);
      missing.push(table);
    } else {
      console.log(`  OK ${table} (rows≈${count ?? "?"})`);
    }
  }
  return missing;
}

async function listPlans() {
  const { data } = await admin.from("subscription_plans").select("slug, name, price, is_active").order("price");
  console.log("\n== Plans in DB ==");
  for (const p of data ?? []) {
    console.log(`  ${p.slug}: ${p.name} — ${p.price} (${p.is_active ? "active" : "inactive"})`);
  }
}

async function main() {
  console.log("Supabase sync →", url);
  const missing = await probeTables();
  if (missing.includes("subscription_plans")) {
    console.error("\nCannot seed plans — run supabase/apply_all.sql (or migrations 0001–0006) in the SQL Editor first.");
    process.exit(1);
  }
  await upsertPlans();
  await ensureStaffRoles();
  await listPlans();
  console.log("\nDone.");
  if (missing.length) {
    console.log("\nTables with errors (may need SQL Editor migrations):", missing.join(", "));
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
