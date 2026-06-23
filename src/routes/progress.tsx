import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, Target, TrendingUp, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ReadinessRing } from "@/components/ReadinessRing";
import { allQuestionsQuery, chaptersQuery } from "@/lib/queries";
import { topics as allTopics } from "@/lib/mock-data";
import { progress, type Attempt } from "@/lib/progress";
import { daysUntil, getExam } from "@/lib/exam";
import {
  buildReviewIds,
  computeChapterStat,
  latestPerQuestion,
  statusMeta,
  type ChapterStat,
} from "@/lib/readiness";
import { ringColor } from "./index";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Overall Readiness — No-Fear Ochem II" },
      {
        name: "description",
        content:
          "Every chapter, every weak topic, every next move — on one screen.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery);
    context.queryClient.ensureQueryData(allQuestionsQuery);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p>Not found.</p>
    </AppShell>
  ),
  component: ProgressPage,
});

function ProgressPage() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);

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

  const attempts = progress.all();
  const exam = getExam();
  const latest = useMemo(() => latestPerQuestion(attempts), [attempts]);
  const reviewIds = useMemo(() => buildReviewIds(attempts), [attempts]);

  const chapterStats: ChapterStat[] = useMemo(
    () =>
      chapters.map((c) => computeChapterStat(c, questions, allTopics, latest, reviewIds)),
    [chapters, questions, latest, reviewIds],
  );

  const overall = chapterStats.length
    ? Math.round(chapterStats.reduce((s, c) => s + c.readiness, 0) / chapterStats.length)
    : 0;

  const days = daysUntil(exam.date);
  const attemptedTotal = latest.size;
  const remaining = Math.max(0, questions.length - attemptedTotal);
  const perDay = days && days > 0 ? Math.max(1, Math.ceil(remaining / days)) : null;
  const reviewTotal = reviewIds.size;

  const topicStats = useMemo(
    () =>
      allTopics
        .map((t) => {
          const tq = questions.filter((q) => q.topic_id === t.id);
          const scored = tq
            .map((q) => latest.get(q.id))
            .filter(Boolean) as Attempt[];
          const avg = scored.length
            ? scored.reduce((s, a) => s + a.score, 0) / scored.length
            : null;
          return { topic: t, attempted: scored.length, total: tq.length, avg };
        })
        .filter((s) => s.total > 0),
    [questions, latest],
  );

  const weakestChapters = [...chapterStats]
    .filter((c) => c.attempted > 0)
    .sort((a, b) => a.readiness - b.readiness)
    .slice(0, 3);

  const strongestChapters = [...chapterStats]
    .filter((c) => c.attempted > 0)
    .sort((a, b) => b.readiness - a.readiness)
    .slice(0, 3);

  const topWeakTopics = [...topicStats]
    .filter((t) => t.attempted > 0)
    .sort((a, b) => (a.avg ?? 5) - (b.avg ?? 5))
    .slice(0, 5);

  const nextChapter =
    weakestChapters[0] ??
    chapterStats.find((c) => c.attempted === 0) ??
    chapterStats[0];

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <header className="mb-6">
        <p className="chip chip-accent mb-3">
          <Target className="h-3 w-3" /> Overall readiness
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Where you stand, chapter by chapter
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Every chapter, every weak topic, your next move — visible at once.
        </p>
      </header>

      {/* Top hero */}
      <section className="panel panel-glow p-5 mb-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="shrink-0 mx-auto lg:mx-0">
            <ReadinessRing value={overall} size={170} stroke={14} color={ringColor(overall)}>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Overall
              </span>
              <span className="font-display text-4xl font-semibold leading-none mt-1">
                {overall}%
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">
                target {exam.targetReadiness}%
              </span>
            </ReadinessRing>
          </div>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <HeroStat
              label="Exam in"
              value={
                days === null ? "—" : days < 0 ? "passed" : days === 0 ? "today" : `${days}d`
              }
            />
            <HeroStat
              label="Questions done"
              value={`${attemptedTotal}`}
              sub={`/ ${questions.length}`}
            />
            <HeroStat label="In review" value={`${reviewTotal}`} />
            <HeroStat
              label="Per day"
              value={perDay ? `${perDay}` : "—"}
              sub={perDay ? "to hit target" : "set exam date"}
            />
          </div>
        </div>
      </section>

      {/* Chapter readiness grid */}
      <section className="mb-8">
        <SectionHeader
          title="Chapter readiness grid"
          subtitle="One tile per chapter, color-coded by status."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapterStats.map((s) => (
            <ChapterTile key={s.ch.id} s={s} />
          ))}
        </div>
      </section>

      {/* Analytical section */}
      <section className="grid gap-3 lg:grid-cols-3 mb-8">
        <AnalysisCard
          title="Weakest chapters"
          icon={<Zap className="h-3.5 w-3.5 text-destructive" />}
          rows={weakestChapters.map((c) => ({
            label: c.ch.title,
            value: `${c.readiness}%`,
            tone: "danger" as const,
            href: { to: "/chapter/$chapterId" as const, params: { chapterId: c.ch.id } },
          }))}
          empty="No attempts yet — start anywhere."
        />
        <AnalysisCard
          title="Strongest chapters"
          icon={<TrendingUp className="h-3.5 w-3.5 text-success" />}
          rows={strongestChapters.map((c) => ({
            label: c.ch.title,
            value: `${c.readiness}%`,
            tone: "success" as const,
            href: { to: "/chapter/$chapterId" as const, params: { chapterId: c.ch.id } },
          }))}
          empty="Need a few solid attempts first."
        />
        <AnalysisCard
          title="Top weak topics"
          icon={<Zap className="h-3.5 w-3.5 text-warning" />}
          rows={topWeakTopics.map((t) => ({
            label: t.topic.title,
            value: t.avg !== null ? `${Math.round((t.avg / 5) * 100)}%` : "—",
            tone:
              t.avg !== null && t.avg < 1.5
                ? ("danger" as const)
                : ("warn" as const),
          }))}
          empty="Attempt questions to surface weak topics."
        />
      </section>

      {/* Recommended next action */}
      <section className="panel panel-glow p-5 border-primary/30">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" /> Recommended next action
        </p>
        <div className="mt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-lg">
            {nextChapter ? (
              <>
                Attack <strong>{nextChapter.ch.title}</strong>
                {nextChapter.weakest ? (
                  <> — especially <strong>{nextChapter.weakest.title}</strong></>
                ) : null}
                . You're at <strong>{nextChapter.readiness}%</strong> readiness here.
              </>
            ) : (
              <>Pick a chapter to begin.</>
            )}
          </p>
          <div className="flex flex-wrap gap-2 shrink-0">
            {nextChapter && (
              <Link
                to="/chapter/$chapterId"
                params={{ chapterId: nextChapter.ch.id }}
                className="btn-primary"
              >
                Attack weak spots <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link to="/review" className="btn-ghost">
              Review queue ({reviewTotal})
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function ChapterTile({ s }: { s: ChapterStat }) {
  const meta = statusMeta(s.status);
  const color = ringColor(s.readiness, s.status === "untested");
  return (
    <Link
      to="/chapter/$chapterId"
      params={{ chapterId: s.ch.id }}
      className="panel panel-glow p-4 hover:border-primary/40 transition-colors group relative flex flex-col"
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Chapter {s.ch.number}
        </p>
        <span className={`chip ${meta.chip}`}>{meta.label}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <ReadinessRing
          value={s.attempted === 0 ? 8 : s.readiness}
          size={78}
          stroke={8}
          color={color}
        >
          {s.attempted === 0 ? (
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              New
            </span>
          ) : (
            <span className="font-display font-semibold">{s.readiness}%</span>
          )}
        </ReadinessRing>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate">{s.ch.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {s.attempted}/{s.total} done · {s.reviewCount} review
          </p>
          {s.weakest && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Weakest: <span className="text-foreground">{s.weakest.title}</span>
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="h-1.5 bg-secondary/70 rounded-full overflow-hidden flex-1 mr-3">
          <div
            className="h-full"
            style={{ width: `${s.progress}%`, background: color }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{s.progress}%</span>
      </div>
    </Link>
  );
}

type Row = {
  label: string;
  value: string;
  tone: "success" | "warn" | "danger" | "neutral";
  href?: { to: "/chapter/$chapterId"; params: { chapterId: string } };
};

function AnalysisCard({
  title,
  icon,
  rows,
  empty,
}: {
  title: string;
  icon: React.ReactNode;
  rows: Row[];
  empty: string;
}) {
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
        {icon} {title}
      </p>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {rows.map((r, i) => {
            const chip =
              r.tone === "success"
                ? "chip-success"
                : r.tone === "warn"
                  ? "chip-warn"
                  : r.tone === "danger"
                    ? "chip-danger"
                    : "";
            const content = (
              <div className="flex items-center justify-between gap-3 py-1.5 px-2 -mx-2 rounded hover:bg-secondary/50">
                <span className="text-sm truncate">{r.label}</span>
                <span className={`chip ${chip} shrink-0`}>{r.value}</span>
              </div>
            );
            return (
              <li key={i}>
                {r.href ? (
                  <Link to={r.href.to} params={r.href.params}>
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function HeroStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 border border-border/60 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="font-display text-2xl font-semibold mt-1 leading-none">
        {value}
        {sub && <span className="text-sm text-muted-foreground font-normal ml-1">{sub}</span>}
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
