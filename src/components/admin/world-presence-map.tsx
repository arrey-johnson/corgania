"use client";

import { useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import type { CountryPresence } from "@/lib/admin/dashboard-data";
import { COUNTRY_CENTROIDS } from "@/lib/geo/country-centroids";
import { ISO_N3_TO_A2 } from "@/lib/geo/world-meta";

const GEO_URL = "/geo/countries-110m.json";

const FILL = {
  none: "#e8eef6",
  buyer: "#DC2626",
  seller: "#123B7A",
  both: "#0F766E",
  hover: "#F59E0B",
} as const;

const CONTINENT_MARKERS: { name: string; coordinates: [number, number] }[] = [
  { name: "Africa", coordinates: [20, 5] },
  { name: "Europe", coordinates: [15, 50] },
  { name: "Asia", coordinates: [90, 35] },
  { name: "North America", coordinates: [-100, 45] },
  { name: "South America", coordinates: [-60, -15] },
  { name: "Oceania", coordinates: [135, -25] },
];

function roleFill(role: CountryPresence["role"]) {
  if (role === "buyer") return FILL.buyer;
  if (role === "seller") return FILL.seller;
  if (role === "both") return FILL.both;
  return FILL.none;
}

export function WorldPresenceMap({ countries }: { countries: CountryPresence[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; title: string; body: string } | null>(null);
  const [selected, setSelected] = useState<CountryPresence | null>(null);
  const [position, setPosition] = useState({ coordinates: [15, 10] as [number, number], zoom: 1.15 });

  const byCode = useMemo(() => {
    const m = new Map<string, CountryPresence>();
    for (const c of countries) m.set(c.code, c);
    return m;
  }, [countries]);

  const hasPresence = countries.length > 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-[#dce8f5] via-[#c5d8ec] to-[#b7cce4]">
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{
        backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 45%), radial-gradient(circle at 80% 10%, rgba(18,59,122,0.12), transparent 40%)",
      }} />

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3 border-b border-white/40 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-blue">Global presence</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Buyers & sellers on the map</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-body">
            {hasPresence
              ? "Countries are coloured by who has joined Corgania. Pan and zoom to explore continents and markets."
              : "No organisations yet — explore the interactive world map. Colours appear as buyers and sellers join."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold">
          <Legend swatch={FILL.seller} label="Sellers" />
          <Legend swatch={FILL.buyer} label="Buyers" />
          <Legend swatch={FILL.both} label="Both" />
          <Legend swatch={FILL.none} label="No members yet" border />
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 165, center: [10, 5] }}
          width={980}
          height={460}
          className="h-auto w-full"
          style={{ width: "100%", height: "auto" }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={1}
            maxZoom={6}
            onMoveEnd={(pos) => setPosition({
              coordinates: (pos.coordinates ?? [15, 10]) as [number, number],
              zoom: pos.zoom ?? 1.15,
            })}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const n3 = String(geo.id ?? "").padStart(3, "0");
                  const a2 = ISO_N3_TO_A2[n3];
                  const presence = a2 ? byCode.get(a2) : undefined;
                  const role = presence?.role ?? "none";
                  const name = geo.properties?.name ?? a2 ?? "Unknown";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={(evt) => {
                        const body = presence
                          ? `${presence.sellers} seller org${presence.sellers === 1 ? "" : "s"} · ${presence.buyers} buyer org${presence.buyers === 1 ? "" : "s"}`
                          : "No Corgania organisations yet";
                        setTip({ x: evt.clientX, y: evt.clientY, title: name, body });
                      }}
                      onMouseMove={(evt) => setTip((t) => (t ? { ...t, x: evt.clientX, y: evt.clientY } : t))}
                      onMouseLeave={() => setTip(null)}
                      onClick={() => {
                        if (presence) setSelected(presence);
                        else setSelected({
                          code: a2 ?? "—",
                          name,
                          continent: "—",
                          buyers: 0,
                          sellers: 0,
                          both: 0,
                          total: 0,
                          role: "none",
                        });
                      }}
                      // react-simple-maps style API (default/hover/pressed) — typings lag the library
                      style={{
                        default: {
                          fill: roleFill(role),
                          stroke: "#ffffff",
                          strokeWidth: 0.45,
                          outline: "none",
                          cursor: "pointer",
                          transition: "fill 120ms ease",
                        },
                        hover: {
                          fill: role === "none" ? "#cbd5e1" : FILL.hover,
                          stroke: "#0f1c2e",
                          strokeWidth: 0.7,
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: FILL.hover,
                          outline: "none",
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      } as any}
                    />
                  );
                })
              }
            </Geographies>

            {CONTINENT_MARKERS.map((m) => (
              <Marker key={m.name} coordinates={m.coordinates}>
                <text
                  textAnchor="middle"
                  className="fill-brand-blue/70 text-[9px] font-bold uppercase tracking-[0.14em]"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {m.name}
                </text>
              </Marker>
            ))}

            {countries
              .filter((c) => c.role !== "none" && c.total > 0 && COUNTRY_CENTROIDS[c.code])
              .map((c) => {
                const coordinates = COUNTRY_CENTROIDS[c.code]!;
                const fill = roleFill(c.role);
                const r = Math.min(10, 4 + Math.sqrt(c.total) * 2);
                return (
                  <Marker key={`dot-${c.code}`} coordinates={coordinates}>
                    <g
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(evt) => {
                        setTip({
                          x: evt.clientX,
                          y: evt.clientY,
                          title: `${c.name} (${c.code})`,
                          body: `${c.total} organisation${c.total === 1 ? "" : "s"} · ${c.sellers} seller · ${c.buyers} buyer`,
                        });
                      }}
                      onMouseLeave={() => setTip(null)}
                      onClick={() => setSelected(c)}
                    >
                      <circle r={r + 3} fill={fill} opacity={0.22} />
                      <circle r={r} fill={fill} stroke="#ffffff" strokeWidth={1.5} />
                      <circle r={1.6} fill="#ffffff" />
                    </g>
                  </Marker>
                );
              })}
          </ZoomableGroup>
        </ComposableMap>

        <div className="absolute bottom-3 left-3 flex gap-2">
          <MapControl label="+" onClick={() => setPosition((p) => ({ ...p, zoom: Math.min(6, p.zoom * 1.35) }))} />
          <MapControl label="−" onClick={() => setPosition((p) => ({ ...p, zoom: Math.max(1, p.zoom / 1.35) }))} />
          <MapControl label="Reset" onClick={() => setPosition({ coordinates: [15, 10], zoom: 1.15 })} wide />
        </div>
      </div>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 max-w-xs rounded-lg border border-line bg-white px-3 py-2 text-sm shadow-lg"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <p className="font-semibold text-ink">{tip.title}</p>
          <p className="mt-0.5 text-xs text-slate-body">{tip.body}</p>
        </div>
      )}

      {selected && (
        <div className="relative z-10 border-t border-white/50 bg-white/80 px-5 py-4 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-body">{selected.continent}</p>
              <p className="font-display text-xl font-semibold text-ink">{selected.name} <span className="text-sm font-sans font-medium text-slate-body">({selected.code})</span></p>
              <p className="mt-1 text-sm text-slate-body">
                {selected.total === 0
                  ? "No organisations registered in this country yet."
                  : `${selected.total} organisation${selected.total === 1 ? "" : "s"} · ${selected.sellers} seller-capable · ${selected.buyers} buyer-capable`}
              </p>
            </div>
            <button type="button" className="text-sm font-semibold text-brand-blue underline" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Legend({ swatch, label, border }: { swatch: string; label: string; border?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-ink backdrop-blur">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: swatch, boxShadow: border ? "inset 0 0 0 1px #94a3b8" : undefined }} />
      {label}
    </span>
  );
}

function MapControl({ label, onClick, wide }: { label: string; onClick: () => void; wide?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border border-line bg-white/90 text-sm font-semibold text-brand-blue shadow-sm backdrop-blur hover:bg-white ${wide ? "px-3 py-1.5" : "h-8 w-8"}`}
    >
      {label}
    </button>
  );
}
