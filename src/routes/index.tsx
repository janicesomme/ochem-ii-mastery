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
import { ReadinessRing } from "@/components/ReadinessRing";
import {
  allQuestionsQuery,
  chaptersQuery,
  quickSheetsQuery,
} from "@/lib/queries";
import { topics as allTopics } from "@/lib/mock-data";
import { progress, type Attempt } from "@/lib/progress";
import { daysUntil, getExam, setExam, type ExamSettings } from "@/lib/exam";
import {
  buildReviewIds,
  computeChapterStat,
  latestPerQuestion,
  statusMeta,
  type ChapterStat,
} from "@/lib/readiness";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — No-Fear Ochem II" },
      {
        name: "description",
        content:
          "Your Ochem II study command center: exam countdown, readiness rings, weak spots, and today's mission.",
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

function Dashboard() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);
  const { data: sheets } = useSuspenseQuery(quickSheetsQuery);
  const { attempts, exam } = useLiveState();

  const latest = useMemo(() => latestPerQuestion(attempts), [attempts]);
  const reviewIds = useMemo(() => buildReviewIds(attempts), [attempts]);

  const chapterStats: ChapterStat[] = useMemo(
    () => chapters.map((c) => computeChapterStat(c, questions, allTopics, latest, reviewIds)),
    [chapters, questions, latest, reviewIds],
  );

  const readiness = useMemo(() => {
    if (chapterStats.length === 0) return 0;
    const sum = chapterStats.reduce((s, c) => s + c.readiness, 0);
    return Math.round(sum / chapterStats.length);
  }, [chapterStats]);

  const weakSpots = useMemo(() => {
    const rows = allTopics
      .map((t) => {
        const tQs = questions.filter((q) => q.topic_id === t.id);
        const tAtt = tQs.map((q) => latest.get(q.id)).filter(Boolean) as Attempt[];
        const avg = tAtt.length === 0 ? null : tAtt.reduce((s, a) => s + a.score, 0) / tAtt.length;
        return { t, avg, total: tQs.length, attempted: tAtt.length };
      })
      .filter((r) => r.total > 0);
    const withData = rows.filter((r) => r.avg !== null).sort((a, b) => a.avg! - b.avg!);
    if (withData.length >= 3) return withData.slice(0, 5);
    const suggestedIds = ["t-3a", "t-3b", "t-3c", "t-3d", "t-5a"];
    return rows.filter((r) => suggestedIds.includes(r.t.id));
  }, [questions, latest]);

  const days = daysUntil(exam.date);
  const attemptedTotal = latest.size;
  const remaining = Math.max(0, questions.length - attemptedTotal);
  const perDay = days && days > 0 ? Math.max(1, Math.ceil(remaining / days)) : null;

  const reviewQs = questions.filter((q) => reviewIds.has(q.id));
  const weakestChapter = [...chapterStats].sort((a, b) => a.readiness - b.readiness)[0];

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

      {/* Hero: Countdown + Readiness ring + Quick stats */}
      <section className="grid gap-3 lg:grid-cols-3 mb-6">
        <ExamCountdownCard exam={exam} days={days} perDay={perDay} remaining={remaining} />
        <ReadinessHeroCard
          readiness={readiness}
          target={exam.targetReadiness}
          attempted={attemptedTotal}
          total={questions.length}
          reviewCount={reviewQs.length}
        />
      </section>

      {/* Next best action */}
      <NextBestAction
        weakestChapter={weakestChapter}
        weakestTopic={weakSpots[0]?.t.title}
        reviewCount={reviewQs.length}
        perDay={perDay}
      />

      {/* Chapter progress */}
      <section className="mt-8 mb-8">
        <SectionHeader
          title="Chapter readiness"
          subtitle="Tap a ring to keep practicing."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {chapterStats.map((s) => (
            <ChapterCard key={s.ch.id} s={s} />
          ))}
        </div>
      </section>

      {/* Weak spots + Review */}
      <section className="grid gap-3 lg:grid-cols-2 mb-8">
        <WeakSpotMap weakSpots={weakSpots} />
        <ReviewPreview reviewQs={reviewQs} latest={latest} />
      </section>

      {/* Quick sheets */}
      <section className="grid gap-3 sm:grid-cols-2">
        <ImprovementCard attempts={attempts} />
        <Link
          to="/quick-sheets"
          className="panel p-5 hover:border-primary/40 flex flex-col group transition"
        >
          <div className="flex items-center justify-between">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="chip chip-accent">{sheets.length} sheets</span>
          </div>
          <h3 className="font-semibold mt-2">Quick Sheets</h3>
          <p className="text-sm text-muted-foreground mt-1 flex-1">
            Short reminders — not full lessons. Refresh a rule in 30 seconds.
          </p>
          <span className="text-sm text-primary mt-3 inline-flex items-center group-hover:translate-x-0.5 transition">
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
    <div className="panel panel-glow p-5 relative overflow-hidden">
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" /> Exam countdown
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline relative"
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3 relative">
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
          <button onClick={save} className="btn-primary">
            Save
          </button>
        </div>
      ) : (
        <div className="mt-2 relative">
          <p className="text-4xl font-display font-semibold leading-tight">
            {days === null
              ? "Set exam date"
              : days < 0
                ? "Exam passed"
                : days === 0
                  ? "Today"
                  : (
                    <>
                      <span className="text-5xl">{days}</span>
                      <span className="text-2xl text-muted-foreground ml-2">
                        day{days === 1 ? "" : "s"}
                      </span>
                    </>
                  )}
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

function ReadinessHeroCard({
  readiness,
  target,
  attempted,
  total,
  reviewCount,
}: {
  readiness: number;
  target: number;
  attempted: number;
  total: number;
  reviewCount: number;
}) {
  const color = ringColor(readiness);
  const gap = target - readiness;
  return (
    <div className="panel panel-glow p-5 lg:col-span-2 flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
      <div className="shrink-0 relative">
        <ReadinessRing value={readiness} size={150} stroke={12} color={color}>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Ready
          </span>
          <span className="font-display text-3xl font-semibold leading-none mt-1">
            {readiness}%
          </span>
        </ReadinessRing>
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5" /> Overall readiness
        </p>
        <p className="text-base mt-2">
          {gap > 0 ? (
            <>
              <span className="font-semibold">{gap}%</span> to your target of{" "}
              <span className="font-semibold">{target}%</span>. Stack a few more attempts.
            </>
          ) : (
            <>You're at or above your <span className="font-semibold">{target}%</span> target. Keep it sharp.</>
          )}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-auto pt-4">
          <MiniStat label="Done" value={`${attempted}`} sub={`/ ${total}`} />
          <MiniStat label="Target" value={`${target}%`} />
          <MiniStat label="Review" value={`${reviewCount}`} />
        </div>
      </div>
    </div>
  );
}

function NextBestAction({
  weakestChapter,
  weakestTopic,
  reviewCount,
  perDay,
}: {
  weakestChapter?: ChapterStat;
  weakestTopic?: string;
  reviewCount: number;
  perDay: number | null;
}) {
  const target = weakestChapter;
  const count = perDay ?? 5;
  return (
    <section className="panel panel-glow p-5 border-primary/30">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-accent" /> Next best action
      </p>
      <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-lg">
          {target ? (
            <>
              Hit <strong>{count}</strong> questions in{" "}
              <strong>{target.ch.title}</strong>
              {weakestTopic ? (
                <> — focus on <strong>{weakestTopic}</strong></>
              ) : null}
              {reviewCount > 0 ? (
                <>, then clear <strong>{Math.min(reviewCount, 5)}</strong> review items.</>
              ) : "."}
            </>
          ) : (
            <>Pick any chapter and knock out {count} questions to get a baseline.</>
          )}
        </p>
        <div className="flex flex-wrap gap-2 shrink-0">
          {target ? (
            <Link
              to="/chapter/$chapterId"
              params={{ chapterId: target.ch.id }}
              className="btn-primary"
            >
              Practice this chapter <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <Link to="/question-bank" className="btn-primary">
              Open question bank <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link to="/review" className="btn-ghost">
            Review queue
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ChapterCard({ s }: { s: ChapterStat }) {
  const meta = statusMeta(s.status);
  const color = ringColor(s.readiness, s.status === "untested");
  return (
    <div className="panel panel-glow p-5 hover:border-primary/40 transition-colors group relative">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <ReadinessRing value={s.attempted === 0 ? 8 : s.readiness} size={92} stroke={9} color={color}>
            {s.attempted === 0 ? (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                New
              </span>
            ) : (
              <span className="font-display font-semibold text-lg">{s.readiness}%</span>
            )}
          </ReadinessRing>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Chapter {s.ch.number}
            </p>
            <span className={`chip ${meta.chip}`}>{meta.label}</span>
          </div>
          <h3 className="font-semibold truncate mt-0.5">{s.ch.title}</h3>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="text-foreground font-semibold">{s.attempted}</span>/{s.total} done
            </span>
            <span>
              <span className="text-foreground font-semibold">{s.reviewCount}</span> in review
            </span>
          </div>
          {s.weakest && (
            <p className="text-xs text-muted-foreground mt-1.5 truncate">
              Weakest: <span className="text-foreground font-medium">{s.weakest.title}</span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-1.5 bg-secondary/70 rounded-full overflow-hidden flex-1 mr-3">
          <div
            className="h-full transition-all"
            style={{ width: `${s.progress}%`, background: color }}
          />
        </div>
        <Link
          to="/chapter/$chapterId"
          params={{ chapterId: s.ch.id }}
          className="text-xs font-semibold text-primary inline-flex items-center gap-1 hover:gap-1.5 transition-all"
        >
          {s.attempted === 0 ? "Start" : "Resume"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
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
          <Zap className="h-3.5 w-3.5 text-warning" /> Weak spot map
        </p>
        <Link to="/review" className="btn-ghost text-xs py-1 px-2.5">
          Attack
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {weakSpots.length === 0 && (
          <li className="text-sm text-muted-foreground">
            Attempt a few questions and your weak spots will appear here.
          </li>
        )}
        {weakSpots.map((w) => {
          const pct = w.avg === null ? null : Math.round((w.avg / 5) * 100);
          const barColor = pct === null
            ? "var(--color-muted-foreground)"
            : pct < 30
              ? "var(--color-destructive)"
              : pct < 55
                ? "var(--color-warning)"
                : pct < 80
                  ? "var(--color-primary)"
                  : "var(--color-success)";
          return (
            <li key={w.t.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{w.t.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {pct === null ? "untested" : `${pct}%`}
                  </span>
                </div>
                <div className="h-2 mt-1 bg-secondary/60 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pct ?? 8}%`, background: barColor }}
                  />
                </div>
              </div>
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
          <Repeat className="h-3.5 w-3.5 text-destructive" /> Review queue
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
        <ul className="mt-3 space-y-1">
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
            const chip = !a || a.score === 0 ? "chip-danger" : "chip-warn";
            return (
              <li key={q.id}>
                <Link
                  to="/question/$questionId"
                  params={{ questionId: q.id }}
                  className="flex items-center justify-between gap-3 py-1.5 rounded hover:bg-secondary/50 px-2 -mx-2"
                >
                  <span className="text-sm truncate">{q.title}</span>
                  <span className={`chip ${chip} shrink-0`}>{reason}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ImprovementCard({ attempts }: { attempts: Attempt[] }) {
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
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 text-success" /> Recent improvement
      </p>
      {!improvement ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Answer a few more questions to see your trend. Every attempt counts.
        </p>
      ) : improvement.delta >= 0 ? (
        <p className="mt-2 text-sm">
          You went from <strong>{improvement.before}%</strong> to{" "}
          <strong>{improvement.after}%</strong> over your last 5 attempts.{" "}
          <span className="text-success font-semibold">+{improvement.delta}%</span> — momentum is real.
        </p>
      ) : (
        <p className="mt-2 text-sm">
          Last 5 attempts: <strong>{improvement.after}%</strong> vs prior{" "}
          <strong>{improvement.before}%</strong>. Slow down and reach for a hint before the full solution.
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-semibold">
        {value} {sub && <span className="text-muted-foreground font-normal">{sub}</span>}
      </p>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function ringColor(readiness: number, untested = false): string {
  if (untested) return "var(--color-muted-foreground)";
  if (readiness >= 80) return "var(--color-success)";
  if (readiness >= 55) return "var(--color-primary)";
  if (readiness >= 30) return "var(--color-warning)";
  return "var(--color-destructive)";
}
