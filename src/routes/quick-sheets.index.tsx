import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { chaptersQuery, quickSheetsQuery } from "@/lib/queries";

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
  const { data: sheets } = useSuspenseQuery(quickSheetsQuery);
  const { data: chapters } = useSuspenseQuery(chaptersQuery);
  const chapterById = new Map(chapters.map((c) => [c.id, c]));

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
          Short rule reminders — not full lessons. Skim before practice.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {sheets.map((s) => {
          const ch = s.chapter_id ? chapterById.get(s.chapter_id) : null;
          return (
            <Link
              key={s.id}
              to="/quick-sheets/$sheetId"
              params={{ sheetId: s.id }}
              className="panel p-5 hover:border-primary/40"
            >
              {ch && <p className="chip mb-2">Ch {ch.number}</p>}
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.summary}</p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
