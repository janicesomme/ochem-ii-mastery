import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { allQuestionsQuery, chaptersQuery } from "@/lib/queries";

export const Route = createFileRoute("/question-bank")({
  head: () => ({
    meta: [
      { title: "Question Bank — No-Fear Ochem II" },
      { name: "description", content: "Browse all Ochem II chapters and questions." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery);
    context.queryClient.ensureQueryData(allQuestionsQuery);
  },
  component: QuestionBank,
});

function QuestionBank() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const { data: questions } = useSuspenseQuery(allQuestionsQuery);

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Question Bank</h1>
        <p className="text-muted-foreground mt-1">
          Pick a chapter to start practicing.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {chapters.map((c) => {
          const count = questions.filter((q) => q.chapter_id === c.id).length;
          return (
            <Link
              key={c.id}
              to="/chapter/$chapterId"
              params={{ chapterId: c.id }}
              className="panel p-5 hover:border-primary/40 group flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Chapter {c.number}
                </p>
                <h3 className="font-semibold mt-0.5">{c.title}</h3>
                {c.description && (
                  <p className="text-sm text-muted-foreground mt-1">{c.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">{count} questions</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
