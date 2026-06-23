import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ExternalLink, Check, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { deepReviewById } from "@/lib/quick-sheet-templates";
import { chapters } from "@/lib/mock-data";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export const Route = createFileRoute("/deep-review/$reviewId")({
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
  component: DeepReviewPage,
});

function DeepReviewPage() {
  const { reviewId } = Route.useParams();
  const review = deepReviewById(reviewId);
  const [done, setDone] = useState<Record<string, boolean>>({});

  if (!review) {
    return (
      <AppShell>
        <p>Deep review not found.</p>
      </AppShell>
    );
  }

  const ch = chapters.find((c) => c.id === review.chapter_id);
  const total = review.sections.length;
  const checked = Object.values(done).filter(Boolean).length;
  const pct = Math.round((checked / total) * 100);

  const toggle = (id: string) =>
    setDone((d) => ({ ...d, [id]: !d[id] }));

  return (
    <AppShell>
      <Link
        to="/quick-sheets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Quick Sheets
      </Link>

      <header className="panel p-6 mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {ch && (
            <span className="chip">
              Ch {ch.number} · {ch.title}
            </span>
          )}
          <span className="chip">Deep Review</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold">{review.title}</h1>
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm">
          {review.intro}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-muted-foreground">
            {checked} / {total} reviewed
          </span>
        </div>
      </header>

      {/* Table of contents */}
      <nav className="panel p-5 mb-6">
        <h2 className="text-sm font-semibold mb-3">Table of contents</h2>
        <ol className="space-y-1.5 text-sm">
          {review.sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <span className="text-muted-foreground w-5">{i + 1}.</span>
                <span className="flex-1">{s.title}</span>
                {done[s.id] && <Check className="h-3.5 w-3.5 text-primary" />}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="space-y-3">
        {review.sections.map((s, i) => (
          <Collapsible
            key={s.id}
            defaultOpen={i === 0}
            className="panel"
            id={s.id}
          >
            <CollapsibleTrigger asChild>
              <button className="w-full p-4 text-left flex items-center gap-3 group">
                <span
                  className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                    done[s.id]
                      ? "bg-primary border-primary text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(s.id);
                  }}
                  role="button"
                  aria-label="Mark reviewed"
                >
                  {done[s.id] ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {s.summary}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[state=open]:rotate-90 transition-transform" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 pt-0 space-y-3">
                <p className="text-sm leading-relaxed">{s.body}</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/question-bank"
                    search={
                      {
                        topic: s.practiceTopicId,
                        chapter: review.chapter_id,
                        from: "deep-review",
                      } as never
                    }
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:opacity-90"
                  >
                    Jump to practice
                  </Link>
                  <button
                    onClick={() => toggle(s.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs hover:bg-accent"
                  >
                    {done[s.id] ? "Mark unreviewed" : "Mark reviewed"}
                  </button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Full notes link */}
      <div className="mt-8 panel p-5">
        <h2 className="text-sm font-semibold mb-2">Want the full version?</h2>
        {review.sourceLink ? (
          <a
            href={review.sourceLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
          >
            Open full notes on website <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">
            Open full notes on website (coming soon)
          </p>
        )}
      </div>
    </AppShell>
  );
}
