import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

const must = <T,>(d: T | null, label: string): T => {
  if (!d) throw new Error(`${label} not found`);
  return d;
};

export const chaptersQuery = queryOptions({
  queryKey: ["chapters"],
  queryFn: async (): Promise<Chapter[]> => {
    const { data, error } = await supabase
      .from("chapters")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const chapterQuery = (id: string) =>
  queryOptions({
    queryKey: ["chapter", id],
    queryFn: async (): Promise<Chapter> => {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return must(data, "Chapter");
    },
  });

export const topicsByChapterQuery = (chapterId: string) =>
  queryOptions({
    queryKey: ["topics", chapterId],
    queryFn: async (): Promise<Topic[]> => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("chapter_id", chapterId)
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

export const topicQuery = (id: string) =>
  queryOptions({
    queryKey: ["topic", id],
    queryFn: async (): Promise<Topic> => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return must(data, "Topic");
    },
  });

export const questionsQuery = (filters: {
  chapterId?: string;
  topicId?: string;
  questionType?: string;
  difficulty?: string;
}) =>
  queryOptions({
    queryKey: ["questions", filters],
    queryFn: async (): Promise<Question[]> => {
      let q = supabase.from("questions").select("*").order("sort_order");
      if (filters.chapterId) q = q.eq("chapter_id", filters.chapterId);
      if (filters.topicId) q = q.eq("topic_id", filters.topicId);
      if (filters.questionType) q = q.eq("question_type", filters.questionType);
      if (filters.difficulty) q = q.eq("difficulty", filters.difficulty);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Question[];
    },
  });

export const allQuestionsQuery = queryOptions({
  queryKey: ["questions", "all"],
  queryFn: async (): Promise<Question[]> => {
    const { data, error } = await supabase.from("questions").select("*");
    if (error) throw error;
    return (data ?? []) as Question[];
  },
});

export const questionDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["question", id],
    queryFn: async () => {
      const [q, hints, steps, answer] = await Promise.all([
        supabase.from("questions").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("question_hints")
          .select("*")
          .eq("question_id", id)
          .order("hint_level"),
        supabase
          .from("question_steps")
          .select("*")
          .eq("question_id", id)
          .order("step_number"),
        supabase
          .from("question_answers")
          .select("*")
          .eq("question_id", id)
          .maybeSingle(),
      ]);
      if (q.error) throw q.error;
      return {
        question: must(q.data as Question | null, "Question"),
        hints: (hints.data ?? []) as Hint[],
        steps: (steps.data ?? []) as Step[],
        answer: (answer.data ?? null) as Answer | null,
      };
    },
  });

export const quickSheetsQuery = queryOptions({
  queryKey: ["quick_sheets"],
  queryFn: async (): Promise<QuickSheet[]> => {
    const { data, error } = await supabase
      .from("quick_sheets")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return data ?? [];
  },
});

export const quickSheetQuery = (id: string) =>
  queryOptions({
    queryKey: ["quick_sheet", id],
    queryFn: async (): Promise<QuickSheet> => {
      const { data, error } = await supabase
        .from("quick_sheets")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return must(data, "Quick sheet");
    },
  });
