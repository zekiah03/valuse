"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import type { Question, Answer } from "@/types";

const SCALE: Record<number, string> = {
  1: "全く当てはまらない",
  2: "あまり当てはまらない",
  3: "どちらとも言えない",
  4: "やや当てはまる",
  5: "非常によく当てはまる",
};

const CATEGORY_COLOR: Record<string, string> = {
  moral:        "#3B82F6",
  social:       "#10B981",
  personal:     "#8B5CF6",
  spiritual:    "#F59E0B",
  economic:     "#EF4444",
  aesthetic:    "#EC4899",
  intellectual: "#6366F1",
};

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers]   = useState<Answer[]>([]);
  const [touched, setTouched]   = useState<Set<string>>(new Set());
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => { setQuestions(shuffleQuestions(QUESTIONS)); }, []);

  const answeredCount = touched.size;
  const total = questions.length;
  const allAnswered = answeredCount === total;

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

  if (questions.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">

      {/* Sticky progress header */}
      <div className="sticky top-0 z-10 bg-white/85 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-gray-700">価値観診断</span>
            <span>
              <span className="font-bold text-indigo-600">{answeredCount}</span>
              <span className="text-gray-400"> / {total} 問</span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions list */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {questions.map((q, i) => {
          const answer    = answers.find((a) => a.questionId === q.id);
          const isTouched = touched.has(q.id);
          const score     = answer?.score ?? 3;
          const fillPct   = ((score - 1) / 4) * 100;
          const color     = CATEGORY_COLOR[q.category];

          return (
            <div
              key={q.id}
              ref={(el) => { cardRefs.current[i] = el; }}
              className={`bg-white rounded-2xl border-2 px-6 py-5 transition-all duration-200 ${
                isTouched ? "border-indigo-100 shadow-sm" : "border-gray-100"
              } ${shakeIdx === i ? "animate-shake ring-2 ring-red-300" : ""}`}
            >
              {/* Header row */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-400 font-medium">Q{i + 1}</span>
                {isTouched && <span className="ml-auto text-xs text-indigo-500 font-semibold">✓</span>}
              </div>

              {/* Question text */}
              <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-5">
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
                  "--fill": isTouched ? `${fillPct}%` : "0%",
                  "--thumb-color": isTouched ? "#6366F1" : "#CBD5E1",
                } as React.CSSProperties}
              />

              {/* Scale labels */}
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">全く当てはまらない</span>
                {isTouched && (
                  <span className="text-[11px] font-semibold text-indigo-600 text-center">
                    {SCALE[score]}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">非常によく当てはまる</span>
              </div>
            </div>
          );
        })}

        {/* Submit */}
        <div className="pt-6 text-center pb-12">
          <button
            onClick={handleSubmit}
            className={`px-14 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              allAnswered
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] shadow-lg"
                : "bg-white text-gray-400 border-2 border-gray-200"
            }`}
          >
            {allAnswered ? "結果を見る →" : `残り ${total - answeredCount} 問`}
          </button>
          {!allAnswered && (
            <p className="text-xs text-gray-400 mt-3">クリックすると未回答の質問に移動します</p>
          )}
        </div>
      </div>
    </div>
  );
}
