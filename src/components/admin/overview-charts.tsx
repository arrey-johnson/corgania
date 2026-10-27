"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardData } from "@/lib/admin/dashboard-data";

const BLUE = "#123B7A";
const RED = "#DC2626";
const TEAL = "#0F766E";
const AMBER = "#D97706";
const SLATE = "#94A3B8";

const STATUS_COLORS: Record<string, string> = {
  draft: SLATE,
  submitted: AMBER,
  under_review: BLUE,
  info_required: "#EA580C",
  verification_in_progress: TEAL,
  approved: "#059669",
  rejected: RED,
  suspended: "#7F1D1D",
  expired: SLATE,
};

export function GrowthChart({ data }: { data: AdminDashboardData["monthlyOrgs"] }) {
  const chart = data.map((d) => ({
    ...d,
    label: new Date(`${d.month}-01T00:00:00Z`).toLocaleString("en", { month: "short", year: "2-digit", timeZone: "UTC" }),
  }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={chart} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="orgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="appFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RED} stopOpacity={0.3} />
              <stop offset="100%" stopColor={RED} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ec" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#44536a" }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#44536a" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#dbe2ec", fontSize: 12 }} />
          <Area type="monotone" dataKey="organisations" name="Organisations" stroke={BLUE} fill="url(#orgFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="applications" name="Applications" stroke={RED} fill="url(#appFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PipelineChart({ data }: { data: AdminDashboardData["pipeline"] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ec" vertical={false} />
          <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#44536a" }} axisLine={false} tickLine={false} interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#44536a" }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#dbe2ec", fontSize: 12 }} />
          <Bar dataKey="count" name="Organisations" radius={[8, 8, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.stage}
                fill={
                  entry.stage === "Approved" ? "#059669"
                    : entry.stage === "Rejected" ? RED
                      : entry.stage === "Verification" ? TEAL
                        : entry.stage === "Under review" ? BLUE
                          : AMBER
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ data }: { data: AdminDashboardData["statusBreakdown"] }) {
  const chart = data.length
    ? data.map((d) => ({ name: d.status.replace(/_/g, " "), value: d.count, key: d.status }))
    : [{ name: "No data yet", value: 1, key: "empty" }];
  return (
    <div className="flex h-64 items-center gap-4">
      <div className="h-full min-w-0 flex-1">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={chart} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2}>
              {chart.map((entry) => (
                <Cell key={entry.key} fill={data.length ? (STATUS_COLORS[entry.key] ?? SLATE) : "#e2e8f0"} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#dbe2ec", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="max-h-56 w-36 shrink-0 space-y-1.5 overflow-auto text-xs">
        {data.length === 0 && <li className="text-slate-body">Awaiting organisations</li>}
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[d.status] ?? SLATE }} />
            <span className="capitalize text-slate-body">{d.status.replace(/_/g, " ")}</span>
            <span className="ml-auto font-semibold text-ink">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContinentBars({ data }: { data: AdminDashboardData["continents"] }) {
  const chart = data.length
    ? data
    : [{ continent: "Africa", buyers: 0, sellers: 0, organisations: 0 }, { continent: "Europe", buyers: 0, sellers: 0, organisations: 0 }, { continent: "Asia", buyers: 0, sellers: 0, organisations: 0 }, { continent: "North America", buyers: 0, sellers: 0, organisations: 0 }, { continent: "South America", buyers: 0, sellers: 0, organisations: 0 }, { continent: "Oceania", buyers: 0, sellers: 0, organisations: 0 }];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={chart} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ec" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#44536a" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="continent" width={100} tick={{ fontSize: 11, fill: "#44536a" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, borderColor: "#dbe2ec", fontSize: 12 }} />
          <Bar dataKey="sellers" name="Sellers" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
          <Bar dataKey="buyers" name="Buyers" stackId="a" fill={RED} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
