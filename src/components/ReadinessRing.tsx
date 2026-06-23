import type { ReactNode } from "react";

type Props = {
  value: number; // 0-100
  size?: number;
  stroke?: number;
  color?: string; // CSS color (var(...) ok)
  trackOpacity?: number;
  children?: ReactNode;
  label?: string;
};

export function ReadinessRing({
  value,
  size = 120,
  stroke = 10,
  color = "var(--color-primary)",
  trackOpacity = 0.15,
  children,
  label,
}: Props) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? `${v}%`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeOpacity={trackOpacity}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease, stroke 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        {children ?? (
          <span className="font-display font-semibold text-xl">{Math.round(v)}%</span>
        )}
      </div>
    </div>
  );
}
