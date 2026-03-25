"use client";

type DataPoint = { name: string; date: string; accuracy: number; total: number; hits: number };

export function StatsChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) return <p className="text-gray-500 text-center">Nessun dato ancora.</p>;

  const w = 350, h = 180, pad = 30;
  const maxY = 100;
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - d.accuracy / maxY) * (h - pad * 2),
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Accuracy nel tempo</h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {[0, 25, 50, 75, 100].map((v) => {
          const y = pad + (1 - v / maxY) * (h - pad * 2);
          return (
            <g key={v}>
              <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#374151" strokeWidth={0.5} />
              <text x={pad - 4} y={y + 3} textAnchor="end" fill="#6b7280" fontSize={8}>{v}%</text>
            </g>
          );
        })}
        <path d={line} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
        ))}
        {data.length <= 10 && points.map((p, i) => (
          <text key={`l${i}`} x={p.x} y={h - 4} textAnchor="middle" fill="#6b7280" fontSize={7}>
            {data[i].date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
}
