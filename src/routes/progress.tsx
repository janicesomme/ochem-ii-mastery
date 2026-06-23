import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  allQuestionsQuery,
  chaptersQuery,
} from "@/lib/queries";
import { topics as allTopics } from "@/lib/mock-data";
import { progress } from "@/lib/progress";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — No-Fear Ochem II" }] }),
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
    return () => window.removeEventListener("attempts-updated", h);
  }, []);

  const attempts = progress.all();
  const latestByQ = new Map<string, ReturnType<typeof progress.latestFor>>();
  for (const q of questions) latestByQ.set(q.id, progress.latestFor(q.id));

  const avg = attempts.length
    ? attempts.reduce((s, a) => s + a.score, 0) / attempts.length
    : 0;

  // Weak topics — average score per topic, only count attempted
  const topicStats = allTopics
    .map((t) => {
      const tq = questions.filter((q) => q.topic_id === t.id);
      const scored = tq
        .map((q) => latestByQ.get(q.id))
        .filter(Boolean) as NonNullable<ReturnType<typeof progress.latestFor>>[];
      const tAvg = scored.length
        ? scored.reduce((s, a) => s + a.score, 0) / scored.length
        : null;
      return { topic: t, attempted: scored.length, total: tq.length, avg: tAvg };
    })
    .filter((s) => s.attempted > 0)
    .sort((a, b) => (a.avg ?? 5) - (b.avg ?? 5));

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold inline-flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> Progress
        </h1>
        <p className="text-muted-foreground mt-2">
          Your scores so far. Aim for 5s — anything ≤1 lands in the review queue.
        </p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        <Stat label="Attempts" value={String(attempts.length)} />
        <Stat label="Unique questions" value={String(new Set(attempts.map((a) => a.question_id)).size)} />
        <Stat label="Average score" value={avg.toFixed(1)} sub="/ 5" />
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Chapter progress</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.map((c) => {
            const cq = questions.filter((q) => q.chapter_id === c.id);
            const scored = cq
              .map((q) => latestByQ.get(q.id))
              .filter(Boolean) as NonNullable<ReturnType<typeof progress.latestFor>>[];
            const done = scored.length;
            const pct = cq.length ? Math.round((done / cq.length) * 100) : 0;
            const cAvg = scored.length
              ? (scored.reduce((s, a) => s + a.score, 0) / scored.length).toFixed(1)
              : "—";
            return (
              <Link
                key={c.id}
                to="/chapter/$chapterId"
                params={{ chapterId: c.id }}
                className="panel p-4 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Ch {c.number} · {c.title}</p>
                  <span className="chip">avg {cAvg}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                  <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {done}/{cq.length} attempted
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Weak topics</h2>
        {topicStats.length === 0 ? (
          <div className="panel p-6 text-center text-sm text-muted-foreground">
            Attempt a few questions to see your weak topics here.
          </div>
        ) : (
          <div className="grid gap-2">
            {topicStats.slice(0, 6).map((s) => (
              <div key={s.topic.id} className="panel p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.topic.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.attempted}/{s.total} attempted
                  </p>
                </div>
                <span
                  className={`chip ${
                    (s.avg ?? 0) < 2
                      ? "chip-warn"
                      : (s.avg ?? 0) < 4
                        ? "chip-accent"
                        : "chip-success"
                  }`}
                >
                  avg {s.avg?.toFixed(1) ?? "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold font-display">
        {value}
        {sub && <span className="text-sm text-muted-foreground ml-1">{sub}</span>}
      </p>
    </div>
  );
}
