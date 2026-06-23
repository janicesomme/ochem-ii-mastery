import { queryOptions } from "@tanstack/react-query";
import {
  chapters,
  fullQuestions,
  mockChapter,
  mockQuestion,
  mockQuestionsByChapter,
  mockQuickSheet,
  mockTopicsByChapter,
  questions,
  quickSheets,
  topics,
} from "./mock-data";

export type {
  Answer,
  Chapter,
  Hint,
  Question,
  QuickSheet,
  Step,
  Topic,
} from "./queries-types";

const ok = <T,>(v: T) => Promise.resolve(v);
const req = <T,>(v: T | null, label: string) =>
  v === null
    ? Promise.reject(new Error(`${label} not found`))
    : Promise.resolve(v);

export const chaptersQuery = queryOptions({
  queryKey: ["chapters"],
  queryFn: () => ok(chapters),
});

export const chapterQuery = (id: string) =>
  queryOptions({
    queryKey: ["chapter", id],
    queryFn: () => req(mockChapter(id), "Chapter"),
  });

export const topicsByChapterQuery = (chapterId: string) =>
  queryOptions({
    queryKey: ["topics", chapterId],
    queryFn: () => ok(mockTopicsByChapter(chapterId)),
  });

export const topicQuery = (id: string) =>
  queryOptions({
    queryKey: ["topic", id],
    queryFn: () => req(topics.find((t) => t.id === id) ?? null, "Topic"),
  });

export const questionsQuery = (filters: {
  chapterId?: string;
  topicId?: string;
  questionType?: string;
  difficulty?: string;
}) =>
  queryOptions({
    queryKey: ["questions", filters],
    queryFn: () => {
      let list = filters.chapterId
        ? mockQuestionsByChapter(filters.chapterId)
        : questions;
      if (filters.topicId) list = list.filter((q) => q.topic_id === filters.topicId);
      if (filters.questionType)
        list = list.filter((q) => q.question_type === filters.questionType);
      if (filters.difficulty)
        list = list.filter((q) => q.difficulty === filters.difficulty);
      return ok(list);
    },
  });

export const allQuestionsQuery = queryOptions({
  queryKey: ["questions", "all"],
  queryFn: () => ok(questions),
});

export const questionDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["question", id],
    queryFn: async () => {
      const full = mockQuestion(id);
      if (!full) throw new Error("Question not found");
      return {
        question: full.q,
        hints: full.hints,
        steps: full.steps,
        answer: full.answer,
      };
    },
  });

export const quickSheetsQuery = queryOptions({
  queryKey: ["quick_sheets"],
  queryFn: () => ok(quickSheets),
});

export const quickSheetQuery = (id: string) =>
  queryOptions({
    queryKey: ["quick_sheet", id],
    queryFn: () => req(mockQuickSheet(id), "Quick sheet"),
  });

// re-export to keep imports stable
export { fullQuestions };
