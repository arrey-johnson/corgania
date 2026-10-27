export const MEMBERSHIP_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "info_required",
  "verification_in_progress",
  "approved",
  "rejected",
  "suspended",
  "expired",
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** Reference taxonomies (not statistics). Names/blurbs live in messages under `categories`. */
export const PRODUCT_CATEGORIES = [
  { slug: "cocoa-coffee-tea" },
  { slug: "grains-cereals" },
  { slug: "oilseeds-edible-oils" },
  { slug: "fruits-vegetables" },
  { slug: "spices-ingredients" },
  { slug: "timber-wood" },
  { slug: "textiles-cotton" },
  { slug: "minerals-metals" },
] as const;

export type ProductCategorySlug = (typeof PRODUCT_CATEGORIES)[number]["slug"];

export const LAUNCH_MARKET = { code: "CM" } as const;

/** Buyer region keys — labels live in messages under `regions`. */
export const TARGET_REGION_KEYS = ["europe", "northAmerica", "asia", "middleEast"] as const;
export type TargetRegionKey = (typeof TARGET_REGION_KEYS)[number];

/** @deprecated Prefer TARGET_REGION_KEYS + i18n. Kept for any residual English joins. */
export const TARGET_REGIONS = ["Europe", "North America", "Asia", "Middle East"] as const;
