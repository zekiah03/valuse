"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/scoring";
import type { DiagnosisResult, Answer, CategoryResult, MaslowResult } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";

const ValuesRadarChart = dynamic(() => import("@/components/ValuesRadarChart"), { ssr: false });

const MASLOW_ORDER  = ["safety", "belonging", "esteem", "selfActualization"];
const TICK_LABELS   = ["全く", "あまり", "どちらとも", "やや", "非常に"];
const PAGE   = "#060D1F";
const CARD   = "#0D1628";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT1  = "#F1F5F9";
const TEXT2  = "#64748B";

/** Read-only slider that mirrors the quiz slider design */
function ScoreSlider({ score, color, dimmed = false }: { score: number; color: string; dimmed?: boolean }) {
  const opacity = dimmed ? 0.4 : 1;
  // Thumb position: score 0–100 maps to left 0%–100% centered on thumb (24px)
  // left = calc(score% - score/100 * 24px) ≈ calc(score% - {score*0.24}px)
  const thumbLeft = `calc(${score}% - ${score * 0.24}px)`;

  return (
    <div>
      {/* Track */}
      <div className="relative h-[6px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color, opacity }} />
        {/* Thumb */}
        <div className="absolute top-1/2 w-6 h-6 rounded-full -translate-y-1/2 transition-all duration-700"
          style={{
            left: thumbLeft,
            background: color,
            border: `3px solid ${CARD}`,
            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
            opacity,
          }} />
      </div>
      {/* Tick labels */}
      <div className="flex justify-between px-[12px] mt-2">
        {TICK_LABELS.map((lbl) => (
          <span key={lbl} className="text-[9px] font-medium text-center w-12 -mx-6"
            style={{ color: "rgba(255,255,255,0.18)" }}>
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

function CategorySliderCard({ cat, rank }: { cat: CategoryResult; rank?: number }) {
  return (
    <div className="rounded-2xl p-5 transition-all"
      style={{
        background: rank ? `${cat.color}10` : CARD,
        border: `1px solid ${rank ? `${cat.color}30` : BORDER}`,
      }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {rank && (
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black"
              style={{ background: cat.color, color: "#fff" }}>
              {rank}
            </span>
          )}
          <span className="text-[14px] font-bold" style={{ color: rank ? TEXT1 : TEXT2 }}>
            {cat.label}価値観
          </span>
        </div>
        <span className="text-[22px] font-black tabular-nums" style={{ color: cat.color }}>
          {cat.score}
          <span className="text-[11px] font-normal ml-0.5" style={{ color: TEXT2 }}>pt</span>
        </span>
      </div>
      <ScoreSlider score={cat.score} color={cat.color} />
      {rank && (
        <p className="text-[12px] leading-relaxed mt-4" style={{ color: TEXT2 }}>
          {cat.description}
        </p>
      )}
    </div>
  );
}

function MaslowSliderCard({ item, isDominant }: { item: MaslowResult; isDominant: boolean }) {
  return (
    <div className="rounded-xl p-4 transition-all"
      style={{
        background: isDominant ? `${item.color}10` : "rgba(255,255,255,0.02)",
        border: `1px solid ${isDominant ? `${item.color}30` : BORDER}`,
      }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isDominant && (
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: item.color, color: "#fff" }}>
              最重視
            </span>
          )}
          <span className="text-[13px] font-semibold"
            style={{ color: isDominant ? item.color : TEXT2 }}>
            {item.label}
          </span>
        </div>
        <span className="text-[15px] font-bold tabular-nums"
          style={{ color: isDominant ? item.color : TEXT2 }}>
          {item.score}
        </span>
      </div>
      <ScoreSlider score={item.score} color={item.color} dimmed={!isDominant} />
    </div>
  );
}

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
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const sorted  = [...result.categories].sort((a, b) => b.score - a.score);
  const top3    = sorted.slice(0, 3);
  const rest    = sorted.slice(3);
  const maslowOrdered = MASLOW_ORDER
    .map((s) => result.maslow.find((m) => m.stage === s)!)
    .filter(Boolean);
  const dominantMaslow = result.maslow.find((m) => m.stage === result.dominantMaslow)!;

  return (
    <div className="min-h-screen" style={{ background: PAGE }}>
      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(6,13,31,0.85)", borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link href="/" className="text-[13px] font-bold" style={{ color: TEXT2 }}>← ホーム</Link>
          <Link href="/quiz" onClick={() => localStorage.removeItem("valuse_answers")}
            className="text-[11px] font-semibold px-3 py-1 rounded-full"
            style={{ color: TEXT2, border: `1px solid ${BORDER}` }}>
            もう一度
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5 relative">

        {/* ── Hero ───────────────────────────────────────── */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4" style={{ color: TEXT2 }}>
            Your Value Profile
          </p>
          <h1 className="text-[40px] font-black tracking-tight leading-tight mb-5" style={{ color: TEXT1 }}>
            あなたの価値観
          </h1>
          <div className="flex flex-wrap justify-center gap-2">
            {top3.map((c, i) => (
              <span key={c.category} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ color: c.color, border: `1px solid ${c.color}45`, background: `${c.color}12` }}>
                <span style={{ opacity: 0.6 }}>#{i + 1}</span> {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Radar ──────────────────────────────────────── */}
        <section className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="px-6 pt-5 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: TEXT2 }}>
            価値観バランス
          </p>
          <ValuesRadarChart categories={result.categories} />
        </section>

        {/* ── Top 3 ──────────────────────────────────────── */}
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3 px-1" style={{ color: TEXT2 }}>
            Top 3 — 特に強い価値観
          </p>
          <div className="space-y-3">
            {top3.map((cat, i) => (
              <CategorySliderCard key={cat.category} cat={cat} rank={i + 1} />
            ))}
          </div>
        </section>

        {/* ── All scores ─────────────────────────────────── */}
        <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-5" style={{ color: TEXT2 }}>
            全カテゴリ スコア
          </p>
          <div className="space-y-6">
            {rest.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-[13px]" style={{ color: TEXT2 }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color, opacity: 0.5 }} />
                    {cat.label}価値観
                  </span>
                  <span className="text-[13px] font-bold tabular-nums" style={{ color: cat.color, opacity: 0.6 }}>
                    {cat.score}
                  </span>
                </div>
                <ScoreSlider score={cat.score} color={cat.color} dimmed />
              </div>
            ))}
          </div>
        </section>

        {/* ── Maslow ─────────────────────────────────────── */}
        <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: TEXT2 }}>
            マズローの欲求階層
          </p>
          <p className="text-[11px] mb-5" style={{ color: "rgba(255,255,255,0.18)" }}>
            価値観スコアから今重視している欲求段階を推定
          </p>
          <div className="space-y-3 mb-5">
            {maslowOrdered.map((item) => (
              <MaslowSliderCard key={item.stage} item={item} isDominant={item.stage === result.dominantMaslow} />
            ))}
          </div>
          <div className="rounded-xl px-5 py-4"
            style={{ background: `${dominantMaslow.color}10`, border: `1px solid ${dominantMaslow.color}30` }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: dominantMaslow.color }}>
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
