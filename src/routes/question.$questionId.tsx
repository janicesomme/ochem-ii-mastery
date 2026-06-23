import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  Brain,
  Check,
  ChevronLeft,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";
import { AppShell, DifficultyChip } from "@/components/AppShell";
import { chapterQuery, questionDetailQuery, questionsQuery } from "@/lib/queries";
import { progress } from "@/lib/progress";

export const Route = createFileRoute("/question/$questionId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(questionDetailQuery(params.questionId)),
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">Failed to load: {error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p>Question not found.</p>
    </AppShell>
  ),
  component: QuestionPage,
});

function QuestionPage() {
  const { questionId } = Route.useParams();
  const { data } = useSuspenseQuery(questionDetailQuery(questionId));
  const { data: chapter } = useSuspenseQuery(chapterQuery(data.question.chapter_id));
  const navigate = useNavigate();
  const { data: siblings } = useSuspenseQuery(
    questionsQuery({ chapterId: data.question.chapter_id }),
  );

  const [tried, setTried] = useState(false);
  const [attemptText, setAttemptText] = useState("");
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [scored, setScored] = useState<number | null>(null);

  const orderedHints = [...data.hints].filter((h) => h.kind === "hint");
  const checklist = data.hints.find((h) => h.kind === "checklist");

  const handleScore = (score: 0 | 1 | 3 | 5) => {
    progress.recordAttempt({
      question_id: data.question.id,
      score,
      hints_used: hintsRevealed,
      used_solution: showSolution,
    });
    setScored(score);
  };

  const idx = siblings.findIndex((q) => q.id === questionId);
  const next = siblings[idx + 1];
  const prev = siblings[idx - 1];

  const reset = () => {
    setTried(false);
    setAttemptText("");
    setHintsRevealed(0);
    setChecklistOpen(false);
    setShowSolution(false);
    setShowAnswer(false);
    setScored(null);
  };

  return (
    <AppShell>
      <Link
        to="/chapter/$chapterId"
        params={{ chapterId: chapter.id }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Chapter {chapter.number}: {chapter.title}
      </Link>

      <article className="panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="chip">{data.question.question_type}</span>
          <DifficultyChip d={data.question.difficulty} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          {data.question.title}
        </h1>
        <p className="mt-4 text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {data.question.prompt}
        </p>

        <div className="mt-6">
          <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">
            Your attempt
          </label>
          <textarea
            value={attemptText}
            onChange={(e) => setAttemptText(e.target.value)}
            placeholder="Sketch the mechanism, list reagents, or draft your reasoning before peeking at hints…"
            className="w-full min-h-32 rounded-md border border-input bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {!tried && (
            <button
              onClick={() => setTried(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
            >
              <Check className="h-4 w-4" /> I tried
            </button>
          )}
        </div>

        {tried && (
          <div className="mt-8 space-y-6">
            <UnlockSection
              icon={Lightbulb}
              title="Hints"
              note="Reveal one at a time — each one is small."
            >
              <div className="space-y-2">
                {orderedHints.map((h, i) => {
                  const unlocked = i < hintsRevealed;
                  return (
                    <div
                      key={h.id}
                      className={`rounded-md border p-3 text-sm ${
                        unlocked
                          ? "border-accent/60 bg-accent/20"
                          : "border-dashed border-border bg-muted/30"
                      }`}
                    >
                      {unlocked ? (
                        <>
                          <p className="font-semibold mb-1">Hint {i + 1}</p>
                          <p>{h.content}</p>
                        </>
                      ) : (
                        <button
                          onClick={() => setHintsRevealed(i + 1)}
                          disabled={i !== hintsRevealed}
                          className="text-sm font-medium text-primary disabled:text-muted-foreground"
                        >
                          {i === hintsRevealed
                            ? `Unlock hint ${i + 1}`
                            : `Hint ${i + 1} locked`}
                        </button>
                      )}
                    </div>
                  );
                })}
                {checklist && (
                  <div className="rounded-md border border-border p-3 text-sm">
                    <button
                      onClick={() => setChecklistOpen((v) => !v)}
                      className="inline-flex items-center gap-1.5 font-semibold"
                    >
                      <ListChecks className="h-4 w-4" />
                      {checklistOpen ? "Hide" : "Show"} checklist hint
                    </button>
                    {checklistOpen && (
                      <p className="mt-2 whitespace-pre-wrap">{checklist.content}</p>
                    )}
                  </div>
                )}
              </div>
            </UnlockSection>

            <UnlockSection
              icon={Target}
              title="Step-by-step solution"
              note="Use this only after hints don't get you there."
            >
              {!showSolution ? (
                <button
                  onClick={() => setShowSolution(true)}
                  className="rounded-md border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  Reveal step-by-step
                </button>
              ) : (
                <ol className="space-y-2">
                  {data.steps.map((s) => (
                    <li
                      key={s.id}
                      className="flex gap-3 rounded-md bg-secondary/60 p-3 text-sm"
                    >
                      <span className="font-semibold font-display text-primary">
                        {s.step_number}.
                      </span>
                      <span>{s.content}</span>
                    </li>
                  ))}
                </ol>
              )}
            </UnlockSection>

            <UnlockSection icon={Sparkles} title="Final answer">
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="rounded-md border border-input px-4 py-2 text-sm font-semibold hover:bg-secondary"
                >
                  Reveal final answer
                </button>
              ) : (
                <p className="rounded-md bg-success/10 border border-success/30 p-3 text-sm font-medium text-foreground">
                  {data.answer?.content ?? "No answer recorded."}
                </p>
              )}
            </UnlockSection>

            <div className="grid sm:grid-cols-2 gap-3">
              {data.question.memory_trick && (
                <div className="panel p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary">
                    <Brain className="h-3.5 w-3.5" /> Memory trick
                  </p>
                  <p className="mt-2 text-sm">{data.question.memory_trick}</p>
                </div>
              )}
              {data.question.common_trap && (
                <div className="panel p-4">
                  <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> Common trap
                  </p>
                  <p className="mt-2 text-sm">{data.question.common_trap}</p>
                </div>
              )}
            </div>

            <div className="panel p-5">
              <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">
                Score this attempt
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <ScoreBtn
                  label="Solved w/o hint"
                  pts={5}
                  active={scored === 5}
                  onClick={() => handleScore(5)}
                />
                <ScoreBtn
                  label="Solved with hint"
                  pts={3}
                  active={scored === 3}
                  onClick={() => handleScore(3)}
                />
                <ScoreBtn
                  label="Used solution"
                  pts={1}
                  active={scored === 1}
                  onClick={() => handleScore(1)}
                />
                <ScoreBtn
                  label="Still missed"
                  pts={0}
                  active={scored === 0}
                  onClick={() => handleScore(0)}
                />
              </div>
              {scored !== null && (
                <p className="text-xs text-muted-foreground mt-3">
                  Saved. {scored <= 1 && "Added to your review queue."}
                </p>
              )}
            </div>
          </div>
        )}
      </article>

      <nav className="mt-6 flex items-center justify-between gap-3">
        <button
          disabled={!prev}
          onClick={() =>
            prev &&
            (reset(),
            navigate({
              to: "/question/$questionId",
              params: { questionId: prev.id },
            }))
          }
          className="rounded-md border border-input px-3 py-2 text-sm disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          disabled={!next}
          onClick={() =>
            next &&
            (reset(),
            navigate({
              to: "/question/$questionId",
              params: { questionId: next.id },
            }))
          }
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Next question →
        </button>
      </nav>
    </AppShell>
  );
}

function UnlockSection({
  icon: Icon,
  title,
  note,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="inline-flex items-center gap-1.5 text-sm font-semibold mb-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h2>
      {note && <p className="text-xs text-muted-foreground mb-2">{note}</p>}
      {children}
    </section>
  );
}

function ScoreBtn({
  label,
  pts,
  active,
  onClick,
}: {
  label: string;
  pts: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border p-3 text-left text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-input hover:bg-secondary"
      }`}
    >
      <p className="font-display text-xl font-semibold">{pts}</p>
      <p className="text-xs">{label}</p>
    </button>
  );
}
