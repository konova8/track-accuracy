"use client";

import { useRef, useState, useCallback, useEffect } from "react";

type ThrowPoint = { status: string; color: string; time: string; session: string };

const SVG_COLORS: Record<string, string> = {
  green: "#16a34a", red: "#dc2626", yellow: "#ca8a04", blue: "#2563eb", gray: "#6b7280",
};

export function ThrowsChart({ data }: { data: ThrowPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
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

  // Find nearest point to cursor
  const findNearest = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const scrollX = el.scrollLeft;
    const svgX = ((clientX - rect.left + scrollX) / rect.width) * w;
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const dist = Math.abs(points[i].x - svgX);
      if (dist < bestDist) { bestDist = dist; best = i; }
    }
    return bestDist < 30 * zoom ? best : null;
  }, [points, w, zoom]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.startX;
      const el = containerRef.current;
      if (el) el.scrollLeft = dragRef.current.startPan - dx;
      return;
    }
    setHover(findNearest(e.clientX));
  }, [findNearest]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = containerRef.current;
    if (el) dragRef.current = { startX: e.clientX, startPan: el.scrollLeft };
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Landscape detection for full-width
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
        onPointerLeave={() => { setHover(null); dragRef.current = null; }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="min-w-full" style={{ width: w }}>
          {/* timeline line */}
          <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke="#374151" strokeWidth={1} />

          {points.map((p, i) => {
            const isHovered = hover === i;
            const r = isHovered ? 10 : 4;
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={r} fill={SVG_COLORS[p.color] || SVG_COLORS.gray}
                  stroke={isHovered ? "white" : "none"} strokeWidth={isHovered ? 2 : 0}
                  style={{ transition: "r 0.15s, stroke-width 0.15s" }} />
                {isHovered && (
                  <g>
                    <rect x={p.x - 50} y={4} width={100} height={36} rx={4} fill="#1f2937" stroke="#4b5563" strokeWidth={0.5} />
                    <text x={p.x} y={18} textAnchor="middle" fill="white" fontSize={9} fontWeight="bold">{p.status}</text>
                    <text x={p.x} y={28} textAnchor="middle" fill="#9ca3af" fontSize={7}>{p.session}</text>
                    <text x={p.x} y={37} textAnchor="middle" fill="#6b7280" fontSize={6}>
                      {new Date(p.time).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
