import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell, DifficultyChip, ScoreChip } from "@/components/AppShell";
import { ChapterTabs } from "./chapter.$chapterId.map";
import {
  chapterQuery,
  questionsQuery,
  topicsByChapterQuery,
} from "@/lib/queries";
import { progress } from "@/lib/progress";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/chapter/$chapterId/")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(chapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(topicsByChapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(
      questionsQuery({ chapterId: params.chapterId }),
    );
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">Failed to load chapter: {error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p>Chapter not found.</p>
    </AppShell>
  ),
  component: ChapterPage,
});

function ChapterPage() {
  const { chapterId } = Route.useParams();
  const { data: chapter } = useSuspenseQuery(chapterQuery(chapterId));
  const { data: topics } = useSuspenseQuery(topicsByChapterQuery(chapterId));
  const { data: questions } = useSuspenseQuery(
    questionsQuery({ chapterId }),
  );

  const [topicId, setTopicId] = useState<string | "">("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [type, setType] = useState<string>("");

  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    return () => window.removeEventListener("attempts-updated", h);
  }, []);

  const types = useMemo(
    () => Array.from(new Set(questions.map((q) => q.question_type))).sort(),
    [questions],
  );

  const filtered = questions.filter(
    (q) =>
      (!topicId || q.topic_id === topicId) &&
      (!difficulty || q.difficulty === difficulty) &&
      (!type || q.question_type === type),
  );

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <header className="mb-6">
        <p className="chip">Chapter {chapter.number}</p>
        <h1 className="text-3xl font-semibold mt-2">{chapter.title}</h1>
        {chapter.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {chapter.description}
          </p>
        )}
      </header>

      <section className="panel p-4 mb-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <Filter
            label="Topic"
            value={topicId}
            onChange={setTopicId}
            options={[
              { value: "", label: "All topics" },
              ...topics.map((t) => ({ value: t.id, label: t.title })),
            ]}
          />
          <Filter
            label="Question type"
            value={type}
            onChange={setType}
            options={[
              { value: "", label: "All types" },
              ...types.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Filter
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: "", label: "All" },
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
        </div>
      </section>

      <section>
        <p className="text-sm text-muted-foreground mb-3">
          {filtered.length} question{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="grid gap-2">
          {filtered.map((q) => {
            const last = progress.latestFor(q.id);
            return (
              <Link
                key={q.id}
                to="/question/$questionId"
                params={{ questionId: q.id }}
                className="panel p-4 hover:border-primary/40 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{q.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="chip">{q.question_type}</span>
                    <DifficultyChip d={q.difficulty} />
                    <ScoreChip score={last?.score ?? null} />
                  </div>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="panel p-8 text-center text-muted-foreground text-sm">
              No questions match these filters.
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}

function Filter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
