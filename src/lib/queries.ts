import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mockQuickSheet, quickSheets } from "./mock-data";
import type {
  Answer,
  Chapter,
  Hint,
  Question,
  QuickSheet,
  Step,
  Topic,
} from "./queries-types";

export type { Answer, Chapter, Hint, Question, QuickSheet, Step, Topic } from "./queries-types";

const ok = <T,>(v: T) => Promise.resolve(v);
const req = <T,>(v: T | null, label: string) =>
  v === null
    ? Promise.reject(new Error(`${label} not found`))
    : Promise.resolve(v);

// exam_questions.difficulty is one of E / P+ / INT / ADV (a StudyOS-wide scale).
// This app's UI only has three tiers, so this is a judgment-call mapping,
// not a verified 1:1 correspondence — revisit if it reads wrong in practice.
const DIFFICULTY_MAP: Record<string, Question["difficulty"]> = {
  E: "easy",
  INT: "medium",
  "P+": "medium",
  ADV: "hard",
};

// ---- Chapters (real data: public.question_packs) ----
// question_packs is the real, live backing table — 6 rows, 286 questions total.
// janice_chapter (meant to be the display number) is NULL on every row right
// now, so "number" falls back to list position until that column gets filled in.

type PackRow = {
  id: string;
  pack: string;
  topic: string | null;
  intro: string | null;
  janice_chapter: number | null;
  question_count: number | null;
};

function toChapter(row: PackRow, index: number): Chapter {
  return {
    id: row.id,
    number: row.janice_chapter ?? index + 1,
    title: row.pack,
    description: row.intro ?? row.topic ?? null,
    sort_order: index,
  };
}

async function fetchPacks(): Promise<PackRow[]> {
  const { data, error } = await supabase
    .from("question_packs")
    .select("id, pack, topic, intro, janice_chapter, question_count")
    .order("pack", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export const chaptersQuery = queryOptions({
  queryKey: ["chapters"],
  queryFn: async (): Promise<Chapter[]> => {
    const rows = await fetchPacks();
    return rows.map(toChapter);
  },
});

export const chapterQuery = (id: string) =>
  queryOptions({
    queryKey: ["chapter", id],
    queryFn: async () => {
      const rows = await fetchPacks();
      const index = rows.findIndex((r) => r.id === id);
      return req(index === -1 ? null : toChapter(rows[index], index), "Chapter");
    },
  });

// ---- Topics ----
// There is no real sub-topic table behind exam_questions (it has a flat
// "pattern" + "topics[]" tag field, not a normalized topics table). Rather
// than invent structure that isn't there, this returns empty — every
// consumer (computeChapterStat, etc.) already handles an empty topic list
// by just skipping the topic-level breakdown, which is the honest behavior
// until real sub-topic data exists.
export const topicsByChapterQuery = (_chapterId: string) =>
  queryOptions({
    queryKey: ["topics", _chapterId],
    queryFn: (): Promise<Topic[]> => ok([]),
  });

export const topicQuery = (_id: string) =>
  queryOptions({
    queryKey: ["topic", _id],
    queryFn: (): Promise<Topic> =>
      Promise.reject(new Error("Topic not found — no topic table backs this app yet")),
  });

// ---- Questions (real data: public.exam_questions, 286 rows) ----

type ExamQuestionRow = {
  id: string;
  q_id: string | null;
  pack: string | null;
  question_type: string | null;
  difficulty: string | null;
  janice_shortcut: string | null;
  struggle_point: string | null;
  question_order: number | null;
  raw_text: string | null;
  image_url: string | null;
  answer_image_url: string | null;
  hint: string | null;
  answer_key: string | null;
};

const EXAM_QUESTION_COLUMNS =
  "id, q_id, pack, question_type, difficulty, janice_shortcut, struggle_point, question_order, raw_text, image_url, answer_image_url, hint, answer_key";

function toQuestion(row: ExamQuestionRow, chapterId: string): Question {
  return {
    id: row.id,
    chapter_id: chapterId,
    topic_id: null,
    title: row.q_id ?? (row.raw_text ? row.raw_text.slice(0, 60) : "Untitled"),
    prompt: row.raw_text ?? "",
    question_type: row.question_type ?? "unknown",
    difficulty: row.difficulty ? DIFFICULTY_MAP[row.difficulty] ?? "medium" : "medium",
    memory_trick: row.janice_shortcut ?? null,
    common_trap: row.struggle_point ?? null,
    sort_order: row.question_order ?? 0,
    question_image_url: row.image_url ?? null,
    answer_image_url: row.answer_image_url ?? null,
    mechanism_image_url: null,
    solution_image_url: null,
  };
}

// exam_questions joins to question_packs by pack NAME, not a foreign key
// column — there is no packs_id on exam_questions. This builds the
// name -> chapter_id lookup once per call so every question can carry the
// real chapter_id the rest of the app expects.
async function packNameToId(): Promise<Map<string, string>> {
  const rows = await fetchPacks();
  return new Map(rows.map((r) => [r.pack, r.id]));
}

async function chapterIdToPackName(chapterId: string): Promise<string | null> {
  const rows = await fetchPacks();
  return rows.find((r) => r.id === chapterId)?.pack ?? null;
}

export const questionsQuery = (filters: {
  chapterId?: string;
  topicId?: string;
  questionType?: string;
  difficulty?: string;
}) =>
  queryOptions({
    queryKey: ["questions", filters],
    queryFn: async (): Promise<Question[]> => {
      const nameToId = await packNameToId();
      let query = supabase.from("exam_questions").select(EXAM_QUESTION_COLUMNS);

      if (filters.chapterId) {
        const packName = await chapterIdToPackName(filters.chapterId);
        if (!packName) return [];
        query = query.eq("pack", packName);
      }
      if (filters.questionType) query = query.eq("question_type", filters.questionType);
      if (filters.difficulty) {
        const rawCodes = Object.entries(DIFFICULTY_MAP)
          .filter(([, mapped]) => mapped === filters.difficulty)
          .map(([code]) => code);
        if (rawCodes.length) query = query.in("difficulty", rawCodes);
      }
      // topicId has no real backing column to filter on yet — see topicsByChapterQuery.

      const { data, error } = await query.order("question_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) =>
        toQuestion(row as ExamQuestionRow, nameToId.get((row as ExamQuestionRow).pack ?? "") ?? ""),
      );
    },
  });

export const allQuestionsQuery = queryOptions({
  queryKey: ["questions", "all"],
  queryFn: async (): Promise<Question[]> => {
    const nameToId = await packNameToId();
    const { data, error } = await supabase.from("exam_questions").select(EXAM_QUESTION_COLUMNS);
    if (error) throw error;
    return (data ?? []).map((row) =>
      toQuestion(row as ExamQuestionRow, nameToId.get((row as ExamQuestionRow).pack ?? "") ?? ""),
    );
  },
});

export const questionDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["question", id],
    queryFn: async (): Promise<{ question: Question; hints: Hint[]; steps: Step[]; answer: Answer | null }> => {
      const nameToId = await packNameToId();
      const { data, error } = await supabase
        .from("exam_questions")
        .select(EXAM_QUESTION_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Question not found");

      const row = data as ExamQuestionRow;
      const question = toQuestion(row, nameToId.get(row.pack ?? "") ?? "");

      // exam_questions carries one hint field, not the 3-tier hint/checklist
      // structure this app's UI supports — so today every question has at
      // most one hint. (o2_eas_problems, a separate real table for the EAS
      // pack specifically, does have hint_1/hint_2/checklist_hint — a richer
      // view for that one pack is a follow-up, not wired here to avoid a
      // fragile cross-table match with no real foreign key between them.)
      const hints: Hint[] = row.hint
        ? [{ id: `${row.id}-hint-1`, question_id: row.id, hint_level: 1, kind: "hint", content: row.hint }]
        : [];

      // No step-by-step breakdown exists for exam_questions today.
      const steps: Step[] = [];

      const answer: Answer | null = row.answer_key
        ? { id: `${row.id}-answer`, question_id: row.id, content: row.answer_key }
        : null;

      return { question, hints, steps, answer };
    },
  });

// ---- Quick sheets ----
// No real backing table exists for quick sheets yet (StudyOS's project has
// nothing equivalent to the old Lovable-project quick_sheets table). Left on
// the hardcoded templates deliberately — inventing "real" data here would be
// worse than an honest placeholder. Swap this for a real table + query the
// same way chapters/questions were done above, once that content exists.
export const quickSheetsQuery = queryOptions({
  queryKey: ["quick_sheets"],
  queryFn: (): Promise<QuickSheet[]> => ok(quickSheets),
});

export const quickSheetQuery = (id: string) =>
  queryOptions({
    queryKey: ["quick_sheet", id],
    queryFn: () => req(mockQuickSheet(id), "Quick sheet"),
  });
