"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
export function CommodityChart({ points }: { points: { period: string; value: number }[] }) {
  return (<div className="h-80 w-full" role="img" aria-label="Commodity price history chart">
    <ResponsiveContainer><LineChart data={points}>
      <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" /><YAxis />
      <Tooltip /><Line type="monotone" dataKey="value" stroke="#123B7A" strokeWidth={2} dot={false} />
    </LineChart></ResponsiveContainer></div>);
}
