import Link from "next/link";

const CATEGORIES = [
  { label: "道徳・倫理的", color: "#3B82F6" },
  { label: "社会的",       color: "#10B981" },
  { label: "個人的",       color: "#8B5CF6" },
  { label: "精神的・宗教的", color: "#F59E0B" },
  { label: "経済的・物質的", color: "#EF4444" },
  { label: "審美的",       color: "#EC4899" },
  { label: "知的",         color: "#6366F1" },
];

const FEATURES = [
  "7つの価値観カテゴリをレーダーチャートで可視化",
  "マズローの欲求階層との対応を自動算出",
  "回答はブラウザ内のみ — 外部送信なし",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060D1F] flex items-center justify-center px-5 py-16 relative overflow-hidden">

      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-[-15%] left-[10%] w-[70vw] h-[70vw] max-w-2xl max-h-2xl rounded-full bg-indigo-700/20 blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[5%]  w-[55vw] h-[55vw] max-w-xl  max-h-xl  rounded-full bg-violet-700/15 blur-[110px]" />
      </div>

      <div className="relative max-w-md w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs text-gray-400 font-medium tracking-wide">42問 · 約5分</span>
        </div>

        {/* Title */}
        <h1 className="text-6xl font-black text-white tracking-tight leading-[1.05] mb-5">
          価値観
          <br />
          <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
            診断
          </span>
        </h1>

        <p className="text-gray-400 text-[15px] leading-relaxed mb-10">
          7つの軸から、あなたが大切にしているものの<br />
          構造をスコアで可視化します。
        </p>

        {/* Category badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <span
              key={c.label}
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                color: c.color,
                borderColor: `${c.color}45`,
                backgroundColor: `${c.color}12`,
              }}
            >
              {c.label}
            </span>
          ))}
        </div>

        {/* Features */}
        <ul className="text-left space-y-2 mb-10 px-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link href="/quiz">
          <div className="relative group">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 opacity-70 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
            <button className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base tracking-wide hover:from-indigo-500 hover:to-violet-500 transition-all">
              診断を始める →
            </button>
          </div>
        </Link>

      </div>
    </main>
  );
}
