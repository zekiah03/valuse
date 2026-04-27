"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import type { Question, Answer } from "@/types";
import ProgressBar from "@/components/ProgressBar";

const SCALE: { score: number; short: string; full: string }[] = [
  { score: 1, short: "全く",       full: "全く当てはまらない" },
  { score: 2, short: "ほとんど",   full: "ほとんど当てはまらない" },
  { score: 3, short: "あまり",     full: "あまり当てはまらない" },
  { score: 4, short: "どちらとも", full: "どちらとも言えない" },
  { score: 5, short: "やや",       full: "やや当てはまる" },
  { score: 6, short: "よく",       full: "よく当てはまる" },
  { score: 7, short: "非常に",     full: "非常によく当てはまる" },
];

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
    }, 180);
  }, [selected, questions, current, answers, router]);

  const goPrev = useCallback(() => {
    if (current === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setAnimating(false);
    }, 180);
  }, [current]);

  const handleSelect = useCallback((score: number) => {
    setSelected(score);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 7) handleSelect(n);
      if (e.key === "Enter" && selected !== null) goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight" && selected !== null) goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
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
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
            以下の文章はあなたにどれくらい当てはまりますか？
          </p>
          <p className="text-xl font-bold text-gray-900 leading-relaxed mb-10">
            {q.text}
          </p>

          {/* 7-button horizontal row — scrollable on narrow screens */}
          <div className="overflow-x-auto pb-1 -mx-1">
            <div className="flex gap-2 min-w-max px-1 mx-auto justify-center">
              {SCALE.map(({ score, short, full }) => {
                const isSelected = selected === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleSelect(score)}
                    title={full}
                    className={`flex flex-col items-center gap-2 w-[72px] py-3 rounded-2xl border-2 transition-all duration-150 hover:scale-105 active:scale-95 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-colors ${
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {score}
                    </span>
                    <span
                      className={`text-[10px] font-medium text-center leading-tight ${
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

          {/* Show full label of selected option */}
          <div className="mt-4 text-center h-5">
            {selected !== null && (
              <p className="text-sm font-medium text-indigo-600">
                {SCALE.find((s) => s.score === selected)?.full}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← 前へ
          </button>
          <span className="text-xs text-gray-400 hidden sm:block">
            1〜7 で選択 · Enter / → で次へ
          </span>
          <button
            onClick={goNext}
            disabled={selected === null}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLast ? "結果を見る →" : "次へ →"}
          </button>
        </div>
      </div>
    </main>
  );
}
