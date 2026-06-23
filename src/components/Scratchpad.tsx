import { useEffect, useRef, useState } from "react";
import { Eraser, Pencil, RotateCcw, Trash2 } from "lucide-react";

type Props = {
  value?: string | null; // restored data URL
  onChange?: (dataUrl: string | null) => void;
  height?: number;
};

type Stroke = {
  color: string;
  size: number;
  points: { x: number; y: number }[];
};

const COLORS = ["#e2e8f0", "#22d3ee", "#f59e0b", "#f87171", "#a78bfa"];

export function Scratchpad({ value, onChange, height = 280 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(2.5);
  const [drawing, setDrawing] = useState(false);
  const drewRef = useRef(false);

  // Resize canvas to container (HiDPI safe)
  useEffect(() => {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    if (!c || !wrap) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      c.width = w * dpr;
      c.height = height * dpr;
      c.style.width = `${w}px`;
      c.style.height = `${height}px`;
      const ctx = c.getContext("2d");
      ctx?.scale(dpr, dpr);
      redraw();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  // Hydrate from value once
  useEffect(() => {
    if (!value || drewRef.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const img = new Image();
    img.onload = () => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, c.clientWidth, c.clientHeight);
    };
    img.src = value;
  }, [value]);

  function redraw() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
    for (const s of strokes) drawStroke(ctx, s);
  }

  function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
    if (s.points.length === 0) return;
    ctx.strokeStyle = s.color;
    ctx.lineWidth = s.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(s.points[0].x, s.points[0].y);
    for (let i = 1; i < s.points.length; i++) {
      ctx.lineTo(s.points[i].x, s.points[i].y);
    }
    ctx.stroke();
  }

  function getPos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrawing(true);
    drewRef.current = true;
    const p = getPos(e);
    setStrokes((prev) => [...prev, { color, size, points: [p] }]);
  }

  function move(e: React.PointerEvent) {
    if (!drawing) return;
    const p = getPos(e);
    setStrokes((prev) => {
      const next = prev.slice();
      const cur = next[next.length - 1];
      cur.points.push(p);
      const ctx = canvasRef.current!.getContext("2d")!;
      ctx.strokeStyle = cur.color;
      ctx.lineWidth = cur.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const n = cur.points.length;
      ctx.beginPath();
      ctx.moveTo(cur.points[n - 2].x, cur.points[n - 2].y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      return next;
    });
  }

  function end() {
    if (!drawing) return;
    setDrawing(false);
    emit();
  }

  function emit() {
    const c = canvasRef.current;
    if (!c || !onChange) return;
    onChange(strokes.length === 0 ? null : c.toDataURL("image/png"));
  }

  function undo() {
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      // redraw next tick
      requestAnimationFrame(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        ctx?.clearRect(0, 0, c.clientWidth, c.clientHeight);
        next.forEach((s) => drawStroke(ctx!, s));
        onChange?.(next.length === 0 ? null : c.toDataURL("image/png"));
      });
      return next;
    });
  }

  function clear() {
    setStrokes([]);
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      ctx?.clearRect(0, 0, c.clientWidth, c.clientHeight);
    }
    onChange?.(null);
  }

  return (
    <div className="rounded-md border border-input bg-surface p-2">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Pencil className="h-3.5 w-3.5" /> Scratchpad
        </span>
        <div className="flex items-center gap-1 ml-1">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`color ${c}`}
              className={`h-5 w-5 rounded-full border ${
                color === c ? "ring-2 ring-primary border-primary" : "border-border"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>
        <label className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
          Size
          <input
            type="range"
            min={1}
            max={8}
            step={0.5}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20"
          />
        </label>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-secondary disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Undo
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={strokes.length === 0}
            className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs hover:bg-secondary disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>
      <div
        ref={wrapRef}
        className="relative rounded bg-[color:var(--color-muted,#0b0f17)]/40 border border-dashed border-border"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          className="block w-full h-full touch-none cursor-crosshair"
        />
        {strokes.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eraser className="h-3.5 w-3.5" />
              Draw arrows, intermediates, products — anything to commit before peeking.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
