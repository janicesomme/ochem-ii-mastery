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
  readinessColor,
  statusFor,
  statusMeta,
  type ChapterStat,
} from "@/lib/readiness";
import {
  DEMO_COMPLETED,
  DEMO_DAYS,
  DEMO_IMPROVEMENTS,
  DEMO_OVERALL,
  DEMO_PER_DAY,
  DEMO_REVIEW,
  DEMO_REVIEW_PREVIEW,
  DEMO_TARGET,
  DEMO_TOTAL_QUESTIONS,
  DEMO_WEAK_SPOTS,
  demoChapterStats,
  type DemoWeakSpot,
} from "@/lib/demo";
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

  const demoActive = attempts.length === 0;

  const latest = useMemo(() => latestPerQuestion(attempts), [attempts]);
  const reviewIds = useMemo(() => buildReviewIds(attempts), [attempts]);

  const realChapterStats: ChapterStat[] = useMemo(
    () => chapters.map((c) => computeChapterStat(c, questions, allTopics, latest, reviewIds)),
    [chapters, questions, latest, reviewIds],
  );
  const chapterStats = demoActive ? demoChapterStats(chapters) : realChapterStats;

  const readiness = demoActive
    ? DEMO_OVERALL
    : chapterStats.length === 0
      ? 0
      : Math.round(chapterStats.reduce((s, c) => s + c.readiness, 0) / chapterStats.length);

  // Weak spots
  const realWeakSpots = useMemo(() => {
    const rows = allTopics
      .map((t) => {
        const tQs = questions.filter((q) => q.topic_id === t.id);
        const tAtt = tQs.map((q) => latest.get(q.id)).filter(Boolean) as Attempt[];
        const avg = tAtt.length === 0 ? null : tAtt.reduce((s, a) => s + a.score, 0) / tAtt.length;
        return {
          id: t.id,
          title: t.title,
          chapterId: t.chapter_id,
          readiness: avg === null ? 0 : Math.round((avg / 5) * 100),
          attempted: tAtt.length,
          total: tQs.length,
          hasData: avg !== null,
        };
      })
      .filter((r) => r.total > 0 && r.hasData)
      .sort((a, b) => a.readiness - b.readiness)
      .slice(0, 6);
    return rows;
  }, [questions, latest]);

  const weakSpots: DemoWeakSpot[] = demoActive
    ? DEMO_WEAK_SPOTS
    : realWeakSpots.map(({ id, title, chapterId, readiness, attempted, total }) => ({
        id,
        title,
        chapterId,
        readiness,
        attempted,
        total,
      }));

  const realDays = daysUntil(exam.date);
  const days = demoActive && realDays === null ? DEMO_DAYS : realDays;
  const attemptedTotal = demoActive ? DEMO_COMPLETED : latest.size;
  const totalQs = demoActive ? DEMO_TOTAL_QUESTIONS : questions.length;
  const reviewCount = demoActive ? DEMO_REVIEW : reviewIds.size;
  const remaining = Math.max(0, totalQs - attemptedTotal);
  const perDay = demoActive && realDays === null
    ? DEMO_PER_DAY
    : days && days > 0
      ? Math.max(1, Math.ceil(remaining / days))
      : null;
  const target = demoActive ? DEMO_TARGET : exam.targetReadiness;

  const reviewPreview = demoActive
    ? DEMO_REVIEW_PREVIEW
    : questions
        .filter((q) => reviewIds.has(q.id))
        .slice(0, 5)
        .map((q) => {
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
          const tone: "danger" | "warn" = !a || a.score === 0 ? "danger" : "warn";
          return { id: q.id, title: q.title, chapter_id: q.chapter_id, reason, tone };
        });

  const weakestChapter = [...chapterStats]
    .filter((c) => c.attempted > 0)
    .sort((a, b) => a.readiness - b.readiness)[0];

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
          Exam countdown, readiness, weak spots, and exactly what to attack next —
          all in one place.
        </p>
      </section>

      {/* Hero: Countdown + Readiness ring + Quick stats */}
      <section className="grid gap-3 lg:grid-cols-3 mb-6">
        <ExamCountdownCard
          exam={exam}
          days={days}
          perDay={perDay}
          remaining={remaining}
          target={target}
          demoActive={demoActive}
        />
        <ReadinessHeroCard
          readiness={readiness}
          target={target}
          attempted={attemptedTotal}
          total={totalQs}
          reviewCount={reviewCount}
        />
      </section>

      {/* Today's mission + Next best action */}
      <TodaysMission
        weakestChapter={weakestChapter}
        weakestTopic={weakSpots[0]?.title}
        reviewCount={reviewCount}
        perDay={perDay}
      />

      {/* Chapter readiness */}
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
        <ReviewPreview rows={reviewPreview} />
      </section>

      {/* Recent improvement + Quick sheets */}
      <section className="grid gap-3 sm:grid-cols-2">
        <ImprovementCard attempts={attempts} demoActive={demoActive} />
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
  target,
  demoActive,
}: {
  exam: ExamSettings;
  days: number | null;
  perDay: number | null;
  remaining: number;
  target: number;
  demoActive: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(exam.date ?? "");
  const [targetVal, setTargetVal] = useState(String(exam.targetReadiness));

  const save = () => {
    setExam({
      date: date || null,
      targetReadiness: Math.max(0, Math.min(100, Number(targetVal) || 80)),
    });
    setEditing(false);
  };

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary" /> Exam countdown
        </p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            {exam.date ? "Edit" : "Set date"}
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
              value={targetVal}
              onChange={(e) => setTargetVal(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary">Save</button>
            <button onClick={() => setEditing(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-4xl font-display font-semibold leading-tight">
            {days === null ? (
              "Set exam date"
            ) : days < 0 ? (
              "Exam passed"
            ) : days === 0 ? (
              "Today"
            ) : (
              <>
                <span className="text-5xl">{days}</span>
                <span className="text-2xl text-muted-foreground ml-2">
                  day{days === 1 ? "" : "s"}
                </span>
              </>
            )}
          </p>
          {demoActive && !exam.date && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Sample countdown — set your exam date to make it real.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <MiniStat label="Target" value={`${target}%`} />
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
  const color = readinessColor(readiness, attempted === 0);
  const status = statusMeta(statusFor(readiness, attempted));
  const gap = target - readiness;
  return (
    <div className="panel p-5 lg:col-span-2 flex flex-col sm:flex-row gap-5 items-center sm:items-stretch">
      <div className="shrink-0">
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
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-primary" /> Overall readiness
          </p>
          <span className={`chip ${status.chip}`}>{status.label}</span>
        </div>
        <p className="text-base mt-2">
          {gap > 0 ? (
            <>
              <span className="font-semibold">{gap}%</span> to your target of{" "}
              <span className="font-semibold">{target}%</span>. Stack a few more attempts.
            </>
          ) : (
            <>
              You&apos;re at or above your{" "}
              <span className="font-semibold">{target}%</span> target. Keep it sharp.
            </>
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

function TodaysMission({
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
  const count = perDay ?? 5;
  return (
    <section className="panel p-5 border-primary/40">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-accent" /> Today&apos;s mission
          </p>
          <p className="text-lg mt-2">
            {weakestChapter ? (
              <>
                Do <strong>{count}</strong> questions in{" "}
                <strong>{weakestChapter.ch.title}</strong>
                {weakestTopic ? (
                  <> — focus on <strong>{weakestTopic}</strong></>
                ) : null}
                {reviewCount > 0 ? (
                  <>, then clear <strong>{Math.min(reviewCount, 5)}</strong> review items.</>
                ) : (
                  "."
                )}
              </>
            ) : (
              <>Pick any chapter and knock out {count} questions to get a baseline.</>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1.5">
            <Target className="h-3 w-3" /> Next best action:{" "}
            {weakestChapter
              ? `attack the weakest chapter first.`
              : `start anywhere — just get reps in.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {weakestChapter ? (
            <Link
              to="/chapter/$chapterId"
              params={{ chapterId: weakestChapter.ch.id }}
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
  const color = readinessColor(s.readiness, s.status === "untested");
  return (
    <div className="panel p-5 hover:border-primary/40 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="shrink-0">
          <ReadinessRing
            value={s.attempted === 0 ? 8 : s.readiness}
            size={92}
            stroke={9}
            color={color}
          >
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
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="h-1.5 bg-secondary/70 rounded-full overflow-hidden flex-1">
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

function WeakSpotMap({ weakSpots }: { weakSpots: DemoWeakSpot[] }) {
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
          const color = readinessColor(w.readiness, w.attempted === 0);
          return (
            <li key={w.id} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{w.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {w.attempted === 0 ? "untested" : `${w.readiness}%`}
                  </span>
                </div>
                <div className="h-2 mt-1 bg-secondary/60 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${w.attempted === 0 ? 8 : w.readiness}%`, background: color }}
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
  rows,
}: {
  rows: { id: string; title: string; chapter_id: string; reason: string; tone: "danger" | "warn" }[];
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
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground mt-3">
          Nothing here yet. Missed, low-score, or hint-heavy questions land here automatically.
        </p>
      ) : (
        <ul className="mt-3 space-y-1">
          {rows.slice(0, 5).map((q) => (
            <li key={q.id}>
              <Link
                to="/question/$questionId"
                params={{ questionId: q.id }}
                className="flex items-center justify-between gap-3 py-1.5 rounded hover:bg-secondary/50 px-2 -mx-2"
              >
                <span className="text-sm truncate">{q.title}</span>
                <span
                  className={`chip ${q.tone === "danger" ? "chip-danger" : "chip-warn"} shrink-0`}
                >
                  {q.reason}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImprovementCard({
  attempts,
  demoActive,
}: {
  attempts: Attempt[];
  demoActive: boolean;
}) {
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
      {demoActive ? (
        <ul className="mt-3 space-y-1.5 text-sm">
          {DEMO_IMPROVEMENTS.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : !improvement ? (
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

// Re-export for legacy imports (progress.tsx).
export { readinessColor as ringColor } from "@/lib/readiness";
