/** Platform role hierarchy and admin area permissions. */

export const PLATFORM_ROLES = [
  "super_admin",
  "operations",
  "verification_reviewer",
  "verification_approver",
  "finance",
  "content_editor",
  "support",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export type AdminArea =
  | "overview"
  | "members"
  | "applications"
  | "verifications"
  | "inspections"
  | "stores"
  | "products"
  | "rfqs"
  | "orders"
  | "trade-services"
  | "finance"
  | "insights"
  | "analytics"
  | "settings";

/** Which roles may open each admin area. super_admin always implied via hasAccess. */
export const AREA_ROLES: Record<AdminArea, readonly PlatformRole[]> = {
  overview: ["super_admin", "operations", "verification_reviewer", "verification_approver", "finance", "content_editor", "support"],
  members: ["super_admin", "operations", "verification_approver", "support"],
  applications: ["super_admin", "operations", "verification_reviewer", "verification_approver", "support"],
  verifications: ["super_admin", "verification_reviewer", "verification_approver", "operations"],
  inspections: ["super_admin", "verification_reviewer", "verification_approver", "operations"],
  stores: ["super_admin", "operations"],
  products: ["super_admin", "operations"],
  rfqs: ["super_admin", "operations"],
  orders: ["super_admin", "operations"],
  "trade-services": ["super_admin", "operations", "verification_reviewer"],
  finance: ["super_admin", "finance"],
  insights: ["super_admin", "content_editor"],
  analytics: ["super_admin", "operations", "finance"],
  settings: ["super_admin"],
};

export const ADMIN_NAV: { href: string; label: string; area: AdminArea }[] = [
  { href: "/admin", label: "Overview", area: "overview" },
  { href: "/admin/members", label: "Members", area: "members" },
  { href: "/admin/applications", label: "Applications", area: "applications" },
  { href: "/admin/verifications", label: "Verifications", area: "verifications" },
  { href: "/admin/inspections", label: "Inspections", area: "inspections" },
  { href: "/admin/stores", label: "Stores", area: "stores" },
  { href: "/admin/products", label: "Products", area: "products" },
  { href: "/admin/rfqs", label: "RFQs", area: "rfqs" },
  { href: "/admin/orders", label: "Orders", area: "orders" },
  { href: "/admin/trade-services", label: "Trade Services", area: "trade-services" },
  { href: "/admin/finance", label: "Finance", area: "finance" },
  { href: "/admin/insights", label: "Insights CMS", area: "insights" },
  { href: "/admin/analytics", label: "Analytics", area: "analytics" },
  { href: "/admin/settings", label: "Settings", area: "settings" },
];

export function hasRole(roles: readonly string[], role: PlatformRole): boolean {
  return roles.includes("super_admin") || roles.includes(role);
}

export function hasAnyRole(roles: readonly string[], needed: readonly PlatformRole[]): boolean {
  if (roles.includes("super_admin")) return true;
  return needed.some((r) => roles.includes(r));
}

export function canAccessArea(roles: readonly string[], area: AdminArea): boolean {
  return hasAnyRole(roles, AREA_ROLES[area]);
}

export function navForRoles(roles: readonly string[]) {
  return ADMIN_NAV.filter((item) => canAccessArea(roles, item.area));
}

export function primaryRoleLabel(roles: readonly string[]): string {
  if (roles.includes("super_admin")) return "Super admin";
  if (roles.includes("verification_approver")) return "Verify approver";
  if (roles.includes("verification_reviewer")) return "Verify reviewer";
  if (roles.includes("operations")) return "Operations";
  if (roles.includes("finance")) return "Finance";
  if (roles.includes("content_editor")) return "Content editor";
  if (roles.includes("support")) return "Support";
  return "Staff";
}

/** Capability checks used by Server Actions. */
export const can = {
  manageMembers: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "operations", "verification_approver"]),
  reviewVerification: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "verification_reviewer"]),
  approveVerification: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "verification_approver"]),
  moderateMarketplace: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "operations"]),
  manageFinance: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "finance"]),
  manageCms: (roles: readonly string[]) => hasAnyRole(roles, ["super_admin", "content_editor"]),
  manageStaff: (roles: readonly string[]) => hasRole(roles, "super_admin"),
};
