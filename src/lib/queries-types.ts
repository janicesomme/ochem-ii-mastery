export type Chapter = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Topic = {
  id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Question = {
  id: string;
  chapter_id: string;
  topic_id: string | null;
  title: string;
  prompt: string;
  question_type: string;
  difficulty: "easy" | "medium" | "hard";
  memory_trick: string | null;
  common_trap: string | null;
  sort_order: number;
};

export type Hint = {
  id: string;
  question_id: string;
  hint_level: number;
  kind: "hint" | "checklist";
  content: string;
};

export type Step = {
  id: string;
  question_id: string;
  step_number: number;
  content: string;
};

export type Answer = { id: string; question_id: string; content: string };

export type QuickSheet = {
  id: string;
  chapter_id: string | null;
  title: string;
  summary: string;
  content: string;
  sort_order: number;
};
