"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import { CATEGORY_COLORS } from "@/lib/scoring";
import type { Answer } from "@/types";

const SCALE: Record<number, string> = {
  1: "全く当てはまらない",
  2: "あまり当てはまらない",
  3: "どちらとも言えない",
  4: "やや当てはまる",
  5: "非常によく当てはまる",
};

const PAGE   = "#060D1F";
const CARD   = "rgba(13,22,40,0.55)";
const CARD2  = "rgba(17,30,51,0.65)";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT1  = "#F1F5F9";
const TEXT2  = "#64748B";

export default function QuizPage() {
  const router = useRouter();
  const [questions] = useState(() => shuffleQuestions(QUESTIONS));
  const [answers, setAnswers]     = useState<Answer[]>([]);
  const [touched, setTouched]     = useState<Set<string>>(new Set());
  // continuous float values for smooth dragging (1.0–5.0)
  const [rawValues, setRawValues] = useState<Record<string, number>>({});
  const [shakeIdx, setShakeIdx]   = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const answeredCount = touched.size;
  const total         = questions.length;
  const allAnswered   = answeredCount === total;
  const progress      = (answeredCount / total) * 100;

  const handleSlider = (questionId: string, raw: number) => {
    setRawValues((p) => ({ ...p, [questionId]: raw }));
    setTouched((p) => new Set(p).add(questionId));
    // snap to nearest integer for the stored score
    const score = Math.round(raw);
    setAnswers((p) => [...p.filter((a) => a.questionId !== questionId), { questionId, score }]);
  };

  const handleSubmit = () => {
    if (allAnswered) {
      localStorage.setItem("valuse_answers", JSON.stringify(answers));
      router.push("/results");
      return;
    }
    const idx = questions.findIndex((q) => !touched.has(q.id));
    if (idx !== -1) {
      cardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "center" });
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 600);
    }
  };

  return (
    <div className="min-h-screen relative">

      {/* ── Sticky header ─────────────────────────────── */}
      <header className="sticky top-0 z-20 backdrop-blur-xl"
        style={{ background: "rgba(6,13,31,0.85)", borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-2xl mx-auto px-5 py-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[13px] font-bold tracking-tight" style={{ color: TEXT1 }}>
              価値観診断
            </span>
            <span className="text-[12px] tabular-nums" style={{ color: TEXT2 }}>
              <span style={{ color: TEXT1, fontWeight: 700 }}>{answeredCount}</span>
              &nbsp;/ {total}
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(to right, #6366F1, #8B5CF6, #EC4899)",
              }} />
          </div>
        </div>
      </header>

      {/* ── Questions ─────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-4 space-y-3 relative">
        {questions.map((q, i) => {
          const answer    = answers.find((a) => a.questionId === q.id);
          const isTouched = touched.has(q.id);
          // use continuous float for smooth display; fall back to stored integer or center
          const rawVal    = rawValues[q.id] ?? answer?.score ?? 3;
          const snapScore = Math.round(rawVal);
          const fillPct   = ((rawVal - 1) / 4) * 100;
          const accent    = CATEGORY_COLORS[q.category];

          return (
            <div
              key={q.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                shakeIdx === i ? "animate-shake" : ""
              }`}
              style={{
                background: isTouched ? CARD2 : CARD,
                border: `1px solid ${isTouched ? `${accent}30` : BORDER}`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              {/* Top accent line */}
              <div className="h-[2px] transition-all duration-500"
                style={{ background: isTouched ? accent : "rgba(255,255,255,0.05)" }} />

              <div className="px-6 py-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold tracking-[0.15em]"
                    style={{ color: isTouched ? `${accent}90` : "rgba(255,255,255,0.2)" }}>
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  {isTouched && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${accent}25`, color: accent }}>
                      ✓ 回答済み
                    </span>
                  )}
                </div>

                {/* Question text */}
                <p className="text-[14px] font-medium leading-relaxed mb-6" style={{ color: TEXT1 }}>
                  {q.text}
                </p>

                {/* Slider + ticks */}
                <div>
                  <input
                    type="range" min={1} max={5} step={0.01} value={rawVal}
                    onChange={(e) => handleSlider(q.id, Number(e.target.value))}
                    className="quiz-slider w-full"
                    style={{
                      "--fill":        `${fillPct}%`,
                      "--track-fill":  isTouched ? accent : "rgba(255,255,255,0.25)",
                      "--thumb-color": isTouched ? accent : "rgba(255,255,255,0.3)",
                      "--bg-card":     CARD,
                    } as React.CSSProperties}
                  />
                  {/* Tick labels — px-[12px] offsets for half-thumb (24px) */}
                  <div className="flex justify-between px-[12px] mt-2">
                    {(["全く", "あまり", "どちらとも", "やや", "非常に"] as const).map((lbl, idx) => (
                      <span
                        key={lbl}
                        className="text-[10px] font-medium text-center w-12 -mx-6 transition-all duration-200"
                        style={{ color: (isTouched && snapScore === idx + 1) ? accent : "rgba(255,255,255,0.22)" }}
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Submit ─────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-16 relative">
        <div className="relative">
          {allAnswered && (
            <div className="absolute -inset-[1px] rounded-2xl"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", opacity: 0.5 }} />
          )}
          <button onClick={handleSubmit}
            className="relative w-full py-4 rounded-2xl font-bold text-[15px] tracking-wide transition-all duration-200"
            style={allAnswered
              ? { background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)", color: "#fff" }
              : { background: CARD, color: "rgba(255,255,255,0.2)", border: `1px dashed rgba(255,255,255,0.1)` }
            }>
            {allAnswered ? "結果を見る →" : `残り ${total - answeredCount} 問`}
          </button>
        </div>
        {!allAnswered && (
          <p className="text-center text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.2)" }}>
            クリックすると未回答の質問に移動します
          </p>
        )}
      </div>
    </div>
  );
}
