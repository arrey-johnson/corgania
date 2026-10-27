import { COUNTRY_CONTINENT, COUNTRY_NAME } from "@/lib/geo/world-meta";
import { createClient } from "@/lib/supabase/server";

export type CountryPresence = {
  code: string;
  name: string;
  continent: string;
  buyers: number;
  sellers: number;
  both: number;
  total: number;
  role: "buyer" | "seller" | "both" | "none";
};

export type AdminDashboardData = {
  totals: {
    organisations: number;
    buyers: number;
    sellers: number;
    both: number;
    applications: number;
    openVerifications: number;
    inspections: number;
    approved: number;
    pending: number;
  };
  statusBreakdown: { status: string; count: number }[];
  kindBreakdown: { kind: string; count: number }[];
  monthlyOrgs: { month: string; organisations: number; applications: number }[];
  countries: CountryPresence[];
  continents: { continent: string; buyers: number; sellers: number; organisations: number }[];
  recentApplications: {
    id: string;
    kind: string;
    status: string;
    submitted_at: string | null;
    orgName: string;
    country: string;
  }[];
  pipeline: { stage: string; count: number }[];
};

function emptyDashboard(): AdminDashboardData {
  return {
    totals: {
      organisations: 0, buyers: 0, sellers: 0, both: 0,
      applications: 0, openVerifications: 0, inspections: 0, approved: 0, pending: 0,
    },
    statusBreakdown: [],
    kindBreakdown: [],
    monthlyOrgs: [],
    countries: [],
    continents: [],
    recentApplications: [],
    pipeline: [
      { stage: "Submitted", count: 0 },
      { stage: "Under review", count: 0 },
      { stage: "Verification", count: 0 },
      { stage: "Approved", count: 0 },
      { stage: "Rejected", count: 0 },
    ],
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  if (!supabase) return emptyDashboard();

  const [
    { data: orgs },
    { data: apps },
    { data: cases },
    { count: inspectionCount },
  ] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, legal_name, registration_country, can_buy, can_sell, membership_status, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("membership_applications")
      .select("id, kind, status, submitted_at, created_at, organization_id, organizations(legal_name, registration_country)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabase.from("verification_cases").select("id, status"),
    supabase.from("inspections").select("id", { count: "exact", head: true }),
  ]);

  const orgRows = orgs ?? [];
  const appRows = apps ?? [];
  const caseRows = cases ?? [];

  const byCountry = new Map<string, { buyers: number; sellers: number; both: number }>();
  let buyers = 0, sellers = 0, both = 0, approved = 0, pending = 0;

  for (const o of orgRows) {
    const buy = Boolean(o.can_buy);
    const sell = Boolean(o.can_sell);
    if (buy && sell) both += 1;
    else if (buy) buyers += 1;
    else if (sell) sellers += 1;
    if (o.membership_status === "approved") approved += 1;
    else if (!["rejected", "expired", "suspended"].includes(o.membership_status)) pending += 1;

    const code = String(o.registration_country || "").toUpperCase();
    if (code.length === 2) {
      const cur = byCountry.get(code) ?? { buyers: 0, sellers: 0, both: 0 };
      if (buy && sell) cur.both += 1;
      else if (buy) cur.buyers += 1;
      else if (sell) cur.sellers += 1;
      byCountry.set(code, cur);
    }
  }

  const countries: CountryPresence[] = [...byCountry.entries()].map(([code, c]) => {
    const total = c.buyers + c.sellers + c.both;
    let role: CountryPresence["role"] = "none";
    if (c.both > 0 || (c.buyers > 0 && c.sellers > 0)) role = "both";
    else if (c.buyers > 0) role = "buyer";
    else if (c.sellers > 0) role = "seller";
    return {
      code,
      name: COUNTRY_NAME[code] ?? code,
      continent: COUNTRY_CONTINENT[code] ?? "Unknown",
      buyers: c.buyers + c.both,
      sellers: c.sellers + c.both,
      both: c.both,
      total,
      role,
    };
  }).sort((a, b) => b.total - a.total);

  const continentMap = new Map<string, { buyers: number; sellers: number; organisations: number }>();
  for (const c of countries) {
    const cur = continentMap.get(c.continent) ?? { buyers: 0, sellers: 0, organisations: 0 };
    cur.buyers += c.buyers;
    cur.sellers += c.sellers;
    cur.organisations += c.total;
    continentMap.set(c.continent, cur);
  }
  const continents = [...continentMap.entries()]
    .map(([continent, v]) => ({ continent, ...v }))
    .sort((a, b) => b.organisations - a.organisations);

  const statusMap = new Map<string, number>();
  for (const o of orgRows) statusMap.set(o.membership_status, (statusMap.get(o.membership_status) ?? 0) + 1);
  const statusBreakdown = [...statusMap.entries()].map(([status, count]) => ({ status, count }));

  const kindMap = new Map<string, number>();
  for (const a of appRows) kindMap.set(a.kind, (kindMap.get(a.kind) ?? 0) + 1);
  const kindBreakdown = [...kindMap.entries()].map(([kind, count]) => ({ kind, count }));

  const monthKey = (iso: string) => {
    const d = new Date(iso);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  };
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    months.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  const monthlyOrgs = months.map((month) => ({
    month,
    organisations: orgRows.filter((o) => monthKey(o.created_at) === month).length,
    applications: appRows.filter((a) => monthKey(a.created_at) === month).length,
  }));

  const pipeline = [
    { stage: "Submitted", count: orgRows.filter((o) => o.membership_status === "submitted").length },
    { stage: "Under review", count: orgRows.filter((o) => o.membership_status === "under_review" || o.membership_status === "info_required").length },
    { stage: "Verification", count: orgRows.filter((o) => o.membership_status === "verification_in_progress").length },
    { stage: "Approved", count: approved },
    { stage: "Rejected", count: orgRows.filter((o) => o.membership_status === "rejected").length },
  ];

  const recentApplications = appRows.slice(0, 8).map((a) => {
    const org = Array.isArray(a.organizations) ? a.organizations[0] : a.organizations;
    return {
      id: a.id,
      kind: a.kind,
      status: a.status,
      submitted_at: a.submitted_at,
      orgName: org?.legal_name ?? "Organisation",
      country: org?.registration_country ?? "—",
    };
  });

  return {
    totals: {
      organisations: orgRows.length,
      buyers,
      sellers,
      both,
      applications: appRows.length,
      openVerifications: caseRows.filter((c) => !["approved", "rejected", "expired"].includes(c.status)).length,
      inspections: inspectionCount ?? 0,
      approved,
      pending,
    },
    statusBreakdown,
    kindBreakdown,
    monthlyOrgs,
    countries,
    continents,
    recentApplications,
    pipeline,
  };
}
