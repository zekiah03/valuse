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
  | "selfActualization";

export interface Question {
  id: string;
  text: string;
  category: ValueCategory;
}

export interface Answer {
  questionId: string;
  score: number; // 1–6
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

export interface DiagnosisResult {
  categories: CategoryResult[];
  maslow: MaslowResult[];
  dominantCategories: ValueCategory[];
  dominantMaslow: MaslowStage;
}
