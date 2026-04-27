import Link from "next/link";

const CATEGORIES = [
  { label: "道徳・倫理的", color: "#3B82F6" },
  { label: "社会的", color: "#10B981" },
  { label: "個人的", color: "#8B5CF6" },
  { label: "精神的・宗教的", color: "#F59E0B" },
  { label: "経済的・物質的", color: "#EF4444" },
  { label: "審美的", color: "#EC4899" },
  { label: "知的", color: "#6366F1" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            価値観診断
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed">
            42の質問に答えて、あなたの価値観の構造を可視化します。
            <br />
            所要時間：約 <strong className="text-gray-700">8〜10 分</strong>
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            診断する価値観の軸
          </h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((c) => (
              <span
                key={c.label}
                className="text-sm px-3 py-1 rounded-full text-white font-medium"
                style={{ backgroundColor: c.color }}
              >
                {c.label}
              </span>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-5 space-y-3 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="text-indigo-500 font-bold">✦</span>
              <span>7つの価値観カテゴリをレーダーチャートで可視化</span>
            </div>
            <div className="flex gap-2">
              <span className="text-indigo-500 font-bold">✦</span>
              <span>マズローの欲求階層との対応も診断結果に表示</span>
            </div>
            <div className="flex gap-2">
              <span className="text-indigo-500 font-bold">✦</span>
              <span>回答は保存されません。ブラウザ内で完結します</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/quiz"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold px-10 py-4 rounded-2xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            診断を始める
          </Link>
          <p className="text-xs text-gray-400 mt-4">
            各質問に直感で答えてください。正解・不正解はありません。
          </p>
        </div>
      </div>
    </main>
  );
}
