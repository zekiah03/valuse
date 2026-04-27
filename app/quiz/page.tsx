"use client";

import { useState, useEffect, useRef } from "react";
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

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState(() => shuffleQuestions(QUESTIONS));
  const [answers, setAnswers]     = useState<Answer[]>([]);
  const [touched, setTouched]     = useState<Set<string>>(new Set());
  const [shakeIdx, setShakeIdx]   = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const answeredCount = touched.size;
  const total         = questions.length;
  const allAnswered   = answeredCount === total;
  const progress      = (answeredCount / total) * 100;

  const handleSlider = (questionId: string, score: number) => {
    setTouched((prev) => new Set(prev).add(questionId));
    setAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== questionId),
      { questionId, score },
    ]);
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
    <div className="min-h-screen bg-[#F5F6FA]">

      {/* ── Sticky header ───────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-800 tracking-tight">価値観診断</span>
            <span className="text-xs text-gray-400 tabular-nums">
              <span className="font-bold text-gray-700">{answeredCount}</span> / {total}
            </span>
          </div>
          {/* Gradient progress bar */}
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(to right, #6366F1, #8B5CF6, #EC4899)",
              }}
            />
          </div>
        </div>
      </header>

      {/* ── Question list ───────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-4 space-y-3">
        {questions.map((q, i) => {
          const answer    = answers.find((a) => a.questionId === q.id);
          const isTouched = touched.has(q.id);
          const score     = answer?.score ?? 3;
          const fillPct   = ((score - 1) / 4) * 100;
          const accent    = CATEGORY_COLORS[q.category];

          return (
            <div
              key={q.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`
                bg-white rounded-2xl overflow-hidden
                transition-all duration-300
                ${isTouched
                  ? "shadow-md shadow-black/5 border border-gray-100"
                  : "shadow-sm border border-gray-100/80"}
                ${shakeIdx === i ? "animate-shake ring-2 ring-rose-300" : ""}
              `}
            >
              {/* Colored top accent line */}
              <div className="h-[3px]" style={{ backgroundColor: isTouched ? accent : "#E5E7EB" }} />

              <div className="px-6 py-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-gray-300">
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  {isTouched && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: accent }}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Question text */}
                <p className="text-[15px] font-semibold text-gray-800 leading-relaxed mb-6">
                  {q.text}
                </p>

                {/* Slider */}
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={score}
                  onChange={(e) => handleSlider(q.id, Number(e.target.value))}
                  className="quiz-slider w-full"
                  style={{
                    "--fill":        `${fillPct}%`,
                    "--track-fill":  isTouched ? accent : "#D1D5DB",
                    "--thumb-color": isTouched ? accent : "#D1D5DB",
                  } as React.CSSProperties}
                />

                {/* Labels */}
                <div className="flex justify-between items-center mt-2.5">
                  <span className="text-[10px] text-gray-400 leading-tight max-w-[80px]">全く当てはまらない</span>
                  <span
                    className={`text-[11px] font-semibold text-center transition-opacity duration-200 ${
                      isTouched ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ color: accent }}
                  >
                    {SCALE[score]}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-tight text-right max-w-[80px]">非常によく当てはまる</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Submit ──────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-16 text-center">
        <div className="relative inline-block w-full group">
          {allAnswered && (
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 opacity-60 blur-sm group-hover:opacity-80 transition-opacity duration-300" />
          )}
          <button
            onClick={handleSubmit}
            className={`relative w-full py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 ${
              allAnswered
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-[1.01]"
                : "bg-white text-gray-400 border-2 border-dashed border-gray-200 cursor-default"
            }`}
          >
            {allAnswered ? "結果を見る →" : `残り ${total - answeredCount} 問`}
          </button>
        </div>
        {!allAnswered && (
          <p className="text-xs text-gray-400 mt-3">
            クリックすると未回答の質問に移動します
          </p>
        )}
      </div>
    </div>
  );
}
