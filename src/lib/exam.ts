// Local exam settings — swap to Supabase later.
const KEY = "nofear-ochem2-exam-v1";

export type ExamSettings = {
  date: string | null; // YYYY-MM-DD
  targetReadiness: number; // 0-100
};

const DEFAULTS: ExamSettings = { date: null, targetReadiness: 80 };

export function getExam(): ExamSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return DEFAULTS;
  }
}

export function setExam(next: Partial<ExamSettings>) {
  const merged = { ...getExam(), ...next };
  localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event("exam-updated"));
}

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  const target = new Date(date + "T23:59:59").getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
