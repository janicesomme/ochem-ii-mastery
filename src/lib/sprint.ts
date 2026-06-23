// Smart sprint engine — local/mock only. Replaces what would later come from
// Supabase: chapter analytics + per-student readiness/review counts.
//
// Inputs:
//   - chapter map (frequency, traps, priorities, high_yield)
//   - student readiness per topic (weakness)
//   - student review counts per topic (review need)
//   - days until exam (urgency)
//
// Output:
//   - SprintPlan (title, mode, mix, question ids, reason, est minutes)

import type { ChapterMap } from "./chapter-map";
import type { Question } from "./queries-types";
import { progress, type Attempt } from "./progress";
import { getExam, daysUntil } from "./exam";
import { DEMO_WEAK_SPOTS } from "./demo";

export type SprintMode = "normal" | "exam" | "panic";

export type SprintMixItem = {
  topic_id: string;
  label: string;
  planned: number;
  question_ids: string[];
  reason: "weak" | "high-yield" | "review" | "trap" | "new";
};

export type SprintPlan = {
  id: string;
  chapter_id: string;
  mode: SprintMode;
  title: string;
  reason: string;
  planned_count: number; // ideal target
  actual_count: number; // what we could actually source from the bank
  estimated_minutes: number;
  estimated_readiness_gain: number;
  mix: SprintMixItem[];
  question_ids: string[]; // ordered runner queue
  generated_at: string;
  variant: number;
};

export type TopicSignal = {
  topic_id: string;
  label: string;
  frequency_percent: number;
  readiness: number; // 0-100
  reviewCount: number;
  attempted: number;
  total: number;
};

export type ScoredTopic = TopicSignal & {
  priority: number;
  reasons: string[];
};

export type SprintSession = {
  plan: SprintPlan;
  started_at: string;
  completed_ids: string[];
  baseline_attempts: Record<string, string | null>; // qId -> last attempt timestamp at start
};

const SESSION_KEY = "nofear-ochem2-sprint-session-v1";

/* ===================== Mode ===================== */

export function modeForDays(days: number | null): SprintMode {
  if (days === null) return "normal";
  if (days <= 2) return "panic";
  if (days <= 7) return "exam";
  return "normal";
}

export function modeLabel(mode: SprintMode): string {
  return mode === "panic"
    ? "Panic Sprint"
    : mode === "exam"
      ? "Exam Sprint"
      : "Normal Sprint";
}

/* ===================== Scoring ===================== */

// priority = frequency_weight + weakness_weight + review_weight + urgency_weight
// Weights shift by mode.
function weightsFor(mode: SprintMode) {
  if (mode === "panic") return { freq: 0.45, weak: 0.3, review: 0.2, urgency: 0.05 };
  if (mode === "exam") return { freq: 0.35, weak: 0.3, review: 0.25, urgency: 0.1 };
  return { freq: 0.3, weak: 0.45, review: 0.15, urgency: 0.1 };
}

export function scoreTopics(
  signals: TopicSignal[],
  mode: SprintMode,
): ScoredTopic[] {
  const w = weightsFor(mode);
  return signals
    .map((s) => {
      const freqScore = s.frequency_percent; // 0-50ish
      const weakScore = 100 - s.readiness; // 0-100, higher = weaker
      const reviewScore = Math.min(s.reviewCount * 10, 50);
      const urgencyScore =
        mode === "panic"
          ? freqScore + (100 - s.readiness) / 2
          : mode === "exam"
            ? freqScore / 2
            : 0;
      const priority =
        w.freq * freqScore +
        w.weak * weakScore +
        w.review * reviewScore +
        w.urgency * urgencyScore;
      const reasons: string[] = [];
      if (s.frequency_percent >= 20) reasons.push("high-frequency on the exam");
      if (s.readiness > 0 && s.readiness < 60) reasons.push("your readiness is low");
      if (s.reviewCount >= 2) reasons.push("you have review items here");
      return { ...s, priority: Math.round(priority * 10) / 10, reasons };
    })
    .sort((a, b) => b.priority - a.priority);
}

/* ===================== Plan builder ===================== */

// Mode mixes (share of total). Sum to 1.
const MIXES: Record<
  SprintMode,
  {
    target: number;
    minutesPerQ: number;
    parts: { reason: SprintMixItem["reason"]; share: number }[];
  }
> = {
  normal: {
    target: 8,
    minutesPerQ: 4,
    parts: [
      { reason: "weak", share: 0.6 },
      { reason: "high-yield", share: 0.3 },
      { reason: "new", share: 0.1 },
    ],
  },
  exam: {
    target: 8,
    minutesPerQ: 4,
    parts: [
      { reason: "weak", share: 0.5 },
      { reason: "review", share: 0.3 },
      { reason: "trap", share: 0.2 },
    ],
  },
  panic: {
    target: 6,
    minutesPerQ: 5,
    parts: [
      { reason: "weak", share: 0.5 }, // high-yield weak only
      { reason: "review", share: 0.35 },
      { reason: "trap", share: 0.15 },
    ],
  },
};

function pickTopicsForReason(
  reason: SprintMixItem["reason"],
  scored: ScoredTopic[],
  trapTopicIds: Set<string>,
): ScoredTopic[] {
  if (reason === "weak") {
    // weakness-heavy ordering
    return [...scored].sort((a, b) => {
      // prioritize weak * high frequency
      const aw = (100 - a.readiness) + a.frequency_percent * 0.6;
      const bw = (100 - b.readiness) + b.frequency_percent * 0.6;
      return bw - aw;
    });
  }
  if (reason === "high-yield") {
    return [...scored].sort(
      (a, b) => b.frequency_percent - a.frequency_percent,
    );
  }
  if (reason === "review") {
    return [...scored]
      .filter((t) => t.reviewCount > 0)
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }
  if (reason === "trap") {
    return scored.filter((t) => trapTopicIds.has(t.topic_id));
  }
  // new = least attempted
  return [...scored].sort((a, b) => a.attempted - b.attempted);
}

function pickQuestion(
  pool: Question[],
  used: Set<string>,
  topicId?: string,
): Question | null {
  const sameTopic = pool.filter(
    (q) => !used.has(q.id) && (!topicId || q.topic_id === topicId),
  );
  if (sameTopic.length > 0) return sameTopic[0]!;
  // fall back to any unused chapter question
  const any = pool.find((q) => !used.has(q.id));
  return any ?? null;
}

export type RecommendArgs = {
  chapterId: string;
  chapterMap: ChapterMap;
  questions: Question[];
  examDays: number | null;
  /** topic-level readiness 0-100. Missing = treat as untested. */
  readinessByTopic?: Record<string, number>;
  /** topic-level review counts. Missing = 0 */
  reviewByTopic?: Record<string, number>;
  /** topic-level attempted counts. Missing = 0 */
  attemptedByTopic?: Record<string, number>;
  /** 0 = primary recommendation, 1+ = alternate ("Change sprint") */
  variant?: number;
};

export function recommendSprint(args: RecommendArgs): SprintPlan {
  const variant = args.variant ?? 0;
  const mode = modeForDays(args.examDays);
  const mix = MIXES[mode];

  // Build per-topic signals from chapter frequency + student data.
  const trapTopicIds = new Set(
    args.chapterMap.common_traps
      .map((t) => t.topic_id)
      .filter((x): x is string => !!x),
  );

  // Topic total counts in the bank
  const totalByTopic = new Map<string, number>();
  for (const q of args.questions) {
    if (!q.topic_id) continue;
    totalByTopic.set(q.topic_id, (totalByTopic.get(q.topic_id) ?? 0) + 1);
  }

  const signals: TopicSignal[] = args.chapterMap.frequency.map((f) => ({
    topic_id: f.topic_id,
    label: f.label,
    frequency_percent: f.frequency_percent,
    readiness: args.readinessByTopic?.[f.topic_id] ?? 0,
    reviewCount: args.reviewByTopic?.[f.topic_id] ?? 0,
    attempted: args.attemptedByTopic?.[f.topic_id] ?? 0,
    total: totalByTopic.get(f.topic_id) ?? 0,
  }));

  const scored = scoreTopics(signals, mode);

  // Allocate per-part topic + question counts.
  const target = mix.target;
  const allocations = mix.parts.map((p) => ({
    reason: p.reason,
    count: Math.max(1, Math.round(target * p.share)),
  }));
  // Adjust to hit target
  let sum = allocations.reduce((s, a) => s + a.count, 0);
  while (sum > target) {
    allocations[allocations.length - 1]!.count--;
    sum--;
  }
  while (sum < target) {
    allocations[0]!.count++;
    sum++;
  }

  // Variant tweak: rotate top topic so "Change sprint" feels different.
  const rotation = variant % Math.max(scored.length, 1);

  const mixItems: SprintMixItem[] = [];
  const used = new Set<string>();
  const orderedQids: string[] = [];

  for (const alloc of allocations) {
    const candidateTopics = pickTopicsForReason(
      alloc.reason,
      scored,
      trapTopicIds,
    );
    if (candidateTopics.length === 0) continue;

    // distribute alloc.count across top candidate topics
    const slots = alloc.count;
    const perTopic: Array<{ topic: ScoredTopic; want: number }> = [];
    // Take up to 3 topics for this part.
    const take = Math.min(3, candidateTopics.length);
    const rotated = [
      ...candidateTopics.slice(rotation % take),
      ...candidateTopics.slice(0, rotation % take),
    ];
    for (let i = 0; i < take; i++) {
      perTopic.push({ topic: rotated[i]!, want: 0 });
    }
    for (let i = 0; i < slots; i++) {
      perTopic[i % take]!.want++;
    }

    for (const pt of perTopic) {
      const picked: string[] = [];
      for (let i = 0; i < pt.want; i++) {
        const q = pickQuestion(args.questions, used, pt.topic.topic_id);
        if (!q) break;
        used.add(q.id);
        picked.push(q.id);
        orderedQids.push(q.id);
      }
      if (picked.length > 0) {
        // Merge into existing item with same topic+reason
        const existing = mixItems.find(
          (m) => m.topic_id === pt.topic.topic_id && m.reason === alloc.reason,
        );
        if (existing) {
          existing.planned += pt.want;
          existing.question_ids.push(...picked);
        } else {
          mixItems.push({
            topic_id: pt.topic.topic_id,
            label: pt.topic.label,
            planned: pt.want,
            question_ids: picked,
            reason: alloc.reason,
          });
        }
      } else if (pt.want > 0) {
        // No questions available — still show planned in the card honestly
        mixItems.push({
          topic_id: pt.topic.topic_id,
          label: pt.topic.label,
          planned: pt.want,
          question_ids: [],
          reason: alloc.reason,
        });
      }
    }
  }

  const top = scored[0];
  const reasonParts: string[] = [];
  if (top) {
    if (top.frequency_percent >= 20)
      reasonParts.push(`${top.label} is ${top.frequency_percent}% of exam questions`);
    if (top.readiness > 0 && top.readiness < 60)
      reasonParts.push(`your readiness there is ${top.readiness}%`);
    if (top.reviewCount >= 2)
      reasonParts.push(`${top.reviewCount} review items waiting`);
  }
  if (mode === "panic") reasonParts.push("exam is within 2 days — high-yield only");
  else if (mode === "exam") reasonParts.push("exam within a week — locking in weak spots");

  const reason =
    reasonParts.length > 0
      ? `Recommended because ${reasonParts.join(", ")}.`
      : "Balanced practice across this chapter's weak and high-yield topics.";

  const title = sprintTitle(args.chapterMap, mode, variant);

  const actual = orderedQids.length;
  const estMinutes = actual * mix.minutesPerQ;

  // Mock estimated readiness gain
  const gain =
    mode === "panic"
      ? Math.min(8, actual)
      : mode === "exam"
        ? Math.min(10, actual + 2)
        : Math.min(12, actual + 3);

  return {
    id: `sprint-${args.chapterId}-${Date.now()}-${variant}`,
    chapter_id: args.chapterId,
    mode,
    title,
    reason,
    planned_count: target,
    actual_count: actual,
    estimated_minutes: estMinutes,
    estimated_readiness_gain: gain,
    mix: mixItems,
    question_ids: orderedQids,
    generated_at: new Date().toISOString(),
    variant,
  };
}

function sprintTitle(
  map: ChapterMap,
  mode: SprintMode,
  variant: number,
): string {
  const tag =
    mode === "panic" ? "Panic" : mode === "exam" ? "Exam-Week" : "Rescue";
  // Short chapter nickname
  const nick = chapterNick(map.chapter_id);
  const variantTag = variant === 0 ? "" : variant === 1 ? " · Mix B" : " · Mix C";
  return `${nick} ${tag} Sprint${variantTag}`;
}

function chapterNick(id: string): string {
  switch (id) {
    case "ch-1":
      return "Sub/Elim";
    case "ch-2":
      return "Alkenes";
    case "ch-3":
      return "EAS";
    case "ch-4":
      return "Alcohols";
    case "ch-5":
      return "Carbonyl";
    case "ch-6":
      return "Acyl";
    default:
      return "Chapter";
  }
}

export function reasonLabel(reason: SprintMixItem["reason"]): string {
  return reason === "weak"
    ? "Weak topic"
    : reason === "high-yield"
      ? "High-yield"
      : reason === "review"
        ? "Review"
        : reason === "trap"
          ? "Trap drill"
          : "New";
}

/* ===================== Student signals (mock-friendly) ===================== */

// Build readiness/review/attempted per topic from real attempts when present;
// otherwise fall back to demo weak spots.
export function buildStudentSignals(
  chapterId: string,
  questions: Question[],
  attempts: Attempt[],
): {
  readinessByTopic: Record<string, number>;
  reviewByTopic: Record<string, number>;
  attemptedByTopic: Record<string, number>;
  demoActive: boolean;
} {
  const demoActive = attempts.length === 0;
  if (demoActive) {
    const readiness: Record<string, number> = {};
    const review: Record<string, number> = {};
    const attempted: Record<string, number> = {};
    for (const w of DEMO_WEAK_SPOTS) {
      readiness[w.id] = w.readiness;
      attempted[w.id] = w.attempted;
      // mock review: ~1 per 25% missing readiness
      review[w.id] = Math.max(0, Math.round((100 - w.readiness) / 25));
    }
    return {
      readinessByTopic: readiness,
      reviewByTopic: review,
      attemptedByTopic: attempted,
      demoActive,
    };
  }

  const latest = new Map<string, Attempt>();
  for (const a of attempts) latest.set(a.question_id, a);

  const readiness: Record<string, number> = {};
  const review: Record<string, number> = {};
  const attempted: Record<string, number> = {};
  const sums: Record<string, { earned: number; n: number }> = {};

  for (const q of questions.filter((q) => q.chapter_id === chapterId)) {
    const a = latest.get(q.id);
    if (!a) continue;
    const tid = q.topic_id;
    if (!tid) continue;
    const hintPenalty = Math.min(a.hints_used * 0.05, 0.15);
    const solPenalty = a.used_solution ? 0.1 : 0;
    const earned = Math.max(0, a.score / 5 - hintPenalty - solPenalty);
    const acc = sums[tid] ?? { earned: 0, n: 0 };
    acc.earned += earned;
    acc.n += 1;
    sums[tid] = acc;
    attempted[tid] = (attempted[tid] ?? 0) + 1;
    if (a.score <= 1 || a.used_solution || a.hints_used >= 2) {
      review[tid] = (review[tid] ?? 0) + 1;
    }
  }
  for (const [tid, s] of Object.entries(sums)) {
    readiness[tid] = Math.round((s.earned / s.n) * 100);
  }
  return {
    readinessByTopic: readiness,
    reviewByTopic: review,
    attemptedByTopic: attempted,
    demoActive,
  };
}

export function currentExamDays(): number | null {
  return daysUntil(getExam().date);
}

/* ===================== Session storage ===================== */

function readSession(): SprintSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SprintSession) : null;
  } catch {
    return null;
  }
}

function writeSession(s: SprintSession | null) {
  if (typeof window === "undefined") return;
  if (s === null) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("sprint-updated"));
}

export const sprintSession = {
  get: readSession,
  start(plan: SprintPlan) {
    const baseline: Record<string, string | null> = {};
    for (const qid of plan.question_ids) {
      const last = progress.latestFor(qid);
      baseline[qid] = last?.created_at ?? null;
    }
    writeSession({
      plan,
      started_at: new Date().toISOString(),
      completed_ids: [],
      baseline_attempts: baseline,
    });
  },
  end() {
    writeSession(null);
  },
  /** Recompute completed_ids from current attempts vs baseline */
  syncCompletions(): SprintSession | null {
    const s = readSession();
    if (!s) return null;
    const done: string[] = [];
    for (const qid of s.plan.question_ids) {
      const last = progress.latestFor(qid);
      const baseline = s.baseline_attempts[qid] ?? null;
      if (last && last.created_at !== baseline) done.push(qid);
    }
    if (done.length === s.completed_ids.length) return s;
    const next = { ...s, completed_ids: done };
    writeSession(next);
    return next;
  },
};

/* ===================== Summary ===================== */

export type SprintSummary = {
  total: number;
  attempted: number;
  avgScorePct: number;
  weakestTopic: { topic_id: string; label: string; avg: number } | null;
  toReview: { question_id: string; reason: string }[];
  readinessChange: number;
};

export function summarizeSprint(
  session: SprintSession,
  questions: Question[],
  chapterMap: ChapterMap,
): SprintSummary {
  const attemptsByQ = new Map<string, Attempt>();
  for (const qid of session.plan.question_ids) {
    const last = progress.latestFor(qid);
    const baseline = session.baseline_attempts[qid] ?? null;
    if (last && last.created_at !== baseline) attemptsByQ.set(qid, last);
  }
  const attempted = attemptsByQ.size;
  let earnedSum = 0;
  for (const a of attemptsByQ.values()) earnedSum += a.score / 5;
  const avg = attempted === 0 ? 0 : Math.round((earnedSum / attempted) * 100);

  // weakest topic in this sprint
  const topicSums = new Map<string, { earned: number; n: number }>();
  for (const [qid, a] of attemptsByQ.entries()) {
    const q = questions.find((x) => x.id === qid);
    if (!q || !q.topic_id) continue;
    const acc = topicSums.get(q.topic_id) ?? { earned: 0, n: 0 };
    acc.earned += a.score / 5;
    acc.n += 1;
    topicSums.set(q.topic_id, acc);
  }
  let weakest: SprintSummary["weakestTopic"] = null;
  for (const [tid, s] of topicSums.entries()) {
    const avgT = s.earned / s.n;
    const label =
      chapterMap.frequency.find((f) => f.topic_id === tid)?.label ?? tid;
    if (!weakest || avgT < weakest.avg)
      weakest = { topic_id: tid, label, avg: avgT };
  }

  const toReview: SprintSummary["toReview"] = [];
  for (const [qid, a] of attemptsByQ.entries()) {
    if (a.score <= 1) toReview.push({ question_id: qid, reason: "missed" });
    else if (a.used_solution)
      toReview.push({ question_id: qid, reason: "used solution" });
    else if (a.hints_used >= 2)
      toReview.push({ question_id: qid, reason: `${a.hints_used} hints` });
  }

  // Mocked readiness change: average earned * planned gain factor
  const change =
    attempted === 0
      ? 0
      : Math.round(
          (earnedSum / attempted) *
            (session.plan.estimated_readiness_gain / 1.2),
        );

  return {
    total: session.plan.question_ids.length,
    attempted,
    avgScorePct: avg,
    weakestTopic: weakest,
    toReview,
    readinessChange: change,
  };
}
