"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import type { Question, Answer } from "@/types";

const SCALE = [
  { score: 1, short: "全く",       full: "全く当てはまらない" },
  { score: 2, short: "あまり",     full: "あまり当てはまらない" },
  { score: 3, short: "どちらとも", full: "どちらとも言えない" },
  { score: 4, short: "やや",       full: "やや当てはまる" },
  { score: 5, short: "非常に",     full: "非常によく当てはまる" },
];

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
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setQuestions(shuffleQuestions(QUESTIONS));
  }, []);

  const answered = answers.length;
  const total = questions.length;
  const allAnswered = answered === total;

  const handleSelect = (questionId: string, score: number) => {
    setAnswers((prev) => {
      const rest = prev.filter((a) => a.questionId !== questionId);
      return [...rest, { questionId, score }];
    });
  };

  const handleSubmit = () => {
    if (allAnswered) {
      localStorage.setItem("valuse_answers", JSON.stringify(answers));
      router.push("/results");
      return;
    }

    // Scroll to and shake the first unanswered card
    const idx = questions.findIndex(
      (q) => !answers.find((a) => a.questionId === q.id)
    );
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
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span className="font-semibold text-gray-700">価値観診断</span>
            <span>
              <span className="font-bold text-indigo-600">{answered}</span>
              <span className="text-gray-400"> / {total} 問</span>
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${(answered / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Questions grid */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q, i) => {
            const answer = answers.find((a) => a.questionId === q.id);
            const isAnswered = !!answer;
            const isShaking = shakeIdx === i;
            const color = CATEGORY_COLOR[q.category];

            return (
              <div
                key={q.id}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={`bg-white rounded-2xl border-2 p-5 transition-all duration-200 ${
                  isAnswered ? "border-indigo-100 shadow-sm" : "border-gray-100"
                } ${isShaking ? "animate-shake ring-2 ring-red-300" : ""}`}
              >
                {/* Card header */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-400 font-medium">Q{i + 1}</span>
                  {isAnswered && (
                    <span className="ml-auto text-xs text-indigo-500 font-semibold">✓</span>
                  )}
                </div>

                {/* Question text */}
                <p className="text-sm font-semibold text-gray-800 leading-relaxed mb-4">
                  {q.text}
                </p>

                {/* 5-button scale */}
                <div className="flex gap-1.5">
                  {SCALE.map(({ score, short, full }) => {
                    const isSelected = answer?.score === score;
                    return (
                      <button
                        key={score}
                        onClick={() => handleSelect(q.id, score)}
                        title={full}
                        className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl border-2 transition-all duration-100 hover:scale-105 active:scale-95 ${
                          isSelected
                            ? "border-indigo-400 bg-indigo-50"
                            : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isSelected
                              ? "bg-indigo-500 text-white"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {score}
                        </span>
                        <span
                          className={`text-[9px] font-medium leading-tight text-center ${
                            isSelected ? "text-indigo-600" : "text-gray-400"
                          }`}
                        >
                          {short}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="mt-10 text-center pb-12">
          <button
            onClick={handleSubmit}
            className={`px-14 py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              allAnswered
                ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] shadow-lg"
                : "bg-white text-gray-400 border-2 border-gray-200 cursor-default"
            }`}
          >
            {allAnswered ? "結果を見る →" : `残り ${total - answered} 問`}
          </button>
          {!allAnswered && (
            <p className="text-xs text-gray-400 mt-3">
              クリックすると未回答の質問に移動します
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
