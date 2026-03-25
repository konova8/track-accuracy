"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type ThrowPoint = { status: string; color: string; time: string; session: string };

const SVG_COLORS: Record<string, string> = {
  green: "#16a34a", red: "#dc2626", yellow: "#ca8a04", blue: "#2563eb", gray: "#6b7280",
};

export function ThrowsChart({ data }: { data: ThrowPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{ startX: number; startPan: number } | null>(null);

  if (data.length === 0) return <p className="text-gray-500 text-center">Nessun tiro registrato.</p>;

  const pad = 30;
  const h = 120;
  const baseW = 350;
  const innerW = Math.max(baseW, data.length * 12) * zoom;
  const w = innerW + pad * 2;

  const points = data.map((d, i) => ({
    x: pad + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2),
    y: h / 2,
    ...d,
  }));

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) {
      const el = containerRef.current;
      if (el) el.scrollLeft = dragRef.current.startPan - (e.clientX - dragRef.current.startX);
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (el) dragRef.current = { startX: e.clientX, startPan: el.scrollLeft };
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape) and (max-height: 500px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsLandscape(e.matches);
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400">Andamento tiri</h3>
        <div className="flex gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.5, z / 1.5))} className="px-2 py-0.5 text-xs bg-gray-700 rounded">−</button>
          <span className="text-xs text-gray-500 px-1">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(5, z * 1.5))} className="px-2 py-0.5 text-xs bg-gray-700 rounded">+</button>
        </div>
      </div>
      <div
        ref={containerRef}
        className={`overflow-x-auto touch-pan-x cursor-grab active:cursor-grabbing ${isLandscape ? "max-w-none" : ""}`}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => { dragRef.current = null; }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="min-w-full" style={{ width: w }}>
          <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="#374151" strokeWidth={1} />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill={SVG_COLORS[p.color] || SVG_COLORS.gray} />
          ))}
        </svg>
      </div>
    </div>
  );
}
