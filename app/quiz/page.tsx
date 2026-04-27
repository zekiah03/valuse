"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import type { Question, Answer } from "@/types";
import ProgressBar from "@/components/ProgressBar";

const SCALE_LABELS: Record<number, string> = {
  1: "全く当てはまらない",
  2: "ほとんど当てはまらない",
  3: "あまり当てはまらない",
  4: "やや当てはまる",
  5: "よく当てはまる",
  6: "非常によく当てはまる",
};

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setQuestions(shuffleQuestions(QUESTIONS));
  }, []);

  const currentAnswer = answers.find(
    (a) => questions[current] && a.questionId === questions[current].id
  );

  useEffect(() => {
    setSelected(currentAnswer?.score ?? null);
  }, [current, currentAnswer]);

  const goNext = useCallback(() => {
    if (selected === null) return;
    const q = questions[current];
    const updated = answers.filter((a) => a.questionId !== q.id);
    updated.push({ questionId: q.id, score: selected });

    if (current === questions.length - 1) {
      localStorage.setItem("valuse_answers", JSON.stringify(updated));
      router.push("/results");
      return;
    }

    setAnimating(true);
    setTimeout(() => {
      setAnswers(updated);
      setCurrent((c) => c + 1);
      setAnimating(false);
    }, 200);
  }, [selected, questions, current, answers, router]);

  const goPrev = useCallback(() => {
    if (current === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setAnimating(false);
    }, 200);
  }, [current]);

  const handleSelect = useCallback(
    (score: number) => {
      setSelected(score);
    },
    []
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 6) handleSelect(n);
      if (e.key === "Enter" && selected !== null) goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleSelect, goNext, goPrev, selected]);

  if (questions.length === 0) return null;

  const q = questions[current];
  const isLast = current === questions.length - 1;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <ProgressBar current={current + 1} total={questions.length} />
        </div>

        <div
          className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6 transition-opacity duration-200 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            以下の文章はあなたにどれくらい当てはまりますか？
          </p>
          <p className="text-xl font-bold text-gray-900 leading-relaxed mb-8">
            {q.text}
          </p>

          <div className="space-y-2">
            {([1, 2, 3, 4, 5, 6] as const).map((score) => (
              <button
                key={score}
                onClick={() => handleSelect(score)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  selected === score
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                    selected === score
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {score}
                </span>
                <span
                  className={`text-sm font-medium ${
                    selected === score ? "text-indigo-700" : "text-gray-600"
                  }`}
                >
                  {SCALE_LABELS[score]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← 前の質問
          </button>
          <span className="text-xs text-gray-400">
            キーボード：1〜6で選択、Enter で次へ
          </span>
          <button
            onClick={goNext}
            disabled={selected === null}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLast ? "結果を見る →" : "次の質問 →"}
          </button>
        </div>
      </div>
    </main>
  );
}
