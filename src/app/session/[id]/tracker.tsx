"use client";

import { recordThrow, undoLastThrow } from "@/lib/actions/session";

const colors: Record<number, string> = {
  0: "bg-green-600 active:bg-green-700",
  1: "bg-red-600 active:bg-red-700",
};

export function ThrowTracker({ sessionId, statuses }: { sessionId: string; statuses: string[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((status, i) => (
          <button
            key={status}
            onClick={() => recordThrow(sessionId, status)}
            className={`p-6 rounded-xl text-xl font-bold ${colors[i] || "bg-gray-600 active:bg-gray-700"}`}
          >
            {status}
          </button>
        ))}
      </div>
      <button
        onClick={() => undoLastThrow(sessionId)}
        className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400"
      >
        ↩ Annulla ultimo
      </button>
    </div>
  );
}
