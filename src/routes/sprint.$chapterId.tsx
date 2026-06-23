import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  chapterQuery,
  questionsQuery,
  topicsByChapterQuery,
} from "@/lib/queries";
import { getChapterMap } from "@/lib/chapter-map";
import { progress } from "@/lib/progress";
import {
  buildStudentSignals,
  currentExamDays,
  modeLabel,
  reasonLabel,
  recommendSprint,
  sprintSession,
  summarizeSprint,
  type SprintPlan,
  type SprintSession,
} from "@/lib/sprint";

export const Route = createFileRoute("/sprint/$chapterId")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(chapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(topicsByChapterQuery(params.chapterId));
    context.queryClient.ensureQueryData(
      questionsQuery({ chapterId: params.chapterId }),
    );
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">Failed to load sprint: {error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p>Sprint not found.</p>
    </AppShell>
  ),
  component: SprintPage,
});

function useLive() {
  const [, force] = useState(0);
  useEffect(() => {
    const h = () => force((n) => n + 1);
    window.addEventListener("attempts-updated", h);
    window.addEventListener("exam-updated", h);
    window.addEventListener("sprint-updated", h);
    return () => {
      window.removeEventListener("attempts-updated", h);
      window.removeEventListener("exam-updated", h);
      window.removeEventListener("sprint-updated", h);
    };
  }, []);
}

function SprintPage() {
  const { chapterId } = Route.useParams();
  const { data: chapter } = useSuspenseQuery(chapterQuery(chapterId));
  const { data: questions } = useSuspenseQuery(questionsQuery({ chapterId }));
  useLive();

  const map = getChapterMap(chapterId);
  const examDays = currentExamDays();
  const attempts = progress.all();

  const signals = useMemo(
    () => buildStudentSignals(chapterId, questions, attempts),
    [chapterId, questions, attempts],
  );

  const [variant, setVariant] = useState(0);

  const plan = useMemo(() => {
    if (!map) return null;
    return recommendSprint({
      chapterId,
      chapterMap: map,
      questions,
      examDays,
      readinessByTopic: signals.readinessByTopic,
      reviewByTopic: signals.reviewByTopic,
      attemptedByTopic: signals.attemptedByTopic,
      variant,
    });
  }, [map, chapterId, questions, examDays, signals, variant]);

  // Sync active session completions on any attempts-updated tick
  useEffect(() => {
    sprintSession.syncCompletions();
  });

  const session = sprintSession.get();
  const sessionForThisChapter =
    session && session.plan.chapter_id === chapterId ? session : null;

  if (!map || !plan) {
    return (
      <AppShell>
        <BackLink chapterId={chapterId} />
        <p className="panel p-6 text-sm text-muted-foreground">
          Sprint engine has no data for this chapter yet.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <BackLink chapterId={chapterId} />
      <header className="mb-5">
        <p className="chip">Chapter {chapter.number}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2">
          Smart Sprint — {chapter.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          A focused, mixed practice set tuned to your data and the exam clock.
        </p>
      </header>

      {sessionForThisChapter ? (
        <ActiveSprint
          session={sessionForThisChapter}
          chapterId={chapterId}
          questions={questions.map((q) => ({
            id: q.id,
            title: q.title,
            topic_id: q.topic_id ?? "",
          }))}
        />

      ) : (
        <Recommendation
          plan={plan}
          examDays={examDays}
          onChange={() => setVariant((v) => v + 1)}
          onStart={() => {
            sprintSession.start(plan);
          }}
        />
      )}
    </AppShell>
  );
}

function BackLink({ chapterId }: { chapterId: string }) {
  return (
    <Link
      to="/chapter/$chapterId/map"
      params={{ chapterId }}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
    >
      <ChevronLeft className="h-4 w-4" /> Battle map
    </Link>
  );
}

function Recommendation({
  plan,
  examDays,
  onChange,
  onStart,
}: {
  plan: SprintPlan;
  examDays: number | null;
  onChange: () => void;
  onStart: () => void;
}) {
  const modeColor =
    plan.mode === "panic"
      ? "border-destructive/50 bg-destructive/10"
      : plan.mode === "exam"
        ? "border-warning/50 bg-warning/10"
        : "border-primary/40 bg-primary/10";

  return (
    <section className={`panel p-5 sm:p-6 ${modeColor}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip chip-accent">
          <Sparkles className="h-3 w-3" /> {modeLabel(plan.mode)}
        </span>
        {plan.mode === "panic" && (
          <span className="chip chip-danger">
            <Flame className="h-3 w-3" /> Exam in {examDays}d
          </span>
        )}
        {plan.mode === "exam" && (
          <span className="chip chip-warn">Exam in {examDays}d</span>
        )}
      </div>

      <h2 className="font-display text-2xl font-semibold mt-2">{plan.title}</h2>
      <p className="text-sm mt-1">
        <span className="font-semibold">{plan.actual_count}</span> questions
        {plan.actual_count !== plan.planned_count && (
          <span className="text-muted-foreground">
            {" "}
            (planned {plan.planned_count})
          </span>
        )}{" "}
        · <span className="font-semibold">~{plan.estimated_minutes} min</span> ·
        est. readiness gain{" "}
        <span className="text-success font-semibold">
          +{plan.estimated_readiness_gain}%
        </span>
      </p>

      <div className="mt-3 rounded-md border border-border/60 bg-surface/60 p-3 text-sm inline-flex items-start gap-2 max-w-2xl">
        <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <span>{plan.reason}</span>
      </div>

      {/* Topic mix */}
      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Topic mix
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {plan.mix.map((m, i) => (
            <li
              key={`${m.topic_id}-${m.reason}-${i}`}
              className="rounded-md border border-border bg-surface/60 px-3 py-2 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{m.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {reasonLabel(m.reason)}
                </p>
              </div>
              <span className="text-sm font-display font-semibold shrink-0">
                {m.question_ids.length}
                {m.question_ids.length !== m.planned && (
                  <span className="text-muted-foreground text-[11px] font-sans font-normal">
                    /{m.planned}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {plan.actual_count < plan.planned_count && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Demo bank has {plan.actual_count} of {plan.planned_count} planned
            questions — sprint runs with what's available.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={plan.actual_count === 0}
          className="btn-primary"
        >
          <Sparkles className="h-4 w-4" /> Start Sprint
        </button>
        <button type="button" onClick={onChange} className="btn-ghost">
          <RefreshCw className="h-4 w-4" /> Change Sprint
        </button>
      </div>
    </section>
  );
}

function ActiveSprint({
  session,
  chapterId,
  questions,
}: {
  session: SprintSession;
  chapterId: string;
  questions: { id: string; title: string; topic_id: string }[];
}) {
  const navigate = useNavigate();
  const map = getChapterMap(chapterId)!;
  const total = session.plan.question_ids.length;
  const done = session.completed_ids.length;
  const pos = Math.min(done + 1, total);

  const allDone = done >= total;
  const summary = useMemo(
    () => summarizeSprint(session, questions as never, map),
    [session, questions, map],
  );

  const currentQid = session.plan.question_ids[done];
  const currentQ = currentQid
    ? questions.find((q) => q.id === currentQid)
    : null;

  return (
    <section className="space-y-4">
      <div className="panel p-5 border-primary/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> {session.plan.title}
            </p>
            <p className="font-display text-2xl font-semibold mt-1">
              {allDone ? (
                <>Sprint complete</>
              ) : (
                <>
                  Question{" "}
                  <span className="text-primary">{pos}</span> of {total}
                </>
              )}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            <span>~{session.plan.estimated_minutes} min total</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 mt-3 bg-secondary/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.round((done / total) * 100)}%` }}
          />
        </div>

        {!allDone && currentQ && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface/60 px-3 py-2">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                Up next
              </p>
              <p className="text-sm font-medium truncate">{currentQ.title}</p>
            </div>
            <Link
              to="/question/$questionId"
              params={{ questionId: currentQ.id }}
              className="btn-primary shrink-0"
            >
              Open question <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {allDone ? (
            <button
              type="button"
              onClick={() => {
                sprintSession.end();
              }}
              className="btn-ghost"
            >
              Start a new sprint
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (confirm("Exit sprint? Your progress will be cleared.")) {
                  sprintSession.end();
                }
              }}
              className="btn-ghost"
            >
              Exit sprint
            </button>
          )}
          <Link
            to="/chapter/$chapterId"
            params={{ chapterId }}
            className="btn-ghost"
          >
            Question bank
          </Link>
        </div>
      </div>

      {/* Question list */}
      <div className="panel p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Sprint queue
        </p>
        <ol className="space-y-1.5">
          {session.plan.question_ids.map((qid, i) => {
            const q = questions.find((x) => x.id === qid);
            const isDone = session.completed_ids.includes(qid);
            const isCurrent = !isDone && i === done;
            return (
              <li
                key={qid + i}
                className={`flex items-center justify-between gap-3 rounded-md px-3 py-2 border ${
                  isCurrent
                    ? "border-primary/40 bg-primary/10"
                    : isDone
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-surface/40"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isDone
                        ? "bg-success/20 text-success"
                        : isCurrent
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <span className="text-sm truncate">
                    {q?.title ?? qid}
                  </span>
                </div>
                {!isDone && (
                  <Link
                    to="/question/$questionId"
                    params={{ questionId: qid }}
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    Open <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {allDone && (
        <div className="panel p-5 border-success/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-success" /> Sprint summary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            <Mini label="Score" value={`${summary.avgScorePct}%`} />
            <Mini
              label="Done"
              value={`${summary.attempted}/${summary.total}`}
            />
            <Mini
              label="Readiness"
              value={`+${summary.readinessChange}%`}
              tone="success"
            />
            <Mini
              label="To review"
              value={`${summary.toReview.length}`}
              tone={summary.toReview.length > 0 ? "warn" : undefined}
            />
          </div>
          {summary.weakestTopic && (
            <p className="text-sm mt-3">
              Weakest in this sprint:{" "}
              <span className="font-semibold">
                {summary.weakestTopic.label}
              </span>
              .{" "}
              <Link
                to="/chapter/$chapterId"
                params={{ chapterId }}
                search={{
                  topic: summary.weakestTopic.topic_id,
                  label: `Drill — ${summary.weakestTopic.label}`,
                  from: "sprint",
                }}
                className="text-primary hover:underline"
              >
                Drill these →
              </Link>
            </p>
          )}
          {summary.toReview.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Review these
              </p>
              <ul className="mt-1 space-y-1">
                {summary.toReview.map((r) => {
                  const q = questions.find((x) => x.id === r.question_id);
                  return (
                    <li
                      key={r.question_id}
                      className="text-sm flex items-center justify-between gap-3"
                    >
                      <Link
                        to="/question/$questionId"
                        params={{ questionId: r.question_id }}
                        className="hover:underline truncate"
                      >
                        {q?.title ?? r.question_id}
                      </Link>
                      <span className="chip chip-warn shrink-0">
                        {r.reason}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                sprintSession.end();
                navigate({
                  to: "/sprint/$chapterId",
                  params: { chapterId },
                });
              }}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4" /> Start a new sprint
            </button>
            <Link
              to="/chapter/$chapterId/map"
              params={{ chapterId }}
              className="btn-ghost"
            >
              Back to battle map
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warn";
}) {
  const v =
    tone === "success"
      ? "text-success"
      : tone === "warn"
        ? "text-warning"
        : "";
  return (
    <div className="rounded-md bg-secondary/40 border border-border/60 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className={`text-base font-semibold ${v}`}>{value}</p>
    </div>
  );
}
