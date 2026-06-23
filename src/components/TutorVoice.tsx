// Tutor Voice feedback layer. Local/mock only.
// Pattern: Truth → reassurance → reason → next step.
// Tone: honest, kind, encouraging, concrete. Never "deficiency" / "failure".

import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Heart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { Attempt } from "@/lib/progress";

// --- Quick-sheet placeholder catalog (mock links by topic keyword) ---
const QUICK_SHEETS: { match: RegExp; title: string; href: string }[] = [
  {
    match: /electrophile/i,
    title: "EAS Electrophiles Quick Sheet",
    href: "/quick-sheets",
  },
  {
    match: /direct/i,
    title: "Directing Effects Quick Sheet",
    href: "/quick-sheets",
  },
  {
    match: /friedel|crafts/i,
    title: "Friedel-Crafts Limits Quick Sheet",
    href: "/quick-sheets",
  },
];

const SITE_EXPLANATION_URL = "https://easyorganicchemistry.com/";

export function quickSheetFor(topicLabel?: string | null) {
  if (!topicLabel) return null;
  return QUICK_SHEETS.find((s) => s.match.test(topicLabel)) ?? null;
}

// --- Pattern detection: when to nudge content review ---
export type ReviewSignal = {
  recommend: boolean;
  reason: string;
};

export function shouldRecommendReview(
  attempts: Attempt[],
  current: { hints_used: number; used_solution: boolean; score: number },
  topicQuestionIds: string[] = [],
): ReviewSignal {
  if (current.score <= 1) {
    return {
      recommend: true,
      reason: "This one slipped — a quick rule refresh will pay off fast.",
    };
  }
  if (current.used_solution) {
    return {
      recommend: true,
      reason: "You needed the full solution — let's lock in the rule first.",
    };
  }
  if (current.hints_used >= 2) {
    return {
      recommend: true,
      reason: "Two hints means the rule isn't fresh yet. Worth a quick review.",
    };
  }
  // Repeated misses on same topic
  if (topicQuestionIds.length) {
    const recent = attempts
      .filter((a) => topicQuestionIds.includes(a.question_id))
      .slice(-5);
    const lows = recent.filter((a) => a.score <= 1).length;
    if (lows >= 2) {
      return {
        recommend: true,
        reason: "This topic has bitten you more than once recently.",
      };
    }
  }
  return { recommend: false, reason: "" };
}

// --- Wrapper card ---
export function TutorCard({
  tone = "default",
  icon: Icon = Heart,
  title,
  children,
}: {
  tone?: "default" | "good" | "warn";
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "border-success/40 bg-[color-mix(in_oklch,var(--color-success)_8%,var(--color-card))]"
      : tone === "warn"
        ? "border-warning/40 bg-[color-mix(in_oklch,var(--color-warning)_8%,var(--color-card))]"
        : "border-primary/40 bg-[color-mix(in_oklch,var(--color-primary)_8%,var(--color-card))]";
  const iconClass =
    tone === "good"
      ? "text-success"
      : tone === "warn"
        ? "text-warning"
        : "text-primary";
  return (
    <section className={`panel p-4 sm:p-5 border ${toneClass}`}>
      <p
        className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${iconClass}`}
      >
        <Icon className="h-3.5 w-3.5" /> Tutor voice
      </p>
      <h3 className="font-semibold text-sm mt-1">{title}</h3>
      <div className="mt-2 text-sm leading-relaxed space-y-2 text-foreground/90">
        {children}
      </div>
    </section>
  );
}

// --- Post-score feedback on a question ---
export function ScoreFeedback({
  score,
  hintsUsed,
  usedSolution,
  topicLabel,
  chapterId,
  questionType,
  attempts,
  topicQuestionIds,
}: {
  score: 0 | 1 | 3 | 5;
  hintsUsed: number;
  usedSolution: boolean;
  topicLabel?: string | null;
  chapterId: string;
  questionType: string;
  attempts: Attempt[];
  topicQuestionIds?: string[];
}) {
  if (score >= 3 && !usedSolution) {
    return (
      <TutorCard
        tone="good"
        icon={TrendingUp}
        title="Nice work — this skill is moving toward exam-ready."
      >
        <p>
          You solved this with{" "}
          {hintsUsed === 0 ? "no hints" : `only ${hintsUsed} hint${hintsUsed === 1 ? "" : "s"}`}.
          That's a real signal it's sticking.
        </p>
        <p className="text-muted-foreground">
          Keep it warm — come back to one review question on this later so it
          doesn't fade.
        </p>
      </TutorCard>
    );
  }

  const sheet = quickSheetFor(topicLabel);
  const focus = topicLabel ?? questionType;

  return (
    <TutorCard
      tone="warn"
      title={`This is fixable. You're losing points on ${focus}, not the whole chapter.`}
    >
      <p>
        {usedSolution
          ? "Needing the full solution doesn't mean you're behind — it just means the rule for this move isn't fresh yet."
          : hintsUsed >= 2
            ? "You leaned on hints because the first move wasn't obvious. That's the spot to tighten up."
            : "The first move on this question is easy to miss until you've drilled it a few times."}
      </p>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Do this next
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {sheet && (
            <li className="flex items-start gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <Link to={sheet.href} className="text-primary hover:underline">
                Review the {sheet.title}
              </Link>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <Link
              to="/sprint/$chapterId"
              params={{ chapterId }}
              className="text-primary hover:underline"
            >
              Run a short rescue sprint on this chapter
            </Link>
          </li>
          <li className="flex items-start gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <a
              href={SITE_EXPLANATION_URL}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Full explanation on EasyOrganicChemistry.com
            </a>
          </li>
        </ul>
      </div>
      {/* Reference attempts for repeated-pattern wording */}
      {topicQuestionIds && topicQuestionIds.length > 0 && (() => {
        const sig = shouldRecommendReview(
          attempts,
          { hints_used: hintsUsed, used_solution: usedSolution, score },
          topicQuestionIds,
        );
        return sig.recommend ? (
          <p className="text-xs text-muted-foreground italic">{sig.reason}</p>
        ) : null;
      })()}
    </TutorCard>
  );
}

// --- Review queue intro ---
export function ReviewTutorIntro({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <TutorCard
      title="Start here first — this is where points come back fastest."
    >
      <p>
        These questions are here because they needed hints or a full solution.
        That's not bad news — it's the cleanest list of where to improve.
      </p>
      <p className="text-muted-foreground">
        Retry one or two now. If the same topic keeps showing up, skim its
        quick sheet before the next attempt.
      </p>
    </TutorCard>
  );
}

// --- Today's Plan tutor note ---
export function PlanTutorNote({ focusTopic }: { focusTopic?: string }) {
  if (!focusTopic) return null;
  return (
    <p className="mt-3 text-[11px] leading-snug text-muted-foreground italic">
      Today&apos;s plan focuses on <span className="text-foreground/90 font-medium not-italic">{focusTopic}</span>{" "}
      because it&apos;s both high-yield and currently costing you points — one of
      the fastest places to improve.
    </p>
  );
}

// --- Sprint summary tutor card ---
export function SprintTutorSummary({
  avgScorePct,
  weakestTopicLabel,
  improvedTopicLabel,
  chapterId,
}: {
  avgScorePct: number;
  weakestTopicLabel?: string;
  improvedTopicLabel?: string;
  chapterId: string;
}) {
  const good = avgScorePct >= 70;
  const sheet = quickSheetFor(weakestTopicLabel);
  return (
    <TutorCard
      tone={good ? "good" : "warn"}
      title={
        good
          ? "Strong sprint — your readiness on this is moving."
          : "Good information, not bad news."
      }
    >
      <p>
        {improvedTopicLabel ? (
          <>
            You improved on{" "}
            <span className="font-semibold">{improvedTopicLabel}</span>
            {weakestTopicLabel ? (
              <>
                , but{" "}
                <span className="font-semibold">{weakestTopicLabel}</span>{" "}
                still needs one more pass.
              </>
            ) : (
              "."
            )}
          </>
        ) : weakestTopicLabel ? (
          <>
            <span className="font-semibold">{weakestTopicLabel}</span> is where
            the points are still leaking — that&apos;s the next target.
          </>
        ) : (
          "You worked the full set — that effort compounds."
        )}
      </p>
      <div>
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Do this next
        </p>
        <ul className="mt-1.5 space-y-1.5">
          {sheet && (
            <li className="flex items-start gap-2">
              <BookOpen className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <Link to={sheet.href} className="text-primary hover:underline">
                Review the {sheet.title}
              </Link>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <Link
              to="/sprint/$chapterId"
              params={{ chapterId }}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Run one short rescue sprint <ArrowRight className="h-3 w-3" />
            </Link>
          </li>
        </ul>
      </div>
    </TutorCard>
  );
}

// --- Study-first nudge (in-question, pre-attempt) ---
export function StudyFirstNudge({
  topicLabel,
  chapterId,
}: {
  topicLabel?: string | null;
  chapterId: string;
}) {
  const sheet = quickSheetFor(topicLabel);
  if (!sheet) return null;
  return (
    <TutorCard title="Before doing more questions, review this skill first.">
      <p>
        You&apos;ll get more out of the next sprint if the rule is fresh. This
        isn&apos;t a setback — it&apos;s the smarter order.
      </p>
      <div className="flex flex-wrap gap-2">
        <Link to={sheet.href} className="btn-primary">
          <BookOpen className="h-3.5 w-3.5" /> {sheet.title}
        </Link>
        <Link
          to="/sprint/$chapterId"
          params={{ chapterId }}
          className="btn-ghost"
        >
          <Sparkles className="h-3.5 w-3.5" /> Rescue sprint
        </Link>
      </div>
    </TutorCard>
  );
}
