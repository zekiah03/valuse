import type { Answer, CategoryResult, MaslowResult, DiagnosisResult, ValueCategory, MaslowStage } from "@/types";
import { QUESTIONS } from "./questions";

const CATEGORY_META: Record<ValueCategory, { label: string; description: string; color: string }> = {
  moral: {
    label: "道徳・倫理的",
    color: "#3B82F6",
    description:
      "誠実さ・正義・思いやりを行動の軸に置いています。他者への責任感が強く、社会の公正を守ることに深くコミットしています。",
  },
  social: {
    label: "社会的",
    color: "#10B981",
    description:
      "家族・友情・コミュニティとの絆を何より大切にしています。人との繋がりの中に生きがいを見出し、協調と平等を重んじます。",
  },
  personal: {
    label: "個人的",
    color: "#8B5CF6",
    description:
      "自己実現・自律・成長を人生の中心に据えています。自分らしく生きることへの強い意志を持ち、内なる幸福を追求します。",
  },
  spiritual: {
    label: "精神的・宗教的",
    color: "#F59E0B",
    description:
      "人生の意味・超越性・内なる平和を探求しています。物質を超えた次元に価値を見出し、存在の深さを問い続けます。",
  },
  economic: {
    label: "経済的・物質的",
    color: "#EF4444",
    description:
      "安定・成功・豊かさを重要な基盤と捉えています。将来への備えと効率的な成果を意識しながら、経済的自由を目指します。",
  },
  aesthetic: {
    label: "審美的",
    color: "#EC4899",
    description:
      "美・創造性・芸術的表現に深い価値を感じています。感性を磨き、美しいものを鑑賞・創造することで人生を豊かにします。",
  },
  intellectual: {
    label: "知的",
    color: "#6366F1",
    description:
      "真理・知識・論理的探究を愛しています。好奇心旺盛で学び続けることに喜びを感じ、複雑な問いと向き合います。",
  },
};

const MASLOW_META: Record<MaslowStage, { label: string; description: string; color: string }> = {
  safety: {
    label: "安全・安定欲求",
    color: "#64748B",
    description:
      "あなたは今、経済的・物質的な安全基盤を重視しています。安定した生活を守ることが行動の根底にあります。",
  },
  belonging: {
    label: "社会的欲求（繋がり）",
    color: "#22C55E",
    description:
      "人との繋がりや帰属感を強く求めています。愛情・友情・コミュニティへの参加が活力の源になっています。",
  },
  esteem: {
    label: "承認・自尊欲求",
    color: "#3B82F6",
    description:
      "自己実現・他者からの承認・道徳的な誠実さを大切にしています。能力を発揮し、尊重される存在でいたいという欲求が強いです。",
  },
  selfActualization: {
    label: "自己実現欲求",
    color: "#A855F7",
    description:
      "知的探究・美的感動・精神的な意味の追求に向かっています。潜在能力を解放し、より高い次元の自分を目指しています。",
  },
};

function rawCategoryScore(answers: Answer[], category: ValueCategory): number {
  const relevant = QUESTIONS.filter((q) => q.category === category);
  if (relevant.length === 0) return 0;
  const total = relevant.reduce((sum, q) => {
    const ans = answers.find((a) => a.questionId === q.id);
    return sum + (ans?.score ?? 1);
  }, 0);
  return total / relevant.length; // 1–5
}

function normalize(raw: number): number {
  // Map 1–5 → 0–100
  return Math.round(((raw - 1) / 4) * 100);
}

export function computeDiagnosis(answers: Answer[]): DiagnosisResult {
  const categories = (Object.keys(CATEGORY_META) as ValueCategory[]).map(
    (cat): CategoryResult => {
      const raw = rawCategoryScore(answers, cat);
      return {
        category: cat,
        ...CATEGORY_META[cat],
        score: normalize(raw),
      };
    }
  );

  const scoreOf = (cat: ValueCategory) =>
    categories.find((c) => c.category === cat)!.score;

  // Maslow mapping (weighted averages)
  const maslowScores: Record<MaslowStage, number> = {
    safety: scoreOf("economic"),
    belonging: scoreOf("social"),
    esteem: Math.round(scoreOf("personal") * 0.55 + scoreOf("moral") * 0.45),
    selfActualization: Math.round(
      scoreOf("intellectual") * 0.35 +
        scoreOf("aesthetic") * 0.35 +
        scoreOf("spiritual") * 0.3
    ),
  };

  const maslow = (Object.keys(MASLOW_META) as MaslowStage[]).map(
    (stage): MaslowResult => ({
      stage,
      ...MASLOW_META[stage],
      score: maslowScores[stage],
    })
  );

  const sortedCats = [...categories].sort((a, b) => b.score - a.score);
  const dominantCategories = sortedCats.slice(0, 3).map((c) => c.category);

  const dominantMaslow = (Object.keys(maslowScores) as MaslowStage[]).reduce(
    (best, s) => (maslowScores[s] > maslowScores[best] ? s : best),
    "safety" as MaslowStage
  );

  return { categories, maslow, dominantCategories, dominantMaslow };
}

export { CATEGORY_META, MASLOW_META };
