import type { Attempt } from "./progress";
import type { Chapter, Question, Topic } from "./queries-types";

export type ReadinessStatus = "strong" | "shaky" | "danger" | "neutral" | "untested";

export function statusFor(readiness: number, attempted: number): ReadinessStatus {
  if (attempted === 0) return "untested";
  if (readiness >= 80) return "strong";
  if (readiness >= 55) return "neutral";
  if (readiness >= 30) return "shaky";
  return "danger";
}

export function statusMeta(status: ReadinessStatus) {
  switch (status) {
    case "strong":
      return { label: "Strong", color: "var(--color-success)", chip: "chip-success" };
    case "neutral":
      return { label: "In progress", color: "var(--color-primary)", chip: "chip-accent" };
    case "shaky":
      return { label: "Shaky", color: "var(--color-warning)", chip: "chip-warn" };
    case "danger":
      return { label: "Danger", color: "var(--color-destructive)", chip: "chip-danger" };
    case "untested":
      return { label: "Untested", color: "var(--color-muted-foreground)", chip: "chip" };
  }
}

export function latestPerQuestion(attempts: Attempt[]): Map<string, Attempt> {
  const map = new Map<string, Attempt>();
  for (const a of attempts) map.set(a.question_id, a);
  return map;
}

export type ChapterStat = {
  ch: Chapter;
  total: number;
  attempted: number;
  readiness: number; // 0-100, penalized
  progress: number; // attempted / total
  reviewCount: number;
  weakest: { title: string; avg: number } | null;
  status: ReadinessStatus;
};

export function computeChapterStat(
  ch: Chapter,
  questions: Question[],
  topics: Topic[],
  latest: Map<string, Attempt>,
  reviewIds: Set<string>,
): ChapterStat {
  const chQs = questions.filter((q) => q.chapter_id === ch.id);
  let earned = 0;
  let attempted = 0;
  for (const q of chQs) {
    const a = latest.get(q.id);
    if (!a) continue;
    attempted++;
    const hintPenalty = Math.min(a.hints_used * 0.05, 0.15);
    const solPenalty = a.used_solution ? 0.1 : 0;
    earned += Math.max(0, a.score / 5 - hintPenalty - solPenalty);
  }
  const readiness = chQs.length === 0 ? 0 : Math.round((earned / chQs.length) * 100);
  const progress = chQs.length === 0 ? 0 : Math.round((attempted / chQs.length) * 100);
  const reviewCount = chQs.filter((q) => reviewIds.has(q.id)).length;

  const topicsHere = topics.filter((t) => t.chapter_id === ch.id);
  let weakest: { title: string; avg: number } | null = null;
  for (const t of topicsHere) {
    const tQs = chQs.filter((q) => q.topic_id === t.id);
    const tAtt = tQs.map((q) => latest.get(q.id)).filter(Boolean) as Attempt[];
    if (tAtt.length === 0) continue;
    const avg = tAtt.reduce((s, a) => s + a.score, 0) / tAtt.length;
    if (!weakest || avg < weakest.avg) weakest = { title: t.title, avg };
  }
  return {
    ch,
    total: chQs.length,
    attempted,
    readiness,
    progress,
    reviewCount,
    weakest,
    status: statusFor(readiness, attempted),
  };
}

export function buildReviewIds(attempts: Attempt[]): Set<string> {
  const set = new Set<string>();
  for (const a of attempts) {
    if (a.score <= 1 || a.used_solution || a.hints_used >= 2) {
      set.add(a.question_id);
    }
  }
  return set;
}
