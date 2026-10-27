import fs from "fs";

const copy = {
  en: {
    attribution:
      "Monthly USD benchmarks from the World Bank Commodity Price Data (Pink Sheet). Figures lag the market; shown for information only, with source, unit and vintage — never invented.",
    unitKg: "USD / kg",
  },
  fr: {
    attribution:
      "Repères mensuels en USD issus des World Bank Commodity Price Data (Pink Sheet). Les chiffres suivent le marché avec retard ; affichés à titre informatif avec source, unité et millésime — jamais inventés.",
    unitKg: "USD / kg",
  },
  es: {
    attribution:
      "Referencias mensuales en USD de World Bank Commodity Price Data (Pink Sheet). Las cifras van rezagadas respecto al mercado; se muestran solo a título informativo, con fuente, unidad y vintage — nunca inventadas.",
    unitKg: "USD / kg",
  },
  de: {
    attribution:
      "Monatliche USD-Benchmarks aus den World Bank Commodity Price Data (Pink Sheet). Werte hinken dem Markt hinterher; nur zur Information mit Quelle, Einheit und Vintage — niemals erfunden.",
    unitKg: "USD / kg",
  },
  zh: {
    attribution:
      "月度美元基准价来自世界银行商品价格数据（Pink Sheet）。数据滞后于市场；仅供参考，并注明来源、单位与版本——绝不捏造。",
    unitKg: "USD / kg",
  },
};

for (const [loc, vals] of Object.entries(copy)) {
  const p = new URL(`../messages/${loc}.json`, import.meta.url);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  j.commodities.attribution = vals.attribution;
  j.commodities.unitKg = vals.unitKg;
  // Cocoa/coffee Pink Sheet are $/kg — keep tonne key for fallbacks but desk uses API unit.
  fs.writeFileSync(p, `${JSON.stringify(j, null, 2)}\n`);
  console.log("attribution", loc);
}
