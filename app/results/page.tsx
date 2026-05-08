"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/scoring";
import type { DiagnosisResult, Answer, CategoryResult, MaslowResult, ArchetypeResult, TensionPair } from "@/types";
import dynamic from "next/dynamic";
import Link from "next/link";
import { contributeToTwin } from "@/lib/contribute";

const ValuesRadarChart = dynamic(() => import("@/components/ValuesRadarChart"), { ssr: false });

const MASLOW_ORDER  = ["safety", "belonging", "esteem", "selfActualization", "transcendence"];
const TICK_LABELS   = ["全く", "あまり", "どちらとも", "やや", "非常に"];
const CARD   = "#0D1628";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT1  = "#F1F5F9";
const TEXT2  = "#64748B";

/** Read-only slider matching quiz design */
function ScoreSlider({ score, color, dimmed = false }: { score: number; color: string; dimmed?: boolean }) {
  const opacity = dimmed ? 0.4 : 1;
  const thumbLeft = `calc(${score}% - ${score * 0.24}px)`;
  return (
    <div>
      <div className="relative h-[6px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color, opacity }} />
        <div className="absolute top-1/2 w-6 h-6 rounded-full -translate-y-1/2 transition-all duration-700"
          style={{ left: thumbLeft, background: color, border: `3px solid ${CARD}`, boxShadow: "0 2px 10px rgba(0,0,0,0.5)", opacity }} />
      </div>
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
          <span className="text-[13px] font-semibold" style={{ color: isDominant ? item.color : TEXT2 }}>
            {item.label}
          </span>
        </div>
        <span className="text-[15px] font-bold tabular-nums" style={{ color: isDominant ? item.color : TEXT2 }}>
          {item.score}
        </span>
      </div>
      <ScoreSlider score={item.score} color={item.color} dimmed={!isDominant} />
    </div>
  );
}

function ArchetypeCard({ archetype }: { archetype: ArchetypeResult }) {
  const c = archetype.color;
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c}30` }}>
      <div className="h-1" style={{ background: `linear-gradient(to right, ${c}, ${c}66)` }} />
      <div className="p-6" style={{ background: `${c}08` }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: c }}>
              Value Archetype
            </p>
            <h2 className="text-[34px] font-black tracking-tight leading-none mb-1" style={{ color: TEXT1 }}>
              {archetype.label}
            </h2>
            <p className="text-[13px] font-medium" style={{ color: `${c}cc` }}>
              {archetype.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 ml-4">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none" stroke={c} strokeWidth="4"
                  strokeDasharray={`${(2 * Math.PI * 22 * archetype.affinity) / 100} ${2 * Math.PI * 22}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] font-black tabular-nums" style={{ color: c }}>
                  {archetype.affinity}
                </span>
              </div>
            </div>
            <span className="text-[9px] mt-1" style={{ color: TEXT2 }}>適合度</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-px h-4 rounded-full" style={{ background: c }} />
          <p className="text-[12px] font-semibold italic" style={{ color: `${c}bb` }}>
            「{archetype.motif}」
          </p>
        </div>
        <p className="text-[13px] leading-relaxed mb-4" style={{ color: TEXT2 }}>
          {archetype.description}
        </p>
        {archetype.secondary && (
          <div className="flex items-center gap-2 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px]" style={{ color: TEXT2 }}>副アーキタイプ</span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ background: `${c}20`, color: c }}>
              {archetype.secondary.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function TensionSection({ tensions }: { tensions: TensionPair[] }) {
  if (tensions.length === 0) return null;
  return (
    <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: TEXT2 }}>
        価値観の葛藤分析
      </p>
      <p className="text-[11px] mb-5" style={{ color: "rgba(255,255,255,0.18)" }}>
        高スコアが重なる価値観間の動機的緊張（シュワルツ円環理論に基づく）
      </p>
      <div className="space-y-5">
        {tensions.map((t) => {
          const intensity = Math.min(Math.round(t.tension * 200), 100);
          const barColor = intensity > 55 ? "#EF4444" : intensity > 30 ? "#F59E0B" : "#64748B";
          return (
            <div key={`${t.catA}-${t.catB}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span style={{ color: TEXT1 }}>{t.labelA}</span>
                  <span className="text-[10px]" style={{ color: TEXT2 }}>↔</span>
                  <span style={{ color: TEXT1 }}>{t.labelB}</span>
                </div>
                <span className="text-[11px] font-bold tabular-nums" style={{ color: barColor }}>
                  {intensity}
                </span>
              </div>
              <div className="h-[4px] rounded-full mb-2" style={{ background: "rgba(255,255,255,0.07)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${intensity}%`, background: barColor }} />
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: TEXT2 }}>
                {t.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("valuse_answers");
    if (!raw) { router.replace("/quiz"); return; }
    try {
      const r = computeDiagnosis(JSON.parse(raw) as Answer[]);
      setResult(r);
      if (!sessionStorage.getItem('valuse_contributed')) {
        sessionStorage.setItem('valuse_contributed', '1');
        contributeToTwin('valuse', {
          archetype: r.archetype.label,
          dominantMaslow: r.dominantMaslow,
          top3: [...r.categories].sort((a, b) => b.score - a.score).slice(0, 3).map(c => ({ category: c.category, score: c.score })),
        });
      }
    } catch { router.replace("/quiz"); }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen">
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

        <ArchetypeCard archetype={result.archetype} />

        <section className="rounded-2xl overflow-hidden" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="px-6 pt-5 text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: TEXT2 }}>
            価値観バランス
          </p>
          <ValuesRadarChart categories={result.categories} />
        </section>

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

        <section className="rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: TEXT2 }}>
            マズローの欲求階層
          </p>
          <p className="text-[11px] mb-5" style={{ color: "rgba(255,255,255,0.18)" }}>
            価値観スコアから推定した欲求段階（超越欲求を含む5段階モデル）
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

        <TensionSection tensions={result.tensions} />

        <div className="h-10" />
      </div>
    </div>
  );
}
