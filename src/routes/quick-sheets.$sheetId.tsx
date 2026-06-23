import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { chaptersQuery, quickSheetQuery } from "@/lib/queries";
import { templateById } from "@/lib/quick-sheet-templates";

type Search = {
  from?: "sprint" | "question" | "battle-map";
  chapterId?: string;
  questionId?: string;
};

export const Route = createFileRoute("/quick-sheets/$sheetId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    from: (s.from as Search["from"]) ?? undefined,
    chapterId: typeof s.chapterId === "string" ? s.chapterId : undefined,
    questionId: typeof s.questionId === "string" ? s.questionId : undefined,
  }),
  loader: ({ context, params }) => {
    // Only ensure legacy data; templates are sync
    if (!templateById(params.sheetId)) {
      context.queryClient.ensureQueryData(quickSheetQuery(params.sheetId));
    }
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
  component: SheetPage,
});

function SheetPage() {
  const { sheetId } = Route.useParams();
  const search = useSearch({ from: "/quick-sheets/$sheetId" });
  const template = templateById(sheetId);
  const { data: chapters } = useSuspenseQuery(chaptersQuery);

  if (template) {
    const ch = chapters.find((c) => c.id === template.chapter_id);
    return (
      <AppShell>
        <Link
          to="/quick-sheets"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> Quick Sheets
        </Link>

        <article className="panel p-6 sm:p-8 space-y-6">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {ch && (
                <span className="chip">
                  Ch {ch.number} · {ch.title}
                </span>
              )}
              <span className="chip">{template.topic_label}</span>
              {template.reviewBeforeSprint && (
                <span className="chip bg-primary/15 text-primary border-primary/30">
                  Review before sprint
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">{template.title}</h1>
            <p className="text-muted-foreground">{template.purpose}</p>
          </header>

          {/* Tutor voice intro */}
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
            Review this first, then come back and try the sprint or the next
            question. This is fixable — most misses on this topic come from one
            missing rule, not the whole mechanism.
          </div>

          <Section icon={<ListChecks className="h-4 w-4" />} title="Must-know rules">
            <ul className="space-y-1.5 text-sm">
              {template.rules.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            icon={<AlertTriangle className="h-4 w-4 text-warning" />}
            title="Common traps"
          >
            <ul className="space-y-1.5 text-sm">
              {template.traps.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            icon={<Lightbulb className="h-4 w-4 text-primary" />}
            title="Tiny example"
          >
            <div className="rounded-md border bg-background/50 p-3 text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Setup: </span>
                {template.example.setup}
              </div>
              <div>
                <span className="text-muted-foreground">Answer: </span>
                {template.example.answer}
              </div>
            </div>
          </Section>

          <Section title="Related question types">
            <ul className="flex flex-wrap gap-2">
              {template.relatedQuestionTypes.map((q) => (
                <li key={q} className="chip">
                  {q}
                </li>
              ))}
            </ul>
          </Section>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              to="/question-bank"
              search={{
                topic: template.topic_id,
                from: "quick-sheet",
              } as never}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium hover:opacity-90"
            >
              Practice this topic <ArrowRight className="h-4 w-4" />
            </Link>
            {search.from === "sprint" && search.chapterId && (
              <Link
                to="/sprint/$chapterId"
                params={{ chapterId: search.chapterId }}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                Back to sprint
              </Link>
            )}
            {search.from === "question" && search.questionId && (
              <Link
                to="/question/$questionId"
                params={{ questionId: search.questionId }}
                className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                Back to question
              </Link>
            )}
            {!search.from && (
              <span className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                Back to sprint / question (open this from a sprint or question)
              </span>
            )}
          </div>

          {/* External links */}
          <div className="border-t pt-4 space-y-1.5 text-sm">
            <p className="text-muted-foreground font-medium">More on this topic</p>
            <ExtLink href={template.links.fullExplanation} label="Full website explanation" />
            <ExtLink href={template.links.sourceNotes} label="Source notes" />
            <ExtLink
              href={template.links.sourceReactionSummary}
              label="Source reaction summary"
            />
          </div>
        </article>
      </AppShell>
    );
  }

  // Fallback: legacy plain quick sheet
  const { data: sheet } = useSuspenseQuery(quickSheetQuery(sheetId));
  return (
    <AppShell>
      <Link
        to="/quick-sheets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Quick Sheets
      </Link>
      <article className="panel p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-semibold">{sheet.title}</h1>
        <p className="text-muted-foreground mt-2">{sheet.summary}</p>
        <pre className="mt-6 whitespace-pre-wrap font-sans text-sm leading-relaxed">
          {sheet.content}
        </pre>
      </article>
    </AppShell>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold mb-2">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExtLink({ href, label }: { href?: string; label: string }) {
  if (!href) {
    return (
      <div className="text-muted-foreground">
        {label} <span className="text-xs">(coming soon)</span>
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-primary hover:underline"
    >
      {label} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
