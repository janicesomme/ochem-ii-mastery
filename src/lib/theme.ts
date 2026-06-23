// Local theme toggle. Default = dark.
const KEY = "nofear-ochem2-theme-v1";
export type Theme = "dark" | "light";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = localStorage.getItem(KEY);
  return v === "light" ? "light" : "dark";
}

export function setTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  applyTheme(t);
  window.dispatchEvent(new Event("theme-updated"));
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}
