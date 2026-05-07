import type {
  Answer, CategoryResult, MaslowResult, DiagnosisResult,
  ValueCategory, MaslowStage, ValueArchetype, ArchetypeResult, TensionPair,
} from "@/types";
import { QUESTIONS } from "./questions";

// ── 3-color palette ────────────────────────────────────────────────────────
// Indigo  (#6366F1) — society-oriented : moral, social
// Violet  (#8B5CF6) — self-oriented    : personal, spiritual, intellectual
// Pink    (#EC4899) — sensory/material : aesthetic, economic
const INDIGO = "#6366F1";
const VIOLET = "#8B5CF6";
const PINK   = "#EC4899";

// ── Category metadata ──────────────────────────────────────────────────────
const CATEGORY_META: Record<ValueCategory, { label: string; description: string; color: string }> = {
  moral: {
    label: "道徳・倫理的",
    color: INDIGO,
    description:
      "誠実さ・正義・思いやりを行動の軸に置いています。他者への責任感が強く、社会の公正を守ることに深くコミットしています。",
  },
  social: {
    label: "社会的",
    color: INDIGO,
    description:
      "家族・友情・コミュニティとの絆を何より大切にしています。人との繋がりの中に生きがいを見出し、協調と平等を重んじます。",
  },
  personal: {
    label: "個人的",
    color: VIOLET,
    description:
      "自己実現・自律・成長を人生の中心に据えています。自分らしく生きることへの強い意志を持ち、内なる幸福を追求します。",
  },
  spiritual: {
    label: "精神的・宗教的",
    color: VIOLET,
    description:
      "人生の意味・超越性・内なる平和を探求しています。物質を超えた次元に価値を見出し、存在の深さを問い続けます。",
  },
  intellectual: {
    label: "知的",
    color: VIOLET,
    description:
      "真理・知識・論理的探究を愛しています。好奇心旺盛で学び続けることに喜びを感じ、複雑な問いと向き合います。",
  },
  aesthetic: {
    label: "審美的",
    color: PINK,
    description:
      "美・創造性・芸術的表現に深い価値を感じています。感性を磨き、美しいものを鑑賞・創造することで人生を豊かにします。",
  },
  economic: {
    label: "経済的・物質的",
    color: PINK,
    description:
      "安定・成功・豊かさを重要な基盤と捉えています。将来への備えと効率的な成果を意識しながら、経済的自由を目指します。",
  },
};

// ── Maslow metadata — 5 stages (incl. Transcendence, Maslow 1969) ──────────
const MASLOW_META: Record<MaslowStage, { label: string; description: string; color: string }> = {
  safety: {
    label: "安全・安定欲求",
    color: "#64748B",
    description:
      "経済的・物質的な安全基盤を最優先しています。安定した生活を守ることが行動の根底にあります。",
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
      "自己実現・他者からの承認・道徳的誠実さを大切にしています。能力を発揮し、尊重される存在でいたいという欲求が強いです。",
  },
  selfActualization: {
    label: "自己実現欲求",
    color: "#A855F7",
    description:
      "知的探究・美的感動・個人的成長に向かっています。潜在能力を解放し、より高い次元の自分を目指しています。",
  },
  transcendence: {
    label: "超越欲求",
    color: "#EC4899",
    description:
      "自己を超えた精神的成長・他者への奉仕・存在の根本的意味を追求しています。マズローが晩年に示した最高段階であり、至高体験と宇宙との一体感を志向します。",
  },
};

// ── Archetype metadata ─────────────────────────────────────────────────────
type ArchetypeWeights = Record<ValueCategory, number>;

interface ArchetypeDef {
  label: string;
  subtitle: string;
  motif: string;
  description: string;
  color: string;
  weights: ArchetypeWeights;
}

const ARCHETYPE_META: Record<ValueArchetype, ArchetypeDef> = {
  guardian: {
    label: "守護者",
    subtitle: "The Guardian",
    motif: "正義と絆を守る",
    description:
      "他者の保護と倫理的秩序の維持が行動の根幹にあります。強い責任感と共同体への献身を持ち、不正を見逃せない正義感が行動の源泉です。「人は助け合って生きている」という確信のもと、共同体のために役立つことに喜びを見出します。",
    color: "#6366F1",
    weights: { moral: 0.40, social: 0.40, personal: 0.08, spiritual: 0.05, intellectual: 0.04, aesthetic: 0.02, economic: 0.01 },
  },
  seeker: {
    label: "探求者",
    subtitle: "The Seeker",
    motif: "真理と意味を問い続ける",
    description:
      "真理と意味の徹底的な探究が動機核にあります。深い好奇心・哲学的思考・内省性を持ち、「なぜ」という問いを止められません。孤独の中に豊かさを見出し、知ることと理解することそのものに喜びを感じます。",
    color: "#8B5CF6",
    weights: { intellectual: 0.40, spiritual: 0.38, personal: 0.10, moral: 0.06, aesthetic: 0.04, social: 0.01, economic: 0.01 },
  },
  pioneer: {
    label: "開拓者",
    subtitle: "The Pioneer",
    motif: "限界を試し、前へ",
    description:
      "革新・自己超越・未踏領域への挑戦を本能的に求めます。強い自律性と挑戦志向を持ち、「できない」という言葉に反発を感じます。成長そのものが目的地であり、到達点でもあります。",
    color: "#3B82F6",
    weights: { personal: 0.42, intellectual: 0.36, aesthetic: 0.08, moral: 0.06, social: 0.04, economic: 0.03, spiritual: 0.01 },
  },
  creator: {
    label: "創造者",
    subtitle: "The Creator",
    motif: "美を生み出し、世界を変える",
    description:
      "美と表現の実現・独自の美的世界の構築が動機核です。豊かな感性と創造的衝動を持ち、美しくないものに妥協できません。創ることと体験することが人生そのものであり、自分だけの美意識を守ることが誠実さの証です。",
    color: "#EC4899",
    weights: { aesthetic: 0.48, personal: 0.30, intellectual: 0.10, spiritual: 0.07, social: 0.03, moral: 0.01, economic: 0.01 },
  },
  builder: {
    label: "構築者",
    subtitle: "The Builder",
    motif: "確かな基盤の上に成功を積む",
    description:
      "目標達成・社会的成功・堅固な基盤の構築が行動を駆動します。実用主義と高い達成動機を持ち、夢見るだけでなく実現する力があります。成功を積み上げることで安心を得ながら、さらに高い目標を設定し続けます。",
    color: "#F59E0B",
    weights: { economic: 0.44, personal: 0.30, moral: 0.10, social: 0.09, intellectual: 0.05, aesthetic: 0.01, spiritual: 0.01 },
  },
  harmonizer: {
    label: "調和者",
    subtitle: "The Harmonizer",
    motif: "すべてと和をなす",
    description:
      "関係・共同体・宇宙との全体的調和の実現が動機核です。深い共感と受容性を持ち、誰もが居場所を感じられる空間を自然に作ります。対立より調和を、競争より共存を選び、目の前の人を大切にします。",
    color: "#10B981",
    weights: { social: 0.34, moral: 0.30, spiritual: 0.24, personal: 0.05, intellectual: 0.04, aesthetic: 0.02, economic: 0.01 },
  },
  sage: {
    label: "賢者",
    subtitle: "The Sage",
    motif: "知・美・霊を統合する",
    description:
      "統合的知恵の体現・存在の深みへの到達が動機核です。広く深い視野で美と真理を統合し、学問も芸術も瞑想も、すべて同じ泉から汲まれた水だと知っています。どこにいても宇宙の深みを感じています。",
    color: "#A855F7",
    weights: { intellectual: 0.35, aesthetic: 0.30, spiritual: 0.28, moral: 0.04, personal: 0.02, social: 0.01, economic: 0.00 },
  },
};

// ── Tension pairs (circumplex-based value conflicts) ───────────────────────
interface TensionDef {
  catA: ValueCategory;
  catB: ValueCategory;
  weight: number;
  description: string;
}

const TENSION_DEFS: TensionDef[] = [
  {
    catA: "economic", catB: "spiritual", weight: 0.90,
    description: "物質的成功と精神的超越という二つの極の間で、時間・エネルギーの配分に葛藤が生じやすい状態です。",
  },
  {
    catA: "economic", catB: "moral", weight: 0.80,
    description: "個人の利益と倫理的誠実さのどちらを優先するかという、利己と利他の緊張関係があります。",
  },
  {
    catA: "personal", catB: "social", weight: 0.75,
    description: "自律的な自己実現と集団への帰属・貢献の間で、独立と繋がりのバランスに揺れやすい状態です。",
  },
  {
    catA: "economic", catB: "aesthetic", weight: 0.70,
    description: "効率・実用性と美的体験の質のどちらを選ぶかという、結果志向と感性志向の葛藤です。",
  },
  {
    catA: "intellectual", catB: "economic", weight: 0.65,
    description: "純粋な知的探究と実践的な成果・収益のどちらを重視するかという、真理と有用性の緊張です。",
  },
  {
    catA: "spiritual", catB: "social", weight: 0.50,
    description: "内的探求の時間と外的な関係性の維持が、時間的・エネルギー的に競合しやすい状態です。",
  },
];

// ── Scoring helpers ────────────────────────────────────────────────────────
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
  return Math.round(((raw - 1) / 4) * 100); // 1–5 → 0–100
}

// ── Main computation ───────────────────────────────────────────────────────
export function computeDiagnosis(answers: Answer[]): DiagnosisResult {
  // Category scores
  const categories = (Object.keys(CATEGORY_META) as ValueCategory[]).map(
    (cat): CategoryResult => ({
      category: cat,
      ...CATEGORY_META[cat],
      score: normalize(rawCategoryScore(answers, cat)),
    })
  );

  const s = (cat: ValueCategory) => categories.find((c) => c.category === cat)!.score;

  // Maslow scores — 5 stages per revised theory
  const maslowScores: Record<MaslowStage, number> = {
    safety:            s("economic"),
    belonging:         s("social"),
    esteem:            Math.round(s("personal") * 0.55 + s("moral") * 0.45),
    selfActualization: Math.round(s("intellectual") * 0.40 + s("aesthetic") * 0.35 + s("personal") * 0.25),
    transcendence:     Math.round(s("spiritual") * 0.60 + s("moral") * 0.25 + s("intellectual") * 0.15),
  };

  const maslow = (Object.keys(MASLOW_META) as MaslowStage[]).map(
    (stage): MaslowResult => ({ stage, ...MASLOW_META[stage], score: maslowScores[stage] })
  );

  const dominantMaslow = (Object.keys(maslowScores) as MaslowStage[]).reduce(
    (best, stage) => (maslowScores[stage] > maslowScores[best] ? stage : best),
    "safety" as MaslowStage
  );

  // Top categories
  const sortedCats = [...categories].sort((a, b) => b.score - a.score);
  const dominantCategories = sortedCats.slice(0, 3).map((c) => c.category);

  // Archetype — affinity = weighted sum of category scores
  const affinities = (Object.keys(ARCHETYPE_META) as ValueArchetype[]).map((key) => {
    const affinity = Math.round(
      (Object.keys(ARCHETYPE_META[key].weights) as ValueCategory[]).reduce(
        (sum, cat) => sum + ARCHETYPE_META[key].weights[cat] * s(cat),
        0
      )
    );
    return { key, affinity };
  }).sort((a, b) => b.affinity - a.affinity);

  const [first, second] = affinities;
  const primaryMeta = ARCHETYPE_META[first.key];
  const archetype: ArchetypeResult = {
    archetype: first.key,
    label: primaryMeta.label,
    subtitle: primaryMeta.subtitle,
    motif: primaryMeta.motif,
    description: primaryMeta.description,
    color: primaryMeta.color,
    affinity: first.affinity,
    secondary:
      second.affinity >= first.affinity - 15
        ? { archetype: second.key, label: ARCHETYPE_META[second.key].label }
        : undefined,
  };

  // Tension analysis — circumplex-based conflicts, top 3 above threshold
  const tensions: TensionPair[] = TENSION_DEFS
    .map((def): TensionPair => ({
      catA: def.catA,
      catB: def.catB,
      labelA: CATEGORY_META[def.catA].label,
      labelB: CATEGORY_META[def.catB].label,
      tension: (s(def.catA) / 100) * (s(def.catB) / 100) * def.weight,
      description: def.description,
    }))
    .filter((t) => t.tension > 0.12)
    .sort((a, b) => b.tension - a.tension)
    .slice(0, 3);

  return { categories, maslow, dominantCategories, dominantMaslow, archetype, tensions };
}

export { CATEGORY_META, MASLOW_META, ARCHETYPE_META };

export const CATEGORY_COLORS: Record<ValueCategory, string> = Object.fromEntries(
  (Object.entries(CATEGORY_META) as [ValueCategory, { color: string }][]).map(([k, v]) => [k, v.color])
) as Record<ValueCategory, string>;
