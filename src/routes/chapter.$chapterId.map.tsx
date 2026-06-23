import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  ListOrdered,
  Map as MapIcon,
  MessageSquare,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ReadinessRing } from "@/components/ReadinessRing";
import {
  chapterQuery,
  questionsQuery,
  topicsByChapterQuery,
} from "@/lib/queries";
import { getChapterMap, type ChapterMap } from "@/lib/chapter-map";
import { progress } from "@/lib/progress";
import {
  buildReviewIds,
  computeChapterStat,
  latestPerQuestion,
  readinessColor,
  statusMeta,
} from "@/lib/readiness";
import { demoChapterStats } from "@/lib/demo";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/chapter/$chapterId/map")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(chapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(topicsByChapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(
      questionsQuery({ chapterId: params.chapterId }),
    );
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">Failed to load battle map: {error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p>Battle map not found.</p>
    </AppShell>
  ),
  component: BattleMapPage,
});

function useLive() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    return () => window.removeEventListener("attempts-updated", h);
  }, []);
  return progress.all();
}

function BattleMapPage() {
  const { chapterId } = Route.useParams();
  const { data: chapter } = useSuspenseQuery(chapterQuery(chapterId));
  const { data: topics } = useSuspenseQuery(topicsByChapterQuery(chapterId));
  const { data: questions } = useSuspenseQuery(questionsQuery({ chapterId }));
  const attempts = useLive();

  const map = getChapterMap(chapterId);

  const latest = useMemo(() => latestPerQuestion(attempts), [attempts]);
  const reviewIds = useMemo(() => buildReviewIds(attempts), [attempts]);

  const realStat = useMemo(
    () => computeChapterStat(chapter, questions, topics, latest, reviewIds),
    [chapter, questions, topics, latest, reviewIds],
  );

  // If no real attempts yet, use the demo seed for this chapter
  const stat = useMemo(() => {
    if (attempts.length > 0) return realStat;
    const demo = demoChapterStats([chapter])[0];
    return demo ?? realStat;
  }, [attempts.length, realStat, chapter]);

  if (!map) {
    return (
      <AppShell>
        <BackLink />
        <p className="panel p-6 text-sm text-muted-foreground">
          Battle map not yet built for this chapter.
        </p>
      </AppShell>
    );
  }

  const color = readinessColor(stat.readiness, stat.attempted === 0);
  const status = statusMeta(stat.status);

  return (
    <AppShell>
      <BackLink />

      {/* Hero */}
      <section className="panel p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-5 sm:items-stretch">
          <div className="shrink-0 flex items-center justify-center sm:justify-start">
            <ReadinessRing value={stat.attempted === 0 ? 8 : stat.readiness} size={140} stroke={12} color={color}>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Ready
              </span>
              <span className="font-display text-3xl font-semibold leading-none mt-1">
                {stat.readiness}%
              </span>
            </ReadinessRing>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="chip">Chapter {chapter.number}</p>
              <span className={`chip ${status.chip}`}>{status.label}</span>
              {map.high_yield && (
                <span className="chip chip-accent">
                  <Flame className="h-3 w-3" /> High yield
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
              {chapter.title}
            </h1>
            {chapter.description && (
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {chapter.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-4 max-w-md">
              <MiniStat label="Attempted" value={`${stat.attempted}/${stat.total}`} />
              <MiniStat label="In review" value={`${stat.reviewCount}`} />
              <MiniStat label="Readiness" value={`${stat.readiness}%`} />
            </div>

            <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm inline-flex items-start gap-2 max-w-2xl">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold text-destructive">Main risk:</span>{" "}
                {map.main_risk}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to="/chapter/$chapterId"
                params={{ chapterId: chapter.id }}
                className="btn-primary"
              >
                Open Full Question Bank <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("priority")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-ghost"
              >
                Start Smart Practice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequency map */}
      <Section
        icon={Zap}
        title="Question frequency map"
        subtitle="What this chapter actually tests, by share of exam questions."
      >
        <ul className="space-y-2.5">
          {map.frequency.map((f) => (
            <li key={f.topic_id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{f.label}</span>
                <span className="text-muted-foreground text-xs">
                  {f.frequency_percent}%
                </span>
              </div>
              <div className="h-2.5 mt-1 bg-secondary/60 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${f.frequency_percent * 2.2}%`,
                    maxWidth: "100%",
                    background: frequencyColor(f.frequency_percent),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Wording decoder */}
      <Section
        icon={MessageSquare}
        title="Wording decoder"
        subtitle="Different phrasings, same skill underneath."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {map.wording_decoder.map((g) => (
            <div key={g.task} className="rounded-lg border border-border bg-surface/60 p-4">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {g.wording_patterns.map((p) => (
                  <span
                    key={p}
                    className="text-[11px] rounded-md border border-border bg-muted/40 px-2 py-1"
                  >
                    “{p}”
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5 text-primary" />
                <span>
                  <span className="font-semibold text-foreground">Task:</span> {g.task}
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5" />
                <span>
                  <span className="font-semibold text-foreground">Move:</span> {g.move}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Move map */}
      <Section
        icon={MapIcon}
        title="Move map"
        subtitle="How to attack any question in this chapter, in order."
      >
        <ol className="flex flex-wrap items-center gap-2">
          {map.move_map.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm">
                <span className="font-display text-primary font-semibold">
                  {i + 1}
                </span>
                <span>{step}</span>
              </span>
              {i < map.move_map.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* Common traps */}
      <Section
        icon={AlertTriangle}
        title="Common traps"
        subtitle="The mistakes that cost the most points."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {map.common_traps.map((t) => {
            const border =
              t.tone === "danger"
                ? "border-destructive/50 bg-destructive/10"
                : "border-warning/50 bg-warning/10";
            const dot = t.tone === "danger" ? "text-destructive" : "text-warning";
            return (
              <div key={t.title} className={`rounded-lg border p-4 ${border}`}>
                <p className={`inline-flex items-center gap-1.5 text-sm font-semibold ${dot}`}>
                  <AlertTriangle className="h-4 w-4" /> {t.title}
                </p>
                <p className="text-sm mt-1.5 text-foreground/90">{t.detail}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Practice priority */}
      <Section
        id="priority"
        icon={ListOrdered}
        title="Practice priority"
        subtitle="Attack in this order for the biggest readiness gain."
      >
        <ol className="space-y-2">
          {map.practice_priority.map((p, i) => (
            <li
              key={p.topic_id}
              className="rounded-lg border border-border bg-surface/60 p-3 flex items-start gap-3"
            >
              <span className="font-display text-2xl font-semibold text-primary w-7 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{p.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.reason}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/chapter/$chapterId"
            params={{ chapterId: chapter.id }}
            className="btn-primary"
          >
            <Sparkles className="h-4 w-4" /> Start Smart Practice
          </Link>
          <Link
            to="/chapter/$chapterId"
            params={{ chapterId: chapter.id }}
            className="btn-ghost"
          >
            Open Full Question Bank
          </Link>
        </div>
      </Section>
    </AppShell>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ChevronLeft className="h-4 w-4" /> Dashboard
    </Link>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  id,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="panel p-5 mb-5 scroll-mt-24">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-1.5 text-lg font-semibold">
            <Icon className="h-4.5 w-4.5 text-primary" /> {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-secondary/40 border border-border/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function frequencyColor(pct: number): string {
  if (pct >= 25) return "var(--color-primary)";
  if (pct >= 15) return "var(--color-accent)";
  if (pct >= 10) return "var(--color-warning)";
  return "color-mix(in oklch, var(--color-muted-foreground) 60%, transparent)";
}
