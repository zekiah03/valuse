"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computeDiagnosis } from "@/lib/scoring";
import type { DiagnosisResult, Answer } from "@/types";
import dynamic from "next/dynamic";
import CategoryCard from "@/components/CategoryCard";
import MaslowChart from "@/components/MaslowChart";
import Link from "next/link";

const ValuesRadarChart = dynamic(() => import("@/components/ValuesRadarChart"), {
  ssr: false,
});

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("valuse_answers");
    if (!raw) {
      router.replace("/quiz");
      return;
    }
    try {
      const answers: Answer[] = JSON.parse(raw);
      setResult(computeDiagnosis(answers));
    } catch {
      router.replace("/quiz");
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-gray-400 text-lg">診断結果を計算中...</div>
      </div>
    );
  }

  const dominant = result.categories
    .filter((c) => result.dominantCategories.includes(c.category))
    .sort(
      (a, b) =>
        result.dominantCategories.indexOf(a.category) -
        result.dominantCategories.indexOf(b.category)
    );

  const dominantMaslowItem = result.maslow.find(
    (m) => m.stage === result.dominantMaslow
  )!;

  const sortedAll = [...result.categories].sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            あなたの価値観プロフィール
          </h1>
          <p className="text-gray-500">42問の回答から算出しました</p>
        </div>

        {/* Radar Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 text-center">
            価値観バランス
          </h2>
          <ValuesRadarChart categories={result.categories} />
        </div>

        {/* Top 3 dominant values */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            特に強い価値観 トップ3
          </h2>
          <div className="space-y-4">
            {dominant.map((cat, i) => (
              <CategoryCard key={cat.category} result={cat} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* All scores */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">
            全カテゴリのスコア
          </h2>
          <div className="space-y-4">
            {sortedAll.map((cat, i) => (
              <div key={cat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">
                    {i + 1}. {cat.label}価値観
                  </span>
                  <span className="font-bold" style={{ color: cat.color }}>
                    {cat.score}点
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${cat.score}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maslow section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            マズローの欲求階層との対応
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            あなたの価値観スコアから、今重視している欲求段階を推定しています
          </p>
          <MaslowChart maslow={result.maslow} dominant={result.dominantMaslow} />
          <div
            className="mt-6 rounded-2xl p-4 border-2"
            style={{
              borderColor: dominantMaslowItem.color,
              backgroundColor: `${dominantMaslowItem.color}10`,
            }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: dominantMaslowItem.color }}>
              最重視：{dominantMaslowItem.label}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {dominantMaslowItem.description}
            </p>
          </div>
        </div>

        {/* Retry */}
        <div className="text-center pb-6">
          <Link
            href="/quiz"
            onClick={() => localStorage.removeItem("valuse_answers")}
            className="inline-block border-2 border-indigo-300 text-indigo-600 font-bold px-8 py-3 rounded-2xl hover:bg-indigo-50 transition-colors"
          >
            もう一度診断する
          </Link>
        </div>
      </div>
    </main>
  );
}
