import type { MetadataRoute } from "next";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { locales } from "@/i18n/routing";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/markets",
    "/markets/cm",
    "/commodities",
    "/products",
    "/insights",
    "/trade-opportunities",
    "/how-it-works",
    "/membership",
    "/membership/sellers",
    "/membership/buyers",
    "/contact",
    "/login",
    "/register",
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of staticRoutes) {
      entries.push({
        url: `${base}/${locale}${p}`,
        changeFrequency: "weekly",
        priority: p === "" ? 1 : 0.7,
      });
    }
    for (const c of PRODUCT_CATEGORIES) {
      entries.push({
        url: `${base}/${locale}/products/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }
  return entries;
}
