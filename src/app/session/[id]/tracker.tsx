"use client";

import { recordThrow, undoLastThrow, deleteSession } from "@/lib/actions/session";
import { useRouter } from "next/navigation";
import type { ParsedStatus } from "@/lib/statuses";
import { COLOR_CLASSES } from "@/lib/statuses";

export function ThrowTracker({ sessionId, statuses }: { sessionId: string; statuses: ParsedStatus[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s) => (
          <button
            key={s.name}
            onClick={() => recordThrow(sessionId, s.name)}
            className={`p-6 rounded-xl text-xl font-bold ${COLOR_CLASSES[s.color] || COLOR_CLASSES.gray}`}
          >
            {s.name}
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
