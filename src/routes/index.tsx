import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Repeat, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  allQuestionsQuery,
  chaptersQuery,
  quickSheetsQuery,
} from "@/lib/queries";
import { progress } from "@/lib/progress";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "No-Fear Ochem II — Question Bank" },
      {
        name: "description",
        content:
          "Practice Organic Chemistry II with hundreds of questions, progressive hints, and step-by-step solutions.",
      },
      { property: "og:title", content: "No-Fear Ochem II — Question Bank" },
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
  notFoundComponent: () => (
    <AppShell>
      <p>Nothing here.</p>
    </AppShell>
  ),
  component: Dashboard,
});

function useAttempts() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    return () => window.removeEventListener("attempts-updated", h);
  }, []);
  return progress.all();
}

function Dashboard() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);
  const { data: sheets } = useSuspenseQuery(quickSheetsQuery);
  const attempts = useAttempts();

  const totalQs = questions.length;
  const attemptedIds = new Set(attempts.map((a) => a.question_id));
  const attemptedCount = attemptedIds.size;
  const avg =
    attempts.length === 0
      ? 0
      : attempts.reduce((s, a) => s + a.score, 0) / attempts.length;
  const reviewCount = new Set(
    attempts.filter((a) => a.score <= 1).map((a) => a.question_id),
  ).size;

  return (
    <AppShell>
      <section className="mb-8 sm:mb-10">
        <p className="chip chip-accent mb-3">
          <Sparkles className="h-3 w-3" /> Practice-first
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Organic Chemistry II — Question Bank
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Pick a chapter, attempt the question, then unlock hints only if you need
          them. Track your weak spots and rebuild confidence.
        </p>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <Stat label="Questions" value={String(totalQs)} />
        <Stat label="Attempted" value={`${attemptedCount}/${totalQs}`} />
        <Stat label="Avg score" value={avg.toFixed(1)} sub="/ 5" />
        <Stat label="Review queue" value={String(reviewCount)} />
      </section>

      <section className="mb-10">
        <SectionHeader title="Chapters" />
        <div className="grid gap-3 sm:grid-cols-2">
          {chapters.map((c) => {
            const chQs = questions.filter((q) => q.chapter_id === c.id);
            const done = chQs.filter((q) => attemptedIds.has(q.id)).length;
            const pct = chQs.length ? Math.round((done / chQs.length) * 100) : 0;
            return (
              <Link
                key={c.id}
                to="/chapter/$chapterId"
                params={{ chapterId: c.id }}
                className="panel p-5 hover:border-primary/40 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Chapter {c.number}
                    </p>
                    <h3 className="font-semibold mt-0.5">{c.title}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                {c.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {c.description}
                  </p>
                )}
                <div className="mt-4">
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {done}/{chQs.length} attempted
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link to="/quick-sheets" className="panel p-5 hover:border-primary/40">
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold">Quick Sheets</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {sheets.length} cheat sheets to refresh key rules before practice.
          </p>
        </Link>
        <Link to="/review" className="panel p-5 hover:border-primary/40">
          <Repeat className="h-5 w-5 text-primary mb-2" />
          <h3 className="font-semibold">Review queue</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {reviewCount} question{reviewCount === 1 ? "" : "s"} flagged from low
            scores.
          </p>
        </Link>
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
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

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold mb-3 tracking-tight">{title}</h2>
  );
}
