"use client";

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import type { CategoryResult } from "@/types";

export default function ValuesRadarChart({ categories }: { categories: CategoryResult[] }) {
  const data = categories.map((c) => ({
    subject: c.label,
    score: c.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={360}>
      <RadarChart data={data} margin={{ top: 20, right: 36, bottom: 20, left: 36 }}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: "rgba(255,255,255,0.45)", fontWeight: 500 }}
        />
        <Tooltip
          formatter={(value) => [`${value}pt`, "スコア"]}
          contentStyle={{
            background: "#111E33",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            color: "#F1F5F9",
            fontSize: 12,
          }}
          itemStyle={{ color: "#818CF8" }}
        />
        <Radar
          name="あなたの価値観"
          dataKey="score"
          stroke="#818CF8"
          fill="#6366F1"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
