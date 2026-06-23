import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft, Search, BookOpen, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { chaptersQuery, quickSheetsQuery } from "@/lib/queries";
import { quickSheetTemplates, deepReviews } from "@/lib/quick-sheet-templates";

export const Route = createFileRoute("/quick-sheets/")({
  head: () => ({
    meta: [
      { title: "Quick Sheets — No-Fear Ochem II" },
      {
        name: "description",
        content:
          "Short summary sheets to remind you of key Ochem II rules before practice.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(quickSheetsQuery);
    context.queryClient.ensureQueryData(chaptersQuery);
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
  component: QuickSheetsPage,
});

function QuickSheetsPage() {
  const { data: legacySheets } = useSuspenseQuery(quickSheetsQuery);
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const chapterById = new Map(chapters.map((c) => [c.id, c]));

  const [chapterFilter, setChapterFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const templates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quickSheetTemplates.filter((t) => {
      if (chapterFilter !== "all" && t.chapter_id !== chapterFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.topic_label.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q)
      );
    });
  }, [chapterFilter, search]);

  const legacy = useMemo(() => {
    const q = search.trim().toLowerCase();
    return legacySheets.filter((s) => {
      if (chapterFilter !== "all" && s.chapter_id !== chapterFilter) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q)
      );
    });
  }, [legacySheets, chapterFilter, search]);

  const visibleReviews = useMemo(
    () =>
      deepReviews.filter(
        (d) => chapterFilter === "all" || d.chapter_id === chapterFilter,
      ),
    [chapterFilter],
  );

  // group templates by topic_label for "topic cards" feel
  const byTopic = useMemo(() => {
    const m = new Map<string, typeof templates>();
    for (const t of templates) {
      const k = t.topic_label;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(t);
    }
    return [...m.entries()];
  }, [templates]);

  return (
    <AppShell>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Dashboard
      </Link>
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">Quick Sheets</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Short rule reminders, not full lessons. Skim before a sprint or right
          after a miss — then jump back into practice.
        </p>
      </header>

      {/* filters */}
      <div className="panel p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sheets, topics, rules…"
            className="w-full pl-9 pr-3 py-2 rounded-md bg-background border text-sm"
          />
        </div>
        <select
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          className="rounded-md bg-background border px-3 py-2 text-sm"
        >
          <option value="all">All chapters</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              Ch {c.number} — {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Deep Review section */}
      {visibleReviews.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold">Deep Review</h2>
            <span className="chip">Longer notes, broken into sections</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleReviews.map((d) => {
              const ch = chapterById.get(d.chapter_id);
              return (
                <Link
                  key={d.id}
                  to="/deep-review/$reviewId"
                  params={{ reviewId: d.id }}
                  className="panel p-5 hover:border-primary/40 block"
                >
                  {ch && <p className="chip mb-2">Ch {ch.number}</p>}
                  <h3 className="font-semibold">{d.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {d.sections.length} sections · table of contents · jump to
                    practice
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Sheet templates grouped by topic */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Quick Sheets by topic</h2>
          <span className="chip">Compact, app-friendly</span>
        </div>
        {byTopic.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : (
          <div className="space-y-6">
            {byTopic.map(([topic, items]) => (
              <div key={topic}>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  {topic}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((t) => {
                    const ch = chapterById.get(t.chapter_id);
                    return (
                      <Link
                        key={t.id}
                        to="/quick-sheets/$sheetId"
                        params={{ sheetId: t.id }}
                        className="panel p-5 hover:border-primary/40 block"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {ch && <span className="chip">Ch {ch.number}</span>}
                          {t.reviewBeforeSprint && (
                            <span className="chip bg-primary/15 text-primary border-primary/30">
                              Review before sprint
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold">{t.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t.purpose}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Legacy plain summaries */}
      {legacy.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">More summaries</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {legacy.map((s) => {
              const ch = s.chapter_id ? chapterById.get(s.chapter_id) : null;
              return (
                <Link
                  key={s.id}
                  to="/quick-sheets/$sheetId"
                  params={{ sheetId: s.id }}
                  className="panel p-5 hover:border-primary/40 block"
                >
                  {ch && <p className="chip mb-2">Ch {ch.number}</p>}
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {s.summary}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </AppShell>
  );
}
