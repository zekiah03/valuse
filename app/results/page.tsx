"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/scoring";
import type { DiagnosisResult, Answer } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";

const ValuesRadarChart = dynamic(() => import("@/components/ValuesRadarChart"), { ssr: false });

const MASLOW_ORDER = ["safety", "belonging", "esteem", "selfActualization"];

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("valuse_answers");
    if (!raw) { router.replace("/quiz"); return; }
    try {
      setResult(computeDiagnosis(JSON.parse(raw) as Answer[]));
    } catch {
      router.replace("/quiz");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060D1F]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">診断結果を計算中...</p>
        </div>
      </div>
    );
  }

  const sorted  = [...result.categories].sort((a, b) => b.score - a.score);
  const top3    = sorted.slice(0, 3);
  const rest    = sorted.slice(3);
  const maslowOrdered = MASLOW_ORDER.map((s) => result.maslow.find((m) => m.stage === s)!).filter(Boolean);
  const dominantMaslow = result.maslow.find((m) => m.stage === result.dominantMaslow)!;

  return (
    <div className="min-h-screen bg-[#F5F6FA]">

      {/* ── Hero header ─────────────────────────────────── */}
      <div className="relative bg-[#060D1F] overflow-hidden px-5 py-16 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[20%] w-[60vw] h-[60vw] max-w-lg rounded-full bg-indigo-700/25 blur-[100px]" />
          <div className="absolute bottom-[-20%] right-[10%] w-[50vw] h-[50vw] max-w-md rounded-full bg-violet-700/20 blur-[90px]" />
        </div>
        <div className="relative max-w-xl mx-auto">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-4 font-semibold">Your Value Profile</p>
          <h1 className="text-4xl font-black text-white mb-5 tracking-tight leading-tight">
            あなたの<br />
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
              価値観プロフィール
            </span>
          </h1>
          {/* Top 3 labels */}
          <div className="flex flex-wrap justify-center gap-2">
            {top3.map((c, i) => (
              <span
                key={c.category}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                style={{ color: c.color, borderColor: `${c.color}50`, backgroundColor: `${c.color}15` }}
              >
                <span className="opacity-60">#{i + 1}</span> {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── Radar chart ─────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1 text-center">
            価値観バランス
          </h2>
          <ValuesRadarChart categories={result.categories} />
        </section>

        {/* ── Top 3 ───────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
            特に強い価値観 — Top 3
          </h2>
          <div className="space-y-3">
            {top3.map((cat, i) => (
              <div
                key={cat.category}
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${cat.color}ee 0%, ${cat.color}99 100%)` }}
              >
                {/* Rank number watermark */}
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl font-black opacity-[0.08] leading-none select-none"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="relative flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold opacity-70 tracking-widest"># {i + 1}</span>
                    <h3 className="text-xl font-black mt-0.5">{cat.label}価値観</h3>
                  </div>
                  <span className="text-3xl font-black opacity-90">{cat.score}<span className="text-sm font-normal opacity-60">pt</span></span>
                </div>
                <div className="h-1 bg-white/20 rounded-full mb-3">
                  <div className="h-full bg-white/70 rounded-full" style={{ width: `${cat.score}%` }} />
                </div>
                <p className="text-sm opacity-80 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── All scores ──────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">
            全カテゴリ スコア
          </h2>
          <div className="space-y-4">
            {sorted.map((cat, i) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    {cat.label}価値観
                  </span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: cat.color }}>
                    {cat.score}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.score}%`, backgroundColor: cat.color, opacity: i < 3 ? 1 : 0.5 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Maslow ──────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
            マズローの欲求階層
          </h2>
          <p className="text-[11px] text-gray-400 mb-6">
            価値観スコアから、今重視している欲求段階を推定
          </p>

          <div className="space-y-3 mb-6">
            {maslowOrdered.map((item) => {
              const isDominant = item.stage === result.dominantMaslow;
              return (
                <div key={item.stage} className={`rounded-xl p-4 transition-all ${isDominant ? "border-2" : "border border-gray-100"}`}
                  style={isDominant ? { borderColor: `${item.color}60`, backgroundColor: `${item.color}08` } : {}}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isDominant && (
                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: item.color }}>最重視</span>
                      )}
                      <span className="text-sm font-bold" style={{ color: isDominant ? item.color : "#374151" }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold tabular-nums" style={{ color: item.color }}>{item.score}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color, opacity: isDominant ? 1 : 0.4 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dominant description */}
          <div className="rounded-2xl p-5 border-2"
            style={{ borderColor: `${dominantMaslow.color}40`, backgroundColor: `${dominantMaslow.color}08` }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: dominantMaslow.color }}>
              {dominantMaslow.label}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{dominantMaslow.description}</p>
          </div>
        </section>

        {/* ── Retry ───────────────────────────────────────── */}
        <div className="text-center pb-10">
          <Link
            href="/quiz"
            onClick={() => localStorage.removeItem("valuse_answers")}
            className="inline-block text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-4"
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    </div>
  );
}
