import { describe, expect, it } from "vitest";
import {
  FOUNDERS_FREE_DAYS,
  STANDARD_ANNUAL_PRICE_USD,
  grantForApproval,
  isWithinFoundersEnrollment,
  PLAN_SLUGS,
} from "@/lib/billing/plans";

describe("membership plans", () => {
  it("prices Standard Annual at USD 599", () => {
    expect(STANDARD_ANNUAL_PRICE_USD).toBe(599);
  });

  it("grants Founder's Plan with 180 free days during enrollment window", () => {
    const at = new Date("2026-11-01T12:00:00.000Z");
    expect(isWithinFoundersEnrollment(at)).toBe(true);
    const grant = grantForApproval(at);
    expect(grant.planSlug).toBe(PLAN_SLUGS.founders);
    expect(grant.invoiceAmount).toBe(0);
    const start = at.getTime();
    const end = new Date(grant.membershipExpiresAt).getTime();
    const days = Math.round((end - start) / (24 * 60 * 60 * 1000));
    expect(days).toBe(FOUNDERS_FREE_DAYS);
  });

  it("grants Standard Annual after founding enrollment ends", () => {
    const at = new Date("2028-01-15T12:00:00.000Z");
    expect(isWithinFoundersEnrollment(at)).toBe(false);
    const grant = grantForApproval(at);
    expect(grant.planSlug).toBe(PLAN_SLUGS.standardAnnual);
    expect(grant.invoiceAmount).toBe(599);
  });
});
