// Realistic mock student data shown on the Dashboard and Readiness pages
// when the user has not yet recorded real attempts. Once they answer
// a single question, real progress takes over.

import type { Chapter } from "./queries-types";
import { statusFor, type ChapterStat } from "./readiness";

export type DemoWeakSpot = {
  id: string;
  title: string;
  chapterId: string;
  readiness: number; // 0–100
  attempted: number;
  total: number;
};

export const DEMO_OVERALL = 61;
export const DEMO_TARGET = 80;
export const DEMO_DAYS = 12;
export const DEMO_COMPLETED = 68;
export const DEMO_TOTAL_QUESTIONS = 121;
export const DEMO_REVIEW = 18;
export const DEMO_PER_DAY = 9;

type ChapterSeed = {
  id: string;
  readiness: number;
  attempted: number;
  total: number;
  review: number;
  weakest: string;
};

const SEEDS: ChapterSeed[] = [
  { id: "ch-1", readiness: 82, attempted: 18, total: 22, review: 3, weakest: "SN2 vs SN1" },
  { id: "ch-2", readiness: 67, attempted: 14, total: 20, review: 5, weakest: "Alkyne reactions" },
  { id: "ch-3", readiness: 54, attempted: 11, total: 24, review: 7, weakest: "Electrophile generation" },
  { id: "ch-4", readiness: 73, attempted: 12, total: 16, review: 2, weakest: "Epoxide opening" },
  { id: "ch-5", readiness: 41, attempted: 8, total: 21, review: 9, weakest: "Acetal formation" },
  { id: "ch-6", readiness: 29, attempted: 5, total: 18, review: 10, weakest: "Acyl substitution reactivity" },
];

export function demoChapterStats(chapters: Chapter[]): ChapterStat[] {
  return chapters.map((ch) => {
    const seed = SEEDS.find((s) => s.id === ch.id);
    if (!seed) {
      return {
        ch,
        total: 0,
        attempted: 0,
        readiness: 0,
        progress: 0,
        reviewCount: 0,
        weakest: null,
        status: "untested" as const,
      };
    }
    return {
      ch,
      total: seed.total,
      attempted: seed.attempted,
      readiness: seed.readiness,
      progress: Math.round((seed.attempted / seed.total) * 100),
      reviewCount: seed.review,
      weakest: { title: seed.weakest, avg: (seed.readiness / 100) * 5 },
      status: statusFor(seed.readiness, seed.attempted),
    };
  });
}

export const DEMO_WEAK_SPOTS: DemoWeakSpot[] = [
  { id: "t-3a", title: "Electrophile generation", chapterId: "ch-3", readiness: 42, attempted: 6, total: 8 },
  { id: "t-3b", title: "Directing effects (o/p/m)", chapterId: "ch-3", readiness: 51, attempted: 5, total: 7 },
  { id: "t-3c", title: "Friedel-Crafts reactions", chapterId: "ch-3", readiness: 57, attempted: 4, total: 6 },
  { id: "t-3d", title: "Multistep aromatic synthesis", chapterId: "ch-3", readiness: 46, attempted: 3, total: 6 },
  { id: "t-5a", title: "Nucleophilic addition", chapterId: "ch-5", readiness: 71, attempted: 5, total: 7 },
  { id: "t-6a", title: "Carboxylic acid derivatives", chapterId: "ch-6", readiness: 38, attempted: 4, total: 9 },
];

export const DEMO_REVIEW_PREVIEW: {
  id: string;
  title: string;
  chapter_id: string;
  reason: string;
  tone: "danger" | "warn";
}[] = [
  { id: "q-12", title: "Acyl substitution reactivity order", chapter_id: "ch-6", reason: "missed", tone: "danger" },
  { id: "q-9", title: "Friedel-Crafts on nitrobenzene", chapter_id: "ch-3", reason: "used solution", tone: "danger" },
  { id: "q-10", title: "Multistep aromatic synthesis order", chapter_id: "ch-3", reason: "2 hints", tone: "warn" },
  { id: "q-8", title: "Generating the nitronium electrophile", chapter_id: "ch-3", reason: "low score", tone: "warn" },
  { id: "q-4", title: "Hydration of a terminal alkyne", chapter_id: "ch-2", reason: "low score", tone: "warn" },
];

export const DEMO_IMPROVEMENTS: string[] = [
  "Directing effects improved from 38% to 52% this week.",
  "You cut carbonyl review items from 12 to 9.",
  "Best recent chapter: Alcohols, Ethers & Epoxides.",
];
