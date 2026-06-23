import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Flame,
  Repeat,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  allQuestionsQuery,
  chaptersQuery,
  quickSheetsQuery,
} from "@/lib/queries";
import { topics as allTopics } from "@/lib/mock-data";
import { progress, type Attempt } from "@/lib/progress";
import { daysUntil, getExam, setExam, type ExamSettings } from "@/lib/exam";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — No-Fear Ochem II" },
      {
        name: "description",
        content:
          "Your Ochem II study command center: exam countdown, readiness, weak spots, and today's mission.",
      },
      { property: "og:title", content: "No-Fear Ochem II — Dashboard" },
      {
        property: "og:description",
        content: "90% questions. Just enough help to get unstuck.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery);
    context.queryClient.ensureQueryData(allQuestionsQuery);
    context.queryClient.ensureQueryData(quickSheetsQuery);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">Failed to load dashboard: {error.message}</p>
    </AppShell>
  ),
  component: Dashboard,
});

function useLiveState() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    window.addEventListener("exam-updated", h);
    return () => {
      window.removeEventListener("attempts-updated", h);
      window.removeEventListener("exam-updated", h);
    };
  }, []);
  return { attempts: progress.all(), exam: getExam() };
}

function latestPerQuestion(attempts: Attempt[]): Map<string, Attempt> {
  const map = new Map<string, Attempt>();
  for (const a of attempts) map.set(a.question_id, a);
  return map;
}

function Dashboard() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);
  const { data: sheets } = useSuspenseQuery(quickSheetsQuery);
  const { attempts, exam } = useLiveState();

  const latest = useMemo(() => latestPerQuestion(attempts), [attempts]);

  // Overall readiness mock: weighted by attempts, penalize hints/solutions/missed
  const readiness = useMemo(() => {
    if (questions.length === 0) return 0;
    let earned = 0;
    for (const q of questions) {
      const a = latest.get(q.id);
      if (!a) continue;
      // Base score / 5, minor extra penalty for heavy hint use
      const hintPenalty = Math.min(a.hints_used * 0.05, 0.15);
      const solPenalty = a.used_solution ? 0.1 : 0;
      const adj = Math.max(0, a.score / 5 - hintPenalty - solPenalty);
      earned += adj;
    }
    return Math.round((earned / questions.length) * 100);
  }, [questions, latest]);

  // Review queue: missed, low score, used solution, or 2+ hints
  const reviewIds = useMemo(() => {
    const set = new Set<string>();
    for (const a of attempts) {
      if (a.score <= 1 || a.used_solution || a.hints_used >= 2) {
        set.add(a.question_id);
      }
    }
    return set;
  }, [attempts]);

  // Per-chapter rollup
  const chapterStats = chapters.map((c) => {
    const chQs = questions.filter((q) => q.chapter_id === c.id);
    const attempted = chQs.filter((q) => latest.has(q.id));
    const scoreSum = attempted.reduce((s, q) => s + (latest.get(q.id)?.score ?? 0), 0);
    const ready = chQs.length === 0 ? 0 : Math.round((scoreSum / (chQs.length * 5)) * 100);
    const reviewCount = chQs.filter((q) => reviewIds.has(q.id)).length;

    // Weakest topic in chapter
    const topicsHere = allTopics.filter((t) => t.chapter_id === c.id);
    let weakest: { title: string; avg: number } | null = null;
    for (const t of topicsHere) {
      const tQs = chQs.filter((q) => q.topic_id === t.id);
      const tAtt = tQs.map((q) => latest.get(q.id)).filter(Boolean) as Attempt[];
      if (tAtt.length === 0) continue;
      const avg = tAtt.reduce((s, a) => s + a.score, 0) / tAtt.length;
      if (!weakest || avg < weakest.avg) weakest = { title: t.title, avg };
    }
    return {
      ch: c,
      total: chQs.length,
      attempted: attempted.length,
      ready,
      reviewCount,
      weakest,
    };
  });

  // Weak spot map — lowest-avg topics across the whole app, fallback to suggested EAS topics
  const weakSpots = useMemo(() => {
    const rows = allTopics
      .map((t) => {
        const tQs = questions.filter((q) => q.topic_id === t.id);
        const tAtt = tQs.map((q) => latest.get(q.id)).filter(Boolean) as Attempt[];
        const avg = tAtt.length === 0 ? null : tAtt.reduce((s, a) => s + a.score, 0) / tAtt.length;
        return { t, avg, total: tQs.length, attempted: tAtt.length };
      })
      .filter((r) => r.total > 0);
    const withData = rows.filter((r) => r.avg !== null).sort((a, b) => (a.avg! - b.avg!));
    if (withData.length >= 3) return withData.slice(0, 4);
    // Default suggested EAS focus areas
    const suggestedIds = ["t-3a", "t-3b", "t-3c", "t-3d"];
    return rows.filter((r) => suggestedIds.includes(r.t.id));
  }, [questions, latest]);

  // Exam countdown
  const days = daysUntil(exam.date);
  const attemptedTotal = latest.size;
  const remaining = Math.max(0, questions.length - attemptedTotal);
  const perDay = days && days > 0 ? Math.max(1, Math.ceil(remaining / days)) : null;

  // Today's mission
  const reviewQs = questions.filter((q) => reviewIds.has(q.id));
  const weakestTopicsForMission = weakSpots.slice(0, 2);
  const missionTodoCount = Math.min(perDay ?? 5, Math.max(remaining, 0)) || 5;

  // Recent improvement — compare last 5 attempts avg vs previous 5
  const improvement = useMemo(() => {
    if (attempts.length < 4) return null;
    const recent = attempts.slice(-5);
    const prev = attempts.slice(-10, -5);
    if (prev.length === 0) return null;
    const avg = (xs: Attempt[]) => (xs.reduce((s, a) => s + a.score, 0) / xs.length / 5) * 100;
    const before = Math.round(avg(prev));
    const after = Math.round(avg(recent));
    return { before, after, delta: after - before };
  }, [attempts]);

  return (
    <AppShell>
      <section className="mb-6">
        <p className="chip chip-accent mb-3">
          <Sparkles className="h-3 w-3" /> Study command center
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Welcome back to Ochem II
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          How long until your exam, how ready you are, what you're weak on, and what
          to attack next — all in one place.
        </p>
      </section>

      {/* Top row: Countdown + Readiness */}
      <section className="grid gap-3 sm:grid-cols-2 mb-6">
        <ExamCountdownCard exam={exam} days={days} perDay={perDay} remaining={remaining} />
        <ReadinessCard readiness={readiness} target={exam.targetReadiness} />
      </section>

      {/* Today's mission */}
      <TodaysMission
        count={missionTodoCount}
        weakTopics={weakestTopicsForMission.map((w) => w.t.title)}
        reviewCount={reviewQs.length}
      />

      {/* Chapter progress */}
      <section className="mt-8 mb-8">
        <SectionHeader title="Chapter progress" />
        <div className="grid gap-3 sm:grid-cols-2">
          {chapterStats.map((s) => (
            <Link
              key={s.ch.id}
              to="/chapter/$chapterId"
              params={{ chapterId: s.ch.id }}
              className="panel p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chapter {s.ch.number}
                  </p>
                  <h3 className="font-semibold mt-0.5 truncate">{s.ch.title}</h3>
                </div>
                <span className="chip chip-accent shrink-0">{s.ready}% ready</span>
              </div>
              <div className="mt-3">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${s.ready}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1.5">
                  <span>{s.attempted}/{s.total} attempted</span>
                  <span>{s.reviewCount} in review</span>
                </div>
                {s.weakest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Weakest: <span className="text-foreground font-medium">{s.weakest.title}</span>
                  </p>
                )}
              </div>
              <div className="mt-3 inline-flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition">
                Practice <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Weak spot map + Review preview */}
      <section className="grid gap-3 lg:grid-cols-2 mb-8">
        <WeakSpotMap weakSpots={weakSpots} />
        <ReviewPreview reviewQs={reviewQs} latest={latest} />
      </section>

      {/* Improvement + Quick sheets */}
      <section className="grid gap-3 sm:grid-cols-2">
        <ImprovementCard improvement={improvement} />
        <Link
          to="/quick-sheets"
          className="panel p-5 hover:border-primary/40 flex flex-col"
        >
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold">Quick Sheets</h3>
          <p className="text-sm text-muted-foreground mt-1 flex-1">
            {sheets.length} short reminders — not full lessons. Refresh a rule in 30 seconds.
          </p>
          <span className="text-sm text-primary mt-3 inline-flex items-center">
            Open sheets <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </span>
        </Link>
      </section>
    </AppShell>
  );
}

/* ---------- Subcomponents ---------- */

function ExamCountdownCard({
  exam,
  days,
  perDay,
  remaining,
}: {
  exam: ExamSettings;
  days: number | null;
  perDay: number | null;
  remaining: number;
}) {
  const [editing, setEditing] = useState(!exam.date);
  const [date, setDate] = useState(exam.date ?? "");
  const [target, setTarget] = useState(String(exam.targetReadiness));

  const save = () => {
    setExam({
      date: date || null,
      targetReadiness: Math.max(0, Math.min(100, Number(target) || 80)),
    });
    setEditing(false);
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Exam countdown
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Exam date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs text-muted-foreground">Target readiness (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            />
          </label>
          <button
            onClick={save}
            className="inline-flex items-center px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-3xl font-display font-semibold">
            {days === null
              ? "Set your exam date"
              : days < 0
                ? "Exam day has passed"
                : days === 0
                  ? "Exam is today"
                  : `Exam in ${days} day${days === 1 ? "" : "s"}`}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <MiniStat label="Target" value={`${exam.targetReadiness}%`} />
            <MiniStat
              label="Per day"
              value={perDay ? `${perDay} Qs` : "—"}
              sub={perDay ? `${remaining} left` : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ReadinessCard({ readiness, target }: { readiness: number; target: number }) {
  const gap = target - readiness;
  return (
    <div className="panel p-5 flex flex-col">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <Target className="h-3.5 w-3.5" /> Overall readiness
      </p>
      <p className="mt-2 text-5xl font-display font-semibold leading-tight">
        {readiness}
        <span className="text-2xl text-muted-foreground">%</span>
      </p>
      <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden relative">
        <div
          className="h-full bg-primary"
          style={{ width: `${Math.min(100, readiness)}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-px bg-foreground/40"
          style={{ left: `${Math.min(100, target)}%` }}
          title={`Target ${target}%`}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {gap > 0
          ? `${gap}% to hit your target of ${target}%.`
          : `You're at or above your ${target}% target. Keep it sharp.`}
      </p>
    </div>
  );
}

function TodaysMission({
  count,
  weakTopics,
  reviewCount,
}: {
  count: number;
  weakTopics: string[];
  reviewCount: number;
}) {
  const topic = weakTopics[0] ?? "directing effects";
  const second = weakTopics[1] ?? "Friedel-Crafts";
  return (
    <section className="panel p-5 border-primary/30 bg-secondary/40">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5" /> Today's mission
      </p>
      <p className="mt-2 text-lg">
        Do <strong>{count}</strong> {topic} question{count === 1 ? "" : "s"},
        hit <strong>3</strong> {second} questions, and clear{" "}
        <strong>{Math.min(reviewCount, 5)}</strong> review item
        {Math.min(reviewCount, 5) === 1 ? "" : "s"}.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/question-bank"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
        >
          Start practice <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          to="/review"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-sm font-semibold"
        >
          Open review queue
        </Link>
      </div>
    </section>
  );
}

function WeakSpotMap({
  weakSpots,
}: {
  weakSpots: { t: { id: string; title: string; chapter_id: string }; avg: number | null; attempted: number; total: number }[];
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" /> Weak spot map
        </p>
        <Link
          to="/review"
          className="text-xs px-2.5 py-1 rounded-md bg-primary text-primary-foreground font-semibold"
        >
          Attack weak spots
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {weakSpots.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Attempt a few questions and your weak spots will appear here.
          </li>
        )}
        {weakSpots.map((w) => {
          const pct = w.avg === null ? null : Math.round((w.avg / 5) * 100);
          return (
            <li key={w.t.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{w.t.title}</p>
                <div className="h-1.5 mt-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive/70"
                    style={{ width: `${pct ?? 8}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                {pct === null ? "untested" : `${pct}% · ${w.attempted}/${w.total}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ReviewPreview({
  reviewQs,
  latest,
}: {
  reviewQs: { id: string; title: string; chapter_id: string }[];
  latest: Map<string, Attempt>;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <Repeat className="h-3.5 w-3.5" /> Review queue
        </p>
        <Link to="/review" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </div>
      {reviewQs.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          Nothing here yet. Missed, low-score, or hint-heavy questions land here automatically.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {reviewQs.slice(0, 5).map((q) => {
            const a = latest.get(q.id);
            const reason = !a
              ? "flagged"
              : a.score === 0
                ? "missed"
                : a.used_solution
                  ? "used solution"
                  : a.hints_used >= 2
                    ? `${a.hints_used} hints`
                    : "low score";
            return (
              <li key={q.id}>
                <Link
                  to="/question/$questionId"
                  params={{ questionId: q.id }}
                  className="flex items-center justify-between gap-3 py-1.5 rounded hover:bg-secondary/50 px-2 -mx-2"
                >
                  <span className="text-sm truncate">{q.title}</span>
                  <span className="chip chip-warn shrink-0">{reason}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ImprovementCard({
  improvement,
}: {
  improvement: { before: number; after: number; delta: number } | null;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5" /> Recent improvement
      </p>
      {!improvement ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Answer a few more questions to see your trend. Every attempt counts.
        </p>
      ) : improvement.delta >= 0 ? (
        <p className="mt-2 text-sm">
          You went from <strong>{improvement.before}%</strong> to{" "}
          <strong>{improvement.after}%</strong> over your last 5 attempts.{" "}
          <span className="text-success font-semibold">+{improvement.delta}%</span>{" "}
          — momentum is real.
        </p>
      ) : (
        <p className="mt-2 text-sm">
          Last 5 attempts: <strong>{improvement.after}%</strong> vs prior{" "}
          <strong>{improvement.before}%</strong>. Slow down on the next set and
          reach for the hint before the solution.
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-secondary/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-semibold">
        {value} {sub && <span className="text-muted-foreground font-normal">· {sub}</span>}
      </p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold mb-3 tracking-tight">{title}</h2>;
}
