import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { homePathFor, type SessionContext } from "@/lib/auth/guards";
import { canAccessArea, navForRoles, primaryRoleLabel } from "@/lib/auth/roles";

const base: SessionContext = {
  userId: "u1",
  orgId: null,
  canTrade: false,
  isStaff: false,
  roles: [],
  roleLabel: "Staff",
};

describe("homePathFor", () => {
  it("sends staff to admin", () => {
    expect(homePathFor({ ...base, isStaff: true, roles: ["operations"], roleLabel: "Operations" })).toBe("/admin");
  });
  it("sends approved members to marketplace", () => {
    expect(homePathFor({ ...base, orgId: "o1", canTrade: true })).toBe("/marketplace");
  });
  it("sends applicants with an org to status", () => {
    expect(homePathFor({ ...base, orgId: "o1" })).toBe("/onboarding/status");
  });
  it("sends new users to onboarding hub", () => {
    expect(homePathFor(base)).toBe("/onboarding");
  });
  it("prefers staff over membership", () => {
    expect(homePathFor({ ...base, isStaff: true, canTrade: true, orgId: "o1", roles: ["support"], roleLabel: "Support" })).toBe("/admin");
  });
});

describe("role differentiation", () => {
  it("labels roles distinctly", () => {
    expect(primaryRoleLabel(["super_admin"])).toBe("Super admin");
    expect(primaryRoleLabel(["verification_reviewer", "operations"])).toBe("Verify reviewer");
    expect(primaryRoleLabel(["verification_approver", "operations"])).toBe("Verify approver");
  });

  it("hides settings from non-super-admins", () => {
    expect(canAccessArea(["operations"], "settings")).toBe(false);
    expect(canAccessArea(["super_admin"], "settings")).toBe(true);
    expect(canAccessArea(["verification_reviewer"], "finance")).toBe(false);
    expect(canAccessArea(["verification_approver"], "verifications")).toBe(true);
  });

  it("gives reviewers and approvers different nav shapes", () => {
    const reviewer = navForRoles(["verification_reviewer", "operations"]).map((l) => l.href);
    const approver = navForRoles(["verification_approver", "operations"]).map((l) => l.href);
    const admin = navForRoles(["super_admin"]).map((l) => l.href);
    expect(reviewer).toContain("/admin/verifications");
    expect(approver).toContain("/admin/verifications");
    expect(reviewer).not.toContain("/admin/settings");
    expect(approver).not.toContain("/admin/settings");
    expect(admin).toContain("/admin/settings");
    expect(admin.length).toBeGreaterThan(reviewer.length);
  });
});
