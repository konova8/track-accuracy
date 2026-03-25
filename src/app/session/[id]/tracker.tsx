"use client";

import { useOptimistic, useTransition } from "react";
import { recordThrow, undoLastThrow, deleteSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import type { ParsedStatus } from "@/lib/statuses";
import { COLOR_CLASSES } from "@/lib/statuses";

type ThrowEntry = { id: string; status: string; time: string };

type TrackerProps = {
  sessionId: string;
  statuses: ParsedStatus[];
  initialCounts: Record<string, number>;
  initialTotal: number;
  initialAccuracy: number;
  initialThrows: ThrowEntry[];
};

type OptimisticState = {
  counts: Record<string, number>;
  total: number;
  accuracy: number;
  throws: ThrowEntry[];
};

function calcAcc(statuses: ParsedStatus[], counts: Record<string, number>, total: number) {
  if (total === 0) return 0;
  const hits = statuses.filter((s) => s.weight === 1).reduce((a, s) => a + (counts[s.name] || 0), 0);
  return Math.round((hits / total) * 100);
}

export function ThrowTracker({ sessionId, statuses, initialCounts, initialTotal, initialAccuracy, initialThrows }: TrackerProps) {
  const [isPending, startTransition] = useTransition();

  const [state, addOptimistic] = useOptimistic(
    { counts: initialCounts, total: initialTotal, accuracy: initialAccuracy, throws: initialThrows } as OptimisticState,
    (prev, action: { type: "add"; status: string } | { type: "undo" }) => {
      if (action.type === "add") {
        const next = { ...prev.counts, [action.status]: (prev.counts[action.status] || 0) + 1 };
        const total = prev.total + 1;
        return {
          counts: next,
          total,
          accuracy: calcAcc(statuses, next, total),
          throws: [{ id: `opt-${Date.now()}`, status: action.status, time: new Date().toISOString() }, ...prev.throws].slice(0, 20),
        };
      }
      // undo
      if (prev.throws.length === 0) return prev;
      const removed = prev.throws[0];
      const next = { ...prev.counts, [removed.status]: Math.max(0, (prev.counts[removed.status] || 0) - 1) };
      const total = Math.max(0, prev.total - 1);
      return {
        counts: next,
        total,
        accuracy: calcAcc(statuses, next, total),
        throws: prev.throws.slice(1),
      };
    }
  );

  function handleThrow(status: string) {
    startTransition(async () => {
      addOptimistic({ type: "add", status });
      await recordThrow(sessionId, status);
    });
  }

  function handleUndo() {
    startTransition(async () => {
      addOptimistic({ type: "undo" });
      await undoLastThrow(sessionId);
    });
  }

  return (
    <>
      <div className="text-center space-y-1">
        <div className="text-5xl font-bold">{state.accuracy}%</div>
        <div className="text-gray-400">{state.total} tiri totali</div>
        <div className="flex justify-center gap-4 text-sm">
          {statuses.map((s) => (
            <span key={s.name}>{s.name}: {state.counts[s.name] || 0}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {statuses.map((s) => (
            <button
              key={s.name}
              onClick={() => handleThrow(s.name)}
              className={`p-6 rounded-xl text-xl font-bold ${COLOR_CLASSES[s.color] || COLOR_CLASSES.gray}`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <button
          onClick={handleUndo}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400"
        >
          ↩ Annulla ultimo
        </button>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-400">Ultimi tiri</h3>
        {state.throws.map((t) => (
          <div key={t.id} className="text-xs text-gray-500 flex justify-between">
            <span>{t.status}</span>
            <span>{new Date(t.time).toLocaleTimeString("it-IT")}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Sei sicuro di voler eliminare questa sessione?")) return;
    await deleteSession(sessionId);
    router.push("/");
  }

  return (
    <button onClick={handleDelete} className="w-full p-2 rounded-lg bg-red-900 border border-red-700 text-sm text-red-300">
      🗑 Elimina sessione
    </button>
  );
}
