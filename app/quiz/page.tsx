"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, shuffleQuestions } from "@/lib/questions";
import type { Question, Answer } from "@/types";
import ProgressBar from "@/components/ProgressBar";

const SCALE: { score: number; short: string; full: string }[] = [
  { score: 1, short: "全く",       full: "全く当てはまらない" },
  { score: 2, short: "あまり",     full: "あまり当てはまらない" },
  { score: 3, short: "どちらとも", full: "どちらとも言えない" },
  { score: 4, short: "やや",       full: "やや当てはまる" },
  { score: 5, short: "非常に",     full: "非常によく当てはまる" },
];

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [slideDir, setSlideDir] = useState<"up" | "down">("up");

  // refs for scroll / swipe cooldown
  const cooldown = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setQuestions(shuffleQuestions(QUESTIONS));
  }, []);

  const currentAnswer = answers.find(
    (a) => questions[current] && a.questionId === questions[current].id
  );
  useEffect(() => {
    setSelected(currentAnswer?.score ?? null);
  }, [current, currentAnswer]);

  const transition = useCallback(
    (dir: "up" | "down", fn: () => void) => {
      if (cooldown.current) return;
      cooldown.current = true;
      setSlideDir(dir);
      setAnimating(true);
      setTimeout(() => {
        fn();
        setAnimating(false);
        setTimeout(() => { cooldown.current = false; }, 200);
      }, 180);
    },
    []
  );

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

    transition("up", () => {
      setAnswers(updated);
      setCurrent((c) => c + 1);
    });
  }, [selected, questions, current, answers, router, transition]);

  const goPrev = useCallback(() => {
    if (current === 0) return;
    transition("down", () => setCurrent((c) => c - 1));
  }, [current, transition]);

  const handleSelect = useCallback((score: number) => {
    setSelected(score);
  }, []);

  // ── Wheel scroll navigation ──────────────────────────
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (cooldown.current) return;
      if (e.deltaY > 40 && selected !== null) goNext();
      else if (e.deltaY < -40) goPrev();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [goNext, goPrev, selected]);

  // ── Touch swipe navigation ───────────────────────────
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current === null) return;
      const delta = touchStartY.current - e.changedTouches[0].clientY;
      if (delta > 60 && selected !== null) goNext();
      else if (delta < -60) goPrev();
      touchStartY.current = null;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [goNext, goPrev, selected]);

  // ── Keyboard ─────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= 5) handleSelect(n);
      if ((e.key === "Enter" || e.key === "ArrowDown") && selected !== null) goNext();
      if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSelect, goNext, goPrev, selected]);

  if (questions.length === 0) return null;

  const q = questions[current];
  const isLast = current === questions.length - 1;

  const slideClass = animating
    ? slideDir === "up"
      ? "-translate-y-4 opacity-0"
      : "translate-y-4 opacity-0"
    : "translate-y-0 opacity-100";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <ProgressBar current={current + 1} total={questions.length} />
        </div>

        <div
          className={`bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-6 transition-all duration-180 ${slideClass}`}
          style={{ transition: "transform 0.18s ease, opacity 0.18s ease" }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">
            以下の文章はあなたにどれくらい当てはまりますか？
          </p>
          <p className="text-xl font-bold text-gray-900 leading-relaxed mb-10">
            {q.text}
          </p>

          {/* 5-button horizontal row */}
          <div className="overflow-x-auto pb-1 -mx-1">
            <div className="flex gap-3 min-w-max px-1 mx-auto justify-center">
              {SCALE.map(({ score, short, full }) => {
                const isSelected = selected === score;
                return (
                  <button
                    key={score}
                    onClick={() => handleSelect(score)}
                    title={full}
                    className={`flex flex-col items-center gap-2 w-20 py-4 rounded-2xl border-2 transition-all duration-150 hover:scale-105 active:scale-95 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold transition-colors ${
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {score}
                    </span>
                    <span
                      className={`text-[11px] font-medium text-center leading-tight ${
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

          {/* Full label of selected */}
          <div className="mt-5 text-center h-5">
            {selected !== null && (
              <p className="text-sm font-medium text-indigo-600 animate-fade-in">
                {SCALE.find((s) => s.score === selected)?.full}
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-medium text-sm hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↑ 前へ
          </button>

          <div className="flex flex-col items-center gap-1">
            {selected !== null ? (
              <div className="flex flex-col items-center gap-0.5 animate-bounce">
                <span className="block w-1 h-1 rounded-full bg-indigo-400" />
                <span className="block w-1 h-1 rounded-full bg-indigo-300" />
                <span className="block w-1 h-1 rounded-full bg-indigo-200" />
              </div>
            ) : (
              <span className="text-[11px] text-gray-400">選択すると次へ</span>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={selected === null}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLast ? "結果を見る →" : "次へ ↓"}
          </button>
        </div>
      </div>
    </main>
  );
}
