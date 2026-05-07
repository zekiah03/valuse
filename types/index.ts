export type ValueCategory =
  | "moral"
  | "social"
  | "personal"
  | "spiritual"
  | "economic"
  | "aesthetic"
  | "intellectual";

export type MaslowStage =
  | "safety"
  | "belonging"
  | "esteem"
  | "selfActualization"
  | "transcendence";

export type ValueArchetype =
  | "guardian"
  | "seeker"
  | "pioneer"
  | "creator"
  | "builder"
  | "harmonizer"
  | "sage";

export interface Question {
  id: string;
  text: string;
  category: ValueCategory;
}

export interface Answer {
  questionId: string;
  score: number; // 1–5
}

export interface CategoryResult {
  category: ValueCategory;
  label: string;
  score: number; // 0–100
  description: string;
  color: string;
}

export interface MaslowResult {
  stage: MaslowStage;
  label: string;
  score: number; // 0–100
  description: string;
  color: string;
}

export interface ArchetypeResult {
  archetype: ValueArchetype;
  label: string;
  subtitle: string;
  motif: string;
  description: string;
  color: string;
  affinity: number; // 0–100
  secondary?: { archetype: ValueArchetype; label: string };
}

export interface TensionPair {
  catA: ValueCategory;
  catB: ValueCategory;
  labelA: string;
  labelB: string;
  tension: number; // 0–1
  description: string;
}

export interface DiagnosisResult {
  categories: CategoryResult[];
  maslow: MaslowResult[];
  dominantCategories: ValueCategory[];
  dominantMaslow: MaslowStage;
  archetype: ArchetypeResult;
  tensions: TensionPair[];
}
