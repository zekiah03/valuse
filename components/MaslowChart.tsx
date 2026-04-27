"use client";

import type { MaslowResult } from "@/types";

interface Props {
  maslow: MaslowResult[];
  dominant: string;
}

const STAGE_ORDER = ["safety", "belonging", "esteem", "selfActualization"];

export default function MaslowChart({ maslow, dominant }: Props) {
  const ordered = STAGE_ORDER.map((s) => maslow.find((m) => m.stage === s)!).filter(Boolean);

  return (
    <div className="space-y-3">
      {ordered.map((item, i) => {
        const isDominant = item.stage === dominant;
        return (
          <div key={item.stage} className="relative">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs text-gray-500 w-4">{i + 1}</span>
              <span
                className={`text-sm font-medium ${isDominant ? "font-bold" : "text-gray-700"}`}
                style={{ color: isDominant ? item.color : undefined }}
              >
                {item.label}
                {isDominant && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: item.color }}>
                    最重視
                  </span>
                )}
              </span>
              <span className="ml-auto text-sm font-semibold" style={{ color: item.color }}>
                {item.score}点
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden ml-7">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${item.score}%`, backgroundColor: item.color, opacity: isDominant ? 1 : 0.5 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
