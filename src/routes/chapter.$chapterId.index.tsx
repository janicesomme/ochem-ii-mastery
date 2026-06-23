import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, Filter as FilterIcon, X } from "lucide-react";
import { AppShell, DifficultyChip, ScoreChip } from "@/components/AppShell";
import { ChapterTabs } from "./chapter.$chapterId.map";
import {
  chapterQuery,
  questionsQuery,
  topicsByChapterQuery,
} from "@/lib/queries";
import { progress } from "@/lib/progress";
import { useEffect, useMemo, useState } from "react";

type BankSearch = {
  topic?: string;
  move?: string;
  trap?: string;
  mode?: string;
  label?: string;
  from?: string;
};

export const Route = createFileRoute("/chapter/$chapterId/")({
  validateSearch: (raw: Record<string, unknown>): BankSearch => {
    const s = (k: string) =>
      typeof raw[k] === "string" ? (raw[k] as string) : undefined;
    return {
      topic: s("topic"),
      move: s("move"),
      trap: s("trap"),
      mode: s("mode"),
      label: s("label"),
      from: s("from"),
    };
  },
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
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { data: chapter } = useSuspenseQuery(chapterQuery(chapterId));
  const { data: topics } = useSuspenseQuery(topicsByChapterQuery(chapterId));
  const { data: questions } = useSuspenseQuery(
    questionsQuery({ chapterId }),
  );

  const [topicId, setTopicId] = useState<string | "">(search.topic ?? "");
  const [difficulty, setDifficulty] = useState<string>("");
  const [type, setType] = useState<string>("");

  // sync topic filter when URL changes (e.g. arriving from Battle Map)
  useEffect(() => {
    setTopicId(search.topic ?? "");
  }, [search.topic]);

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

  const battleFilter = useMemo(() => {
    if (!search.from && !search.topic && !search.move && !search.trap && !search.mode)
      return null;
    if (search.label) return search.label;
    if (search.mode === "sprint") return "Smart Practice sprint";
    if (search.topic) {
      const t = topics.find((x) => x.id === search.topic);
      return t ? t.title : `topic: ${search.topic}`;
    }
    if (search.move) return `move: ${search.move.replace(/-/g, " ")}`;
    if (search.trap) return `trap: ${search.trap.replace(/-/g, " ")}`;
    return null;
  }, [search, topics]);

  const clearBattleFilter = () => {
    setTopicId("");
    navigate({
      to: "/chapter/$chapterId",
      params: { chapterId },
      search: {},
      replace: true,
    });
  };

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <ChapterTabs chapterId={chapter.id} active="bank" />
      <header className="mb-6">
        <p className="chip">Chapter {chapter.number}</p>
        <h1 className="text-3xl font-semibold mt-2">{chapter.title}</h1>
        {chapter.description && (
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {chapter.description}
          </p>
        )}
      </header>

      {battleFilter && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
          <p className="inline-flex items-center gap-2 text-sm">
            <FilterIcon className="h-4 w-4 text-primary" />
            <span>
              <span className="font-semibold text-primary">
                Filtered by Battle Map:
              </span>{" "}
              <span className="font-medium">{battleFilter}</span>
            </span>
          </p>
          <button
            type="button"
            onClick={clearBattleFilter}
            className="inline-flex items-center gap-1 text-xs rounded-md border border-border bg-surface px-2 py-1 hover:bg-muted/60"
          >
            <X className="h-3 w-3" /> Clear filter
          </button>
        </div>
      )}

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
              {battleFilter && (
                <>
                  {" "}
                  <button
                    type="button"
                    onClick={clearBattleFilter}
                    className="text-primary hover:underline"
                  >
                    Clear Battle Map filter
                  </button>
                  .
                </>
              )}
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
