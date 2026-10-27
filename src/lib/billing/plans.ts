/** Corgania membership commercial model (Year 1). */

export const PLAN_SLUGS = {
  founders: "founders",
  standardAnnual: "standard_annual",
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

/** USD 599 / year for seller, buyer, or both — one organisation fee. */
export const STANDARD_ANNUAL_PRICE_USD = 599;

/** Founder's Plan: free trading access for this many days after approval. */
export const FOUNDERS_FREE_DAYS = 180;

/**
 * Organisations approved on or before this date (UTC) receive Founder's Plan.
 * Override with FOUNDERS_ENROLLMENT_ENDS (ISO date) in env.
 * Default: 12 months from Corgania public launch window (2026-10-25).
 */
export const DEFAULT_FOUNDERS_ENROLLMENT_ENDS = "2027-10-25";

export function foundersEnrollmentEndsAt(): Date {
  const raw = (process.env.FOUNDERS_ENROLLMENT_ENDS ?? DEFAULT_FOUNDERS_ENROLLMENT_ENDS).trim();
  const d = new Date(raw.includes("T") ? raw : `${raw}T23:59:59.000Z`);
  return Number.isNaN(d.getTime()) ? new Date(`${DEFAULT_FOUNDERS_ENROLLMENT_ENDS}T23:59:59.000Z`) : d;
}

export function isWithinFoundersEnrollment(at: Date = new Date()): boolean {
  return at.getTime() <= foundersEnrollmentEndsAt().getTime();
}

export function addDays(from: Date, days: number): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addYears(from: Date, years: number): Date {
  const d = new Date(from);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}

export type MembershipGrant = {
  planSlug: PlanSlug;
  membershipExpiresAt: string;
  subscriptionPeriodEnd: string;
  invoiceAmount: number;
  label: string;
};

/** Decide plan + expiry when an organisation is approved. */
export function grantForApproval(approvedAt: Date = new Date()): MembershipGrant {
  if (isWithinFoundersEnrollment(approvedAt)) {
    const ends = addDays(approvedAt, FOUNDERS_FREE_DAYS);
    return {
      planSlug: PLAN_SLUGS.founders,
      membershipExpiresAt: ends.toISOString(),
      subscriptionPeriodEnd: ends.toISOString(),
      invoiceAmount: 0,
      label: "Founder's Plan (6 months free)",
    };
  }
  const ends = addYears(approvedAt, 1);
  return {
    planSlug: PLAN_SLUGS.standardAnnual,
    membershipExpiresAt: ends.toISOString(),
    subscriptionPeriodEnd: ends.toISOString(),
    invoiceAmount: STANDARD_ANNUAL_PRICE_USD,
    label: "Standard Annual (USD 599)",
  };
}

export const PLAN_CATALOG = [
  {
    slug: PLAN_SLUGS.founders,
    name: "Founder's Plan",
    price: 0,
    currency: "USD" as const,
    billing_period: "annual" as const,
    features: {
      freeDays: FOUNDERS_FREE_DAYS,
      convertsTo: PLAN_SLUGS.standardAnnual,
      enrollmentEnds: DEFAULT_FOUNDERS_ENROLLMENT_ENDS,
      badge: "Founding Member",
      intents: ["seller", "buyer", "both"],
      summary: "Six months free after Corgania Verify approval for organisations approved during the founding window; then Standard Annual at USD 599/year.",
    },
  },
  {
    slug: PLAN_SLUGS.standardAnnual,
    name: "Standard Annual",
    price: STANDARD_ANNUAL_PRICE_USD,
    currency: "USD" as const,
    billing_period: "annual" as const,
    features: {
      intents: ["seller", "buyer", "both"],
      summary: "USD 599 per organisation per year — seller, buyer, or both.",
    },
  },
] as const;
