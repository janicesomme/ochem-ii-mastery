import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, Repeat } from "lucide-react";
import { AppShell, DifficultyChip, ScoreChip } from "@/components/AppShell";
import { allQuestionsQuery } from "@/lib/queries";
import { progress } from "@/lib/progress";
import { useEffect, useState } from "react";
import { ReviewTutorIntro } from "@/components/TutorVoice";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [{ title: "Review Queue — No-Fear Ochem II" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allQuestionsQuery),
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
  component: ReviewPage,
});

function ReviewPage() {
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    return () => window.removeEventListener("attempts-updated", h);
  }, []);

  const latestByQ = new Map<string, ReturnType<typeof progress.latestFor>>();
  for (const q of questions) latestByQ.set(q.id, progress.latestFor(q.id));
  const queue = questions.filter((q) => {
    const a = latestByQ.get(q.id);
    return a && a.score <= 1;
  });

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
          <Repeat className="h-6 w-6 text-primary" /> Review Queue
        </h1>
        <p className="text-muted-foreground mt-2">
          Questions you missed or needed full solutions for. Retry them until they
          stick.
        </p>
      </header>
      {queue.length === 0 ? (
        <div className="panel p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nothing in your review queue. Keep practicing — anything you score 0 or
            1 will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {queue.map((q) => {
            const last = latestByQ.get(q.id) ?? null;
            return (
              <Link
                key={q.id}
                to="/question/$questionId"
                params={{ questionId: q.id }}
                className="panel p-4 hover:border-primary/40"
              >
                <p className="font-medium">{q.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="chip">{q.question_type}</span>
                  <DifficultyChip d={q.difficulty} />
                  <ScoreChip score={last?.score ?? null} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
