import Link from "next/link";

const CATEGORIES = [
  { label: "道徳・倫理的",   color: "#3B82F6" },
  { label: "社会的",         color: "#10B981" },
  { label: "個人的",         color: "#8B5CF6" },
  { label: "精神的・宗教的", color: "#F59E0B" },
  { label: "経済的・物質的", color: "#EF4444" },
  { label: "審美的",         color: "#EC4899" },
  { label: "知的",           color: "#6366F1" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center px-5 py-16 relative overflow-hidden">

      <div className="max-w-sm w-full">

        {/* Badge */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-medium tracking-wide" style={{ color: "#94A3B8" }}>42問 · 約5分</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center text-[56px] font-black tracking-tighter leading-[1.0] mb-5"
          style={{ color: "#F1F5F9" }}>
          価値観
          <br />
          <span style={{
            background: "linear-gradient(135deg, #818CF8 0%, #A78BFA 50%, #F472B6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            診断
          </span>
        </h1>

        <p className="text-center text-[14px] leading-relaxed mb-10" style={{ color: "#64748B" }}>
          7つの軸から、あなたが大切にしているものの<br />
          構造をスコアで可視化します。
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {CATEGORIES.map((c) => (
            <span key={c.label} className="px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{
                color: c.color,
                border: `1px solid ${c.color}40`,
                background: `${c.color}12`,
              }}>
              {c.label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px mb-10" style={{ background: "rgba(255,255,255,0.06)" }} />

        {/* Features */}
        <ul className="space-y-3 mb-10">
          {[
            "7カテゴリのレーダーチャートで一覧表示",
            "マズロー欲求階層との対応を自動算出",
            "回答はブラウザ内のみ — 外部送信なし",
          ].map((f) => (
            <li key={f} className="flex items-center gap-3 text-[13px]" style={{ color: "#64748B" }}>
              <span className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#818CF8" }} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", opacity: 0.6 }} />
          <Link href="/quiz">
            <button className="relative w-full py-[14px] rounded-2xl font-bold text-[15px] tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                color: "#fff",
              }}>
              診断を始める →
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}
