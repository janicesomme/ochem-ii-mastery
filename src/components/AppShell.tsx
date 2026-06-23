import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  FlaskConical,
  ListChecks,
  Moon,
  Repeat,
  Sun,
  TrendingUp,
  Layers,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getTheme, toggleTheme, type Theme } from "@/lib/theme";

const navItems = [
  { to: "/", label: "Dashboard", icon: FlaskConical },
  { to: "/question-bank", label: "Question Bank", icon: Layers },
  { to: "/quick-sheets", label: "Quick Sheets", icon: BookOpen },
  { to: "/review", label: "Review", icon: Repeat },
  { to: "/progress", label: "Readiness", icon: TrendingUp },
] as const;

function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("dark");
  useEffect(() => {
    setThemeState(getTheme());
    const h = () => setThemeState(getTheme());
    window.addEventListener("theme-updated", h);
    return () => window.removeEventListener("theme-updated", h);
  }, []);
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface/60 text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <header className="border-b border-border bg-background/70 backdrop-blur-xl sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/30">
              N
            </span>

            <span className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">No-Fear Ochem II</span>
              <span className="text-[11px] text-muted-foreground">Study command center</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1 text-sm">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  activeProps={{
                    className:
                      "px-3 py-1.5 rounded-md bg-primary/15 text-primary border border-primary/30 font-semibold inline-flex items-center gap-1.5",
                  }}
                  inactiveProps={{
                    className:
                      "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 inline-flex items-center gap-1.5 border border-transparent",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{label}</span>
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 sm:px-6 py-8 text-xs text-muted-foreground flex items-center gap-2">
        <ListChecks className="h-3.5 w-3.5" />
        90% questions. Just enough help to get unstuck.
      </footer>
    </div>
  );
}

export function DifficultyChip({ d }: { d: "easy" | "medium" | "hard" }) {
  const cls =
    d === "easy" ? "chip chip-success" : d === "medium" ? "chip chip-warn" : "chip chip-danger";
  return <span className={cls}>{d}</span>;
}

export function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="chip">unattempted</span>;
  if (score === 5) return <span className="chip chip-success">5 · solved</span>;
  if (score === 3) return <span className="chip chip-accent">3 · with hint</span>;
  if (score === 1) return <span className="chip chip-warn">1 · used solution</span>;
  return <span className="chip chip-danger">0 · missed</span>;
}
