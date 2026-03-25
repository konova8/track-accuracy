export type ParsedStatus = { name: string; color: string; weight: number };

export function parseStatuses(raw: string): ParsedStatus[] {
  return raw.split(",").map((s) => {
    const parts = s.trim().split(":");
    return {
      name: parts[0] || s.trim(),
      color: parts[1] || "gray",
      weight: parts[2] !== undefined ? parseFloat(parts[2]) : 0,
    };
  });
}

export function calcAccuracy(statuses: ParsedStatus[], throws: { status: string }[]): number {
  if (throws.length === 0) return 0;
  const successNames = new Set(statuses.filter((s) => s.weight === 1).map((s) => s.name));
  const hits = throws.filter((t) => successNames.has(t.status)).length;
  return Math.round((hits / throws.length) * 100);
}

export const COLOR_CLASSES: Record<string, string> = {
  green: "bg-green-600 active:bg-green-700",
  red: "bg-red-600 active:bg-red-700",
  yellow: "bg-yellow-600 active:bg-yellow-700",
  blue: "bg-blue-600 active:bg-blue-700",
  gray: "bg-gray-600 active:bg-gray-700",
};
