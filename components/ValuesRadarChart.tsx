"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryResult } from "@/types";

interface Props {
  categories: CategoryResult[];
}

export default function ValuesRadarChart({ categories }: Props) {
  const data = categories.map((c) => ({
    subject: c.label,
    score: c.score,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={380}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 13, fill: "#374151" }}
        />
        <Tooltip
          formatter={(value) => [`${value}点`, "スコア"]}
          contentStyle={{ borderRadius: 8, border: "1px solid #E5E7EB" }}
        />
        <Radar
          name="あなたの価値観"
          dataKey="score"
          stroke="#6366F1"
          fill="#6366F1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
