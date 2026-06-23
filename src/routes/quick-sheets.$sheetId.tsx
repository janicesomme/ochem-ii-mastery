import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { quickSheetQuery } from "@/lib/queries";

export const Route = createFileRoute("/quick-sheets/$sheetId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(quickSheetQuery(params.sheetId)),
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
