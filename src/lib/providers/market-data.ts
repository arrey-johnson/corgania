/**
 * Market-data provider boundary.
 *
 * Default free feed: World Bank Commodity Price Data (Pink Sheet) — monthly
 * USD benchmarks with source, unit, currency and vintage. We fetch a
 * redistribution that mirrors the Pink Sheet (CC BY / World Bank attribution)
 * so the desk never invents prices.
 *
 * Set MARKET_DATA_PROVIDER=worldbank_pink_sheet (no API key required).
 */

export type MarketDataResult =
  | {
      status: "ok";
      points: { period: string; value: number }[];
      source: string;
      seriesLabel: string;
      unit: string;
      currency: string;
      updatedAt: string;
      latestValue: number;
    }
  | { status: "unavailable"; reason: string };

const PROVIDER = "worldbank_pink_sheet";
const SOURCE_LABEL = "World Bank Pink Sheet (Commodity Markets)";
const ORIGINS_BASE = "https://commodityorigins.com/data/prices";

/** App slug → Commodity Origins / Pink Sheet series slug. */
const SLUG_MAP: Record<string, string> = {
  cocoa: "cocoa",
  coffee: "coffee",
  cotton: "cotton",
  timber: "sawnwood", // Pink Sheet: Cameroon sapele sawnwood — relevant to Corgania's launch market
};

type OriginsSeries = {
  series_code: string;
  series_label: string;
  primary?: boolean;
  unit: string;
  source_id: string;
  vintage: string;
  latest_value: number;
  latest_date: string;
  redistribution?: string;
  monthly: [string, number][];
};

type OriginsPayload = {
  slug: string;
  name: string;
  series: OriginsSeries[];
  disclaimer?: string;
};

function normalizeUnit(raw: string): string {
  const u = raw.trim().toLowerCase();
  if (u === "$/kg" || u === "usd/kg") return "USD / kg";
  if (u.includes("cubic") || u === "$/m3" || u === "$/m³") return "USD / m³";
  if (u.includes("tonne") || u.includes("mt")) return "USD / metric tonne";
  return raw.startsWith("$") ? raw.replace("$", "USD ") : raw;
}

function formatPeriod(ym: string): string {
  // "2024-01" → keep compact for chart axis
  return ym;
}

export function isWorldBankProviderConfigured(): boolean {
  const p = (process.env.MARKET_DATA_PROVIDER ?? "").trim().toLowerCase();
  return !p || p === PROVIDER || p === "worldbank" || p === "pink_sheet";
}

async function fetchPinkSheetSeries(remoteSlug: string): Promise<OriginsPayload> {
  const res = await fetch(`${ORIGINS_BASE}/${remoteSlug}.json`, {
    next: { revalidate: 60 * 60 * 24 }, // refresh daily; Pink Sheet is monthly
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Pink Sheet mirror returned HTTP ${res.status} for ${remoteSlug}`);
  }
  return (await res.json()) as OriginsPayload;
}

export async function getCommoditySeries(slug: string): Promise<MarketDataResult> {
  if (!isWorldBankProviderConfigured()) {
    return {
      status: "unavailable",
      reason:
        "No market-data provider is configured. Set MARKET_DATA_PROVIDER=worldbank_pink_sheet for the free World Bank Pink Sheet desk.",
    };
  }

  const remote = SLUG_MAP[slug];
  if (!remote) {
    return {
      status: "unavailable",
      reason: `No Pink Sheet series is mapped for “${slug}”.`,
    };
  }

  try {
    const payload = await fetchPinkSheetSeries(remote);
    const series =
      payload.series.find((s) => s.primary && s.source_id === "pinksheet") ??
      payload.series.find((s) => s.source_id === "pinksheet") ??
      payload.series.find((s) => s.primary) ??
      payload.series[0];

    if (!series?.monthly?.length) {
      return {
        status: "unavailable",
        reason: "Pink Sheet response contained no monthly observations.",
      };
    }

    // Chart last 60 months (5 years) — full history remains long; desk stays readable.
    const tail = series.monthly.slice(-60);
    const points = tail
      .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
      .map(([period, value]) => ({ period: formatPeriod(period), value }));

    if (!points.length) {
      return {
        status: "unavailable",
        reason: "Pink Sheet observations were empty after filtering.",
      };
    }

    return {
      status: "ok",
      points,
      source: SOURCE_LABEL,
      seriesLabel: series.series_label,
      unit: normalizeUnit(series.unit),
      currency: "USD",
      updatedAt: series.vintage || series.latest_date,
      latestValue: series.latest_value ?? points[points.length - 1]!.value,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown fetch error";
    return {
      status: "unavailable",
      reason: `Could not load World Bank Pink Sheet data (${message}).`,
    };
  }
}
