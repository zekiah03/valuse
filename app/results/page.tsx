"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/scoring";
import type { DiagnosisResult, Answer } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";

const ValuesRadarChart = dynamic(() => import("@/components/ValuesRadarChart"), { ssr: false });

const MASLOW_ORDER = ["safety", "belonging", "esteem", "selfActualization"];
const PAGE   = "#060D1F";
const CARD   = "#0D1628";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT1  = "#F1F5F9";
const TEXT2  = "#64748B";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("valuse_answers");
    if (!raw) { router.replace("/quiz"); return; }
    try { setResult(computeDiagnosis(JSON.parse(raw) as Answer[])); }
    catch { router.replace("/quiz"); }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAGE }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-[13px]" style={{ color: TEXT2 }}>計算中...</p>
        </div>
      </div>
    );
  }

  const sorted = [...result.categories].sort((a, b) => b.score - a.score);
  const top3   = sorted.slice(0, 3);
  const maslowOrdered = MASLOW_ORDER
    .map((s) => result.maslow.find((m) => m.stage === s)!)
    .filter(Boolean);
  const dominantMaslow = result.maslow.find((m) => m.stage === result.dominantMaslow)!;

  return (
    <div className="min-h-screen" style={{ background: PAGE }}>

      {/* Background orb */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -5%, rgba(99,102,241,0.12) 0%, transparent 60%)" }} />

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(6,13,31,0.85)", borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="text-[13px] font-bold tracking-tight" style={{ color: TEXT2 }}>
            ← 価値観診断
          </Link>
          <Link href="/quiz" onClick={() => localStorage.removeItem("valuse_answers")}
            className="text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
            style={{ color: TEXT2, border: `1px solid ${BORDER}` }}>
            もう一度
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5 relative">

        {/* ── Hero title ──────────────────────────────────── */}
        <div className="text-center pt-4 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: TEXT2 }}>
            Your Value Profile
          </p>
          <h1 className="text-[42px] font-black tracking-tight leading-tight mb-5" style={{ color: TEXT1 }}>
            あなたの価値観
          </h1>
          {/* Top 3 chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {top3.map((c, i) => (
              <span key={c.category} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ color: c.color, border: `1px solid ${c.color}45`, background: `${c.color}12` }}>
                <span style={{ opacity: 0.6 }}>#{i + 1}</span> {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Radar ───────────────────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="px-6 pt-5 pb-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: TEXT2 }}>
              価値観バランス
            </p>
          </div>
          <ValuesRadarChart categories={result.categories} />
        </section>

        {/* ── Top 3 ───────────────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3 px-1" style={{ color: TEXT2 }}>
            Top 3 — 特に強い価値観
          </p>
          <div className="space-y-3">
            {top3.map((cat, i) => (
              <div key={cat.category} className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${cat.color}22 0%, ${cat.color}0A 100%)`, border: `1px solid ${cat.color}30` }}>
                {/* Rank watermark */}
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[80px] font-black leading-none select-none"
                  style={{ color: `${cat.color}10` }} aria-hidden>
                  {i + 1}
                </span>
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest" style={{ color: `${cat.color}80` }}>
                        # {i + 1}
                      </span>
                      <h3 className="text-[18px] font-black mt-0.5" style={{ color: TEXT1 }}>
                        {cat.label}価値観
                      </h3>
                    </div>
                    <span className="text-[28px] font-black" style={{ color: cat.color }}>
                      {cat.score}
                      <span className="text-[12px] font-normal" style={{ color: TEXT2 }}>pt</span>
                    </span>
                  </div>
                  {/* Score bar */}
                  <div className="h-[3px] rounded-full mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <div className="h-full rounded-full" style={{ width: `${cat.score}%`, background: cat.color }} />
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: TEXT2 }}>
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── All scores ──────────────────────────────────── */}
        <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-5" style={{ color: TEXT2 }}>
            全カテゴリ スコア
          </p>
          <div className="space-y-4">
            {sorted.map((cat, i) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: i < 3 ? TEXT1 : TEXT2 }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cat.color, opacity: i < 3 ? 1 : 0.4 }} />
                    {cat.label}価値観
                  </span>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: cat.color, opacity: i < 3 ? 1 : 0.5 }}>
                    {cat.score}
                  </span>
                </div>
                <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${cat.score}%`, background: cat.color, opacity: i < 3 ? 1 : 0.35 }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Maslow ──────────────────────────────────────── */}
        <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: TEXT2 }}>
            マズローの欲求階層
          </p>
          <p className="text-[11px] mb-6" style={{ color: "rgba(255,255,255,0.2)" }}>
            価値観スコアから今重視している欲求段階を推定
          </p>
          <div className="space-y-2.5 mb-6">
            {maslowOrdered.map((item) => {
              const isDom = item.stage === result.dominantMaslow;
              return (
                <div key={item.stage} className="rounded-xl px-4 py-3.5 transition-all"
                  style={{
                    background: isDom ? `${item.color}12` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isDom ? `${item.color}35` : BORDER}`,
                  }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isDom && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: item.color, color: "#fff" }}>
                          最重視
                        </span>
                      )}
                      <span className="text-[13px] font-semibold"
                        style={{ color: isDom ? item.color : TEXT2 }}>
                        {item.label}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums" style={{ color: isDom ? item.color : TEXT2 }}>
                      {item.score}
                    </span>
                  </div>
                  <div className="h-[2px] rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: item.color, opacity: isDom ? 1 : 0.35 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {/* Description */}
          <div className="rounded-xl px-5 py-4"
            style={{ background: `${dominantMaslow.color}10`, border: `1px solid ${dominantMaslow.color}30` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: dominantMaslow.color }}>
              {dominantMaslow.label}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: TEXT2 }}>
              {dominantMaslow.description}
            </p>
          </div>
        </section>

        <div className="h-10" />
      </div>
    </div>
  );
}
