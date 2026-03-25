export type ParsedStatus = { name: string; color: string };

export function parseStatuses(raw: string): ParsedStatus[] {
  return raw.split(",").map((s) => {
    const [name, color] = s.trim().split(":");
    return { name: name || s.trim(), color: color || "gray" };
  });
}

export const COLOR_CLASSES: Record<string, string> = {
  green: "bg-green-600 active:bg-green-700",
  red: "bg-red-600 active:bg-red-700",
  yellow: "bg-yellow-600 active:bg-yellow-700",
  blue: "bg-blue-600 active:bg-blue-700",
  gray: "bg-gray-600 active:bg-gray-700",
};
